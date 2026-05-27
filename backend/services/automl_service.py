from __future__ import annotations

import io
import threading
import time
import uuid
from copy import deepcopy
from dataclasses import asdict
from pathlib import Path
from typing import Any, Callable

import joblib
import matplotlib
import numpy as np
import optuna
import pandas as pd
import seaborn as sns
from fastapi import HTTPException, UploadFile
from sklearn.base import clone
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import ExtraTreesClassifier, ExtraTreesRegressor, GradientBoostingClassifier, GradientBoostingRegressor, RandomForestClassifier, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_score,
    r2_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, StandardScaler, label_binarize
from sklearn.svm import SVC, SVR
from sklearn.neural_network import MLPClassifier, MLPRegressor

from services.report_service import generate_pdf_report
from services.storage import ExperimentState

matplotlib.use("Agg")
import matplotlib.pyplot as plt

try:  # Optional dependency; the backend works without it.
    from xgboost import XGBClassifier, XGBRegressor
except Exception:  # pragma: no cover
    XGBClassifier = None
    XGBRegressor = None


PROJECT_ROOT = Path(__file__).resolve().parents[2]
ARTIFACTS_DIR = PROJECT_ROOT / "artifacts" / "backend"
UPLOADS_DIR = ARTIFACTS_DIR / "uploads"
MODELS_DIR = ARTIFACTS_DIR / "models"
PLOTS_DIR = ARTIFACTS_DIR / "plots"
REPORTS_DIR = ARTIFACTS_DIR / "reports"

for directory in [UPLOADS_DIR, MODELS_DIR, PLOTS_DIR, REPORTS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)


def _jsonable(value: Any) -> Any:
    if isinstance(value, (np.integer, np.floating)):
        return value.item()
    if isinstance(value, (pd.Timestamp,)):
        return value.isoformat()
    if isinstance(value, np.ndarray):
        return value.tolist()
    return value


def _safe_feature_encoder() -> OneHotEncoder:
    try:
        return OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    except TypeError:  # pragma: no cover
        return OneHotEncoder(handle_unknown="ignore", sparse=False)


def _primary_metric(task_type: str) -> str:
    return "accuracy" if task_type == "classification" else "r2"


def _detect_target_column(df: pd.DataFrame) -> str:
    preferred = [
        column
        for column in df.columns
        if column.lower() in {"target", "label", "class", "outcome", "y", "price", "saleprice", "churn", "response"}
    ]
    if preferred:
        return preferred[0]
    return df.columns[-1]


def _detect_task_type(y: pd.Series) -> str:
    if y.dtype == "object" or str(y.dtype).startswith("category") or y.nunique() <= max(20, int(len(y) * 0.05)):
        return "classification"
    return "regression"


def _dataset_health_score(df: pd.DataFrame) -> float:
    missing_ratio = df.isna().mean().mean()
    duplicate_ratio = df.duplicated().mean()
    sparsity_penalty = 0.0 if df.shape[1] == 0 else float((df.nunique(dropna=False) <= 1).mean())
    score = 100.0 - (missing_ratio * 55.0) - (duplicate_ratio * 15.0) - (sparsity_penalty * 20.0)
    return round(max(10.0, min(100.0, score)), 2)


def _build_preprocessor(X: pd.DataFrame) -> tuple[ColumnTransformer, list[str], list[str]]:
    numeric_columns = X.select_dtypes(include=[np.number]).columns.tolist()
    categorical_columns = [column for column in X.columns if column not in numeric_columns]

    transformers = []
    if numeric_columns:
        transformers.append(
            (
                "numeric",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="median")),
                        ("scaler", StandardScaler()),
                    ]
                ),
                numeric_columns,
            )
        )

    if categorical_columns:
        transformers.append(
            (
                "categorical",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        ("encoder", _safe_feature_encoder()),
                    ]
                ),
                categorical_columns,
            )
        )

    preprocessor = ColumnTransformer(transformers=transformers, remainder="drop")
    return preprocessor, numeric_columns, categorical_columns


def _build_pipeline(preprocessor: ColumnTransformer, estimator: Any) -> Pipeline:
    return Pipeline([("preprocessor", preprocessor), ("model", estimator)])


def _classification_models() -> dict[str, Callable[[], Any]]:
    models = {
        "Logistic Regression": lambda: LogisticRegression(max_iter=2000),
        "Random Forest": lambda: RandomForestClassifier(n_estimators=180, random_state=42, n_jobs=-1),
        "Extra Trees": lambda: ExtraTreesClassifier(n_estimators=220, random_state=42, n_jobs=-1),
        "Gradient Boosting": lambda: GradientBoostingClassifier(random_state=42),
        "SVM": lambda: SVC(probability=True, kernel="rbf", C=2.0, gamma="scale", random_state=42),
        "KNN": lambda: KNeighborsClassifier(n_neighbors=7),
        "Naive Bayes": lambda: GaussianNB(),
        "MLPClassifier": lambda: MLPClassifier(hidden_layer_sizes=(128, 64), max_iter=900, random_state=42),
    }
    if XGBClassifier is not None:
        models["XGBoost"] = lambda: XGBClassifier(
            n_estimators=220,
            learning_rate=0.08,
            max_depth=5,
            subsample=0.9,
            colsample_bytree=0.9,
            eval_metric="logloss",
            random_state=42,
            tree_method="hist",
        )
    return models


def _regression_models() -> dict[str, Callable[[], Any]]:
    models = {
        "Linear Regression": lambda: LinearRegression(),
        "Random Forest Regressor": lambda: RandomForestRegressor(n_estimators=220, random_state=42, n_jobs=-1),
        "Extra Trees Regressor": lambda: ExtraTreesRegressor(n_estimators=240, random_state=42, n_jobs=-1),
        "Gradient Boosting Regressor": lambda: GradientBoostingRegressor(random_state=42),
        "SVR": lambda: SVR(C=10.0, kernel="rbf"),
        "KNN Regressor": lambda: KNeighborsRegressor(n_neighbors=7),
        "MLPRegressor": lambda: MLPRegressor(hidden_layer_sizes=(128, 64), max_iter=1200, random_state=42),
    }
    if XGBRegressor is not None:
        models["XGBoost Regressor"] = lambda: XGBRegressor(
            n_estimators=250,
            learning_rate=0.08,
            max_depth=5,
            subsample=0.9,
            colsample_bytree=0.9,
            objective="reg:squarederror",
            random_state=42,
            tree_method="hist",
        )
    return models


def _classification_tuning_space(trial: optuna.Trial, model_name: str) -> Any:
    if model_name == "Logistic Regression":
        return LogisticRegression(
            C=trial.suggest_float("C", 0.05, 20.0, log=True),
            max_iter=3000,
        )
    if model_name == "Random Forest":
        return RandomForestClassifier(
            n_estimators=trial.suggest_int("n_estimators", 120, 360),
            max_depth=trial.suggest_int("max_depth", 3, 16),
            min_samples_split=trial.suggest_int("min_samples_split", 2, 12),
            random_state=42,
            n_jobs=-1,
        )
    if model_name == "Extra Trees":
        return ExtraTreesClassifier(
            n_estimators=trial.suggest_int("n_estimators", 120, 360),
            max_depth=trial.suggest_int("max_depth", 3, 16),
            min_samples_split=trial.suggest_int("min_samples_split", 2, 12),
            random_state=42,
            n_jobs=-1,
        )
    if model_name == "Gradient Boosting":
        return GradientBoostingClassifier(
            n_estimators=trial.suggest_int("n_estimators", 80, 240),
            learning_rate=trial.suggest_float("learning_rate", 0.01, 0.2),
            max_depth=trial.suggest_int("max_depth", 2, 6),
            random_state=42,
        )
    if model_name == "SVM":
        return SVC(
            probability=True,
            C=trial.suggest_float("C", 0.1, 20.0, log=True),
            gamma=trial.suggest_float("gamma", 0.0005, 0.1, log=True),
            kernel=trial.suggest_categorical("kernel", ["rbf", "linear"]),
            random_state=42,
        )
    if model_name == "KNN":
        return KNeighborsClassifier(
            n_neighbors=trial.suggest_int("n_neighbors", 3, 19),
            weights=trial.suggest_categorical("weights", ["uniform", "distance"]),
        )
    if model_name == "Naive Bayes":
        return GaussianNB()
    if model_name == "MLPClassifier":
        return MLPClassifier(
            hidden_layer_sizes=trial.suggest_categorical("hidden_layer_sizes", [(64,), (128,), (128, 64), (256, 128)]),
            alpha=trial.suggest_float("alpha", 1e-5, 1e-2, log=True),
            learning_rate_init=trial.suggest_float("learning_rate_init", 1e-4, 1e-2, log=True),
            max_iter=1200,
            random_state=42,
        )
    if model_name == "XGBoost" and XGBClassifier is not None:
        return XGBClassifier(
            n_estimators=trial.suggest_int("n_estimators", 120, 400),
            learning_rate=trial.suggest_float("learning_rate", 0.01, 0.2),
            max_depth=trial.suggest_int("max_depth", 3, 8),
            subsample=trial.suggest_float("subsample", 0.7, 1.0),
            colsample_bytree=trial.suggest_float("colsample_bytree", 0.7, 1.0),
            eval_metric="logloss",
            random_state=42,
            tree_method="hist",
        )
    raise ValueError(f"Unsupported classification model: {model_name}")


def _regression_tuning_space(trial: optuna.Trial, model_name: str) -> Any:
    if model_name == "Linear Regression":
        return LinearRegression()
    if model_name == "Random Forest Regressor":
        return RandomForestRegressor(
            n_estimators=trial.suggest_int("n_estimators", 120, 360),
            max_depth=trial.suggest_int("max_depth", 3, 16),
            min_samples_split=trial.suggest_int("min_samples_split", 2, 12),
            random_state=42,
            n_jobs=-1,
        )
    if model_name == "Extra Trees Regressor":
        return ExtraTreesRegressor(
            n_estimators=trial.suggest_int("n_estimators", 120, 360),
            max_depth=trial.suggest_int("max_depth", 3, 16),
            min_samples_split=trial.suggest_int("min_samples_split", 2, 12),
            random_state=42,
            n_jobs=-1,
        )
    if model_name == "Gradient Boosting Regressor":
        return GradientBoostingRegressor(
            n_estimators=trial.suggest_int("n_estimators", 80, 240),
            learning_rate=trial.suggest_float("learning_rate", 0.01, 0.2),
            max_depth=trial.suggest_int("max_depth", 2, 6),
            random_state=42,
        )
    if model_name == "SVR":
        return SVR(
            C=trial.suggest_float("C", 0.1, 20.0, log=True),
            gamma=trial.suggest_float("gamma", 0.0005, 0.1, log=True),
            kernel=trial.suggest_categorical("kernel", ["rbf", "linear"]),
        )
    if model_name == "KNN Regressor":
        return KNeighborsRegressor(
            n_neighbors=trial.suggest_int("n_neighbors", 3, 19),
            weights=trial.suggest_categorical("weights", ["uniform", "distance"]),
        )
    if model_name == "MLPRegressor":
        return MLPRegressor(
            hidden_layer_sizes=trial.suggest_categorical("hidden_layer_sizes", [(64,), (128,), (128, 64), (256, 128)]),
            alpha=trial.suggest_float("alpha", 1e-5, 1e-2, log=True),
            learning_rate_init=trial.suggest_float("learning_rate_init", 1e-4, 1e-2, log=True),
            max_iter=1400,
            random_state=42,
        )
    if model_name == "XGBoost Regressor" and XGBRegressor is not None:
        return XGBRegressor(
            n_estimators=trial.suggest_int("n_estimators", 120, 400),
            learning_rate=trial.suggest_float("learning_rate", 0.01, 0.2),
            max_depth=trial.suggest_int("max_depth", 3, 8),
            subsample=trial.suggest_float("subsample", 0.7, 1.0),
            colsample_bytree=trial.suggest_float("colsample_bytree", 0.7, 1.0),
            objective="reg:squarederror",
            random_state=42,
            tree_method="hist",
        )
    raise ValueError(f"Unsupported regression model: {model_name}")


def _classification_metrics(y_true: pd.Series, y_pred: np.ndarray, y_prob: np.ndarray | None = None) -> dict[str, float]:
    metrics: dict[str, float] = {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, average="weighted", zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, average="weighted", zero_division=0)),
        "f1": float(f1_score(y_true, y_pred, average="weighted", zero_division=0)),
    }
    if y_prob is not None:
        try:
            if len(np.unique(y_true)) > 2:
                metrics["roc_auc"] = float(roc_auc_score(y_true, y_prob, multi_class="ovr", average="weighted"))
            else:
                positive_prob = y_prob[:, 1] if y_prob.ndim > 1 and y_prob.shape[1] > 1 else y_prob.ravel()
                metrics["roc_auc"] = float(roc_auc_score(y_true, positive_prob))
        except Exception:
            metrics["roc_auc"] = 0.0
    else:
        metrics["roc_auc"] = 0.0
    return metrics


def _regression_metrics(y_true: pd.Series, y_pred: np.ndarray) -> dict[str, float]:
    mse = float(mean_squared_error(y_true, y_pred))
    return {
        "mae": float(mean_absolute_error(y_true, y_pred)),
        "mse": mse,
        "rmse": float(np.sqrt(mse)),
        "r2": float(r2_score(y_true, y_pred)),
    }


def _feature_importance(best_pipeline: Pipeline, X_test: pd.DataFrame, y_test: pd.Series, task_type: str) -> list[dict[str, Any]]:
    model = best_pipeline.named_steps["model"]
    preprocessor = best_pipeline.named_steps["preprocessor"]
    feature_names = list(preprocessor.get_feature_names_out())

    if hasattr(model, "feature_importances_"):
        values = np.asarray(model.feature_importances_, dtype=float)
    elif hasattr(model, "coef_"):
        coefficients = np.asarray(model.coef_, dtype=float)
        values = np.abs(coefficients).mean(axis=0) if coefficients.ndim > 1 else np.abs(coefficients)
    else:
        from sklearn.inspection import permutation_importance

        scoring = "accuracy" if task_type == "classification" else "r2"
        result = permutation_importance(best_pipeline, X_test, y_test, n_repeats=5, random_state=42, scoring=scoring)
        values = np.asarray(result.importances_mean, dtype=float)

    if len(values) != len(feature_names):
        values = np.resize(values, len(feature_names))

    ranking = sorted(
        ({"feature": feature_name, "importance": float(abs(value))} for feature_name, value in zip(feature_names, values)),
        key=lambda item: item["importance"],
        reverse=True,
    )
    return ranking[:12]


class AutoMLService:
    def __init__(self) -> None:
        self.state = ExperimentState(experiment_id=uuid.uuid4().hex)
        self._training_thread: threading.Thread | None = None

    def upload_dataset(self, file: UploadFile, target_column: str | None = None) -> dict[str, Any]:
        if not file.filename or not file.filename.lower().endswith(".csv"):
            raise HTTPException(status_code=400, detail="Only CSV uploads are supported.")

        raw_bytes = file.file.read()
        if not raw_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        try:
            dataframe = pd.read_csv(io.BytesIO(raw_bytes))
        except Exception as exc:  # pragma: no cover
            raise HTTPException(status_code=400, detail=f"Unable to parse CSV: {exc}") from exc

        if dataframe.empty:
            raise HTTPException(status_code=400, detail="CSV file contains no rows.")

        selected_target = target_column if target_column in dataframe.columns else _detect_target_column(dataframe)
        task_type = _detect_task_type(dataframe[selected_target])
        numeric_columns = dataframe.drop(columns=[selected_target]).select_dtypes(include=[np.number]).columns.tolist()
        categorical_columns = [column for column in dataframe.columns if column not in numeric_columns and column != selected_target]

        column_stats = [
            {
                "column": column,
                "dtype": str(dataframe[column].dtype),
                "missing": int(dataframe[column].isna().sum()),
                "unique": int(dataframe[column].nunique(dropna=True)),
            }
            for column in dataframe.columns
        ]

        missing_summary = [
            {"column": column, "missing": int(count), "percent": round((count / len(dataframe)) * 100, 2)}
            for column, count in dataframe.isna().sum().items()
            if count > 0
        ]

        upload_path = UPLOADS_DIR / f"{uuid.uuid4().hex}_{Path(file.filename).name}"
        upload_path.write_bytes(raw_bytes)

        preview_rows = [
            {key: _jsonable(value) for key, value in record.items()}
            for record in dataframe.head(8).replace({np.nan: None}).to_dict(orient="records")
        ]

        with self.state.lock:
            self.state.experiment_id = uuid.uuid4().hex
            self.state.status = "uploaded"
            self.state.progress = 5
            self.state.logs = [
                f"Uploaded dataset: {file.filename}",
                f"Detected target column: {selected_target}",
                f"Auto-detected task: {task_type}",
            ]
            self.state.trial_history = []
            self.state.dataframe = dataframe
            self.state.uploaded_filename = file.filename
            self.state.target_column = selected_target
            self.state.task_type = task_type
            self.state.primary_metric = _primary_metric(task_type)
            self.state.leaderboard = []
            self.state.metrics = {}
            self.state.plots = []
            self.state.best_model_name = None
            self.state.best_params = {}
            self.state.model_path = None
            self.state.report_path = None
            self.state.updated_at = pd.Timestamp.utcnow().to_pydatetime()

        return {
            "experiment_id": self.state.experiment_id,
            "target_column": selected_target,
            "task_type": task_type,
            "row_count": int(dataframe.shape[0]),
            "column_count": int(dataframe.shape[1]),
            "dataset_health_score": _dataset_health_score(dataframe),
            "numeric_columns": numeric_columns,
            "categorical_columns": categorical_columns,
            "preview_rows": preview_rows,
            "column_stats": column_stats,
            "missing_summary": missing_summary,
        }

    def start_training(self, target_column: str | None = None, optuna_trials: int = 15) -> dict[str, str]:
        with self.state.lock:
            if self.state.dataframe is None:
                raise HTTPException(status_code=400, detail="Upload a dataset before training.")

            if self._training_thread and self._training_thread.is_alive():
                return {
                    "experiment_id": self.state.experiment_id,
                    "status": self.state.status,
                    "message": "Training is already running.",
                }

            if target_column and target_column in self.state.dataframe.columns:
                self.state.target_column = target_column

            self.state.status = "queued"
            self.state.progress = 10
            self.state.logs.append("Training job queued.")
            self.state.updated_at = pd.Timestamp.utcnow().to_pydatetime()

            self._training_thread = threading.Thread(
                target=self._train_background,
                kwargs={"optuna_trials": optuna_trials},
                daemon=True,
            )
            self._training_thread.start()

        return {
            "experiment_id": self.state.experiment_id,
            "status": self.state.status,
            "message": "Training started in the background.",
        }

    def _log(self, message: str, progress: int | None = None) -> None:
        with self.state.lock:
            self.state.logs.append(message)
            if progress is not None:
                self.state.progress = max(self.state.progress, min(99, progress))
            self.state.updated_at = pd.Timestamp.utcnow().to_pydatetime()

    def _train_background(self, optuna_trials: int) -> None:
        try:
            self._train(optuna_trials=optuna_trials)
        except Exception as exc:  # pragma: no cover
            with self.state.lock:
                self.state.status = "failed"
                self.state.logs.append(f"Training failed: {exc}")
                self.state.updated_at = pd.Timestamp.utcnow().to_pydatetime()

    def _train(self, optuna_trials: int) -> None:
        with self.state.lock:
            dataframe = self.state.dataframe.copy() if self.state.dataframe is not None else None
            target_column = self.state.target_column
            task_type = self.state.task_type

        if dataframe is None or target_column is None:
            raise HTTPException(status_code=400, detail="No dataset has been uploaded.")

        if target_column not in dataframe.columns:
            raise HTTPException(status_code=400, detail="Target column is missing from the uploaded dataset.")

        if task_type is None:
            task_type = _detect_task_type(dataframe[target_column])

        label_encoder: LabelEncoder | None = None
        if task_type == "classification":
            label_encoder = LabelEncoder()
            y = pd.Series(label_encoder.fit_transform(dataframe[target_column].astype(str)), index=dataframe.index, name=target_column)
        else:
            y = dataframe[target_column]

        self._log("Validating dataset and building preprocessing pipeline...", 15)
        X = dataframe.drop(columns=[target_column])

        stratify = y if task_type == "classification" and y.nunique() > 1 else None
        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=0.2,
            random_state=42,
            stratify=stratify,
        )

        preprocessor, _, _ = _build_preprocessor(X_train)
        model_factories = _classification_models() if task_type == "classification" else _regression_models()
        leaderboard_rows: list[dict[str, Any]] = []

        self._log(f"Training {len(model_factories)} candidate models...", 20)
        for index, (model_name, factory) in enumerate(model_factories.items(), start=1):
            model = factory()
            pipeline = _build_pipeline(preprocessor, model)
            pipeline.fit(X_train, y_train)

            predictions = pipeline.predict(X_test)
            if task_type == "classification":
                probabilities = None
                if hasattr(pipeline, "predict_proba"):
                    try:
                        probabilities = pipeline.predict_proba(X_test)
                    except Exception:
                        probabilities = None
                metrics = _classification_metrics(y_test, predictions, probabilities)
                score = metrics["accuracy"]
                metric_name = "accuracy"
            else:
                metrics = _regression_metrics(y_test, predictions)
                score = metrics["r2"]
                metric_name = "r2"

            leaderboard_rows.append(
                {
                    "model": model_name,
                    "score": round(float(score), 6),
                    "metrics": {key: round(float(value), 6) for key, value in metrics.items()},
                    "status": "complete",
                }
            )
            self._log(f"Finished {model_name} ({metric_name}={score:.4f})", 20 + int((index / max(1, len(model_factories))) * 35))

        leaderboard_rows.sort(key=lambda row: row["score"], reverse=True)
        best_candidate_name = leaderboard_rows[0]["model"]
        self._log(f"Best baseline model: {best_candidate_name}", 60)

        def objective(trial: optuna.Trial) -> float:
            if task_type == "classification":
                estimator = _classification_tuning_space(trial, best_candidate_name)
            else:
                estimator = _regression_tuning_space(trial, best_candidate_name)

            pipeline = _build_pipeline(preprocessor, estimator)
            pipeline.fit(X_train, y_train)
            preds = pipeline.predict(X_test)

            if task_type == "classification":
                probabilities = None
                if hasattr(pipeline, "predict_proba"):
                    try:
                        probabilities = pipeline.predict_proba(X_test)
                    except Exception:
                        probabilities = None
                metrics = _classification_metrics(y_test, preds, probabilities)
                metric_name = _primary_metric(task_type)
                score = metrics[metric_name]
                loss = 1.0 - score
            else:
                metrics = _regression_metrics(y_test, preds)
                score = metrics["r2"]
                loss = -score

            trial_number = trial.number + 1
            with self.state.lock:
                self.state.trial_history.append(
                    {
                        "trial": trial_number,
                        "score": round(float(score), 6),
                        "params": trial.params,
                    }
                )
            return loss

        self._log("Running Optuna hyperparameter tuning...", 68)
        study = optuna.create_study(direction="minimize")
        optuna.logging.set_verbosity(optuna.logging.WARNING)
        study.optimize(objective, n_trials=optuna_trials, show_progress_bar=False)

        if task_type == "classification":
            tuned_estimator = _classification_tuning_space(study.best_trial, best_candidate_name)
        else:
            tuned_estimator = _regression_tuning_space(study.best_trial, best_candidate_name)

        best_pipeline = _build_pipeline(preprocessor, tuned_estimator)
        best_pipeline.fit(X_train, y_train)
        final_predictions = best_pipeline.predict(X_test)

        if task_type == "classification":
            final_probabilities = None
            if hasattr(best_pipeline, "predict_proba"):
                try:
                    final_probabilities = best_pipeline.predict_proba(X_test)
                except Exception:
                    final_probabilities = None
            final_metrics = _classification_metrics(y_test, final_predictions, final_probabilities)
            primary_metric = "accuracy"
        else:
            final_metrics = _regression_metrics(y_test, final_predictions)
            primary_metric = "r2"

        feature_importance = _feature_importance(best_pipeline, X_test, y_test, task_type)

        plots = self._generate_plots(
            dataframe=dataframe,
            X_test=X_test,
            y_test=y_test,
            y_pred=final_predictions,
            y_prob=final_probabilities if task_type == "classification" else None,
            leaderboard_rows=leaderboard_rows,
            feature_importance=feature_importance,
            task_type=task_type,
        )

        model_path = MODELS_DIR / f"{self.state.experiment_id}_best_pipeline.joblib"
        joblib.dump(
            {
                "pipeline": best_pipeline,
                "target_column": target_column,
                "task_type": task_type,
                "primary_metric": primary_metric,
                "feature_columns": X.columns.tolist(),
                "label_encoder": label_encoder,
            },
            model_path,
        )

        leaderboard_path = ARTIFACTS_DIR / f"{self.state.experiment_id}_leaderboard.csv"
        metrics_path = ARTIFACTS_DIR / f"{self.state.experiment_id}_metrics.json"
        pd.DataFrame(leaderboard_rows).to_csv(leaderboard_path, index=False)
        pd.Series(final_metrics).to_json(metrics_path)

        report_path = REPORTS_DIR / f"{self.state.experiment_id}_report.pdf"
        generate_pdf_report(report_path, final_metrics, best_candidate_name, study.best_params, [Path(plot["path"]) for plot in plots])

        with self.state.lock:
            self.state.status = "completed"
            self.state.progress = 100
            self.state.task_type = task_type
            self.state.primary_metric = primary_metric
            self.state.leaderboard = leaderboard_rows
            self.state.metrics = final_metrics
            self.state.plots = plots
            self.state.best_model_name = best_candidate_name
            self.state.best_params = {key: _jsonable(value) for key, value in study.best_params.items()}
            self.state.model_path = model_path
            self.state.report_path = report_path
            self.state.metrics_path = metrics_path
            self.state.leaderboard_path = leaderboard_path
            self.state.updated_at = pd.Timestamp.utcnow().to_pydatetime()
            self.state.logs.append(f"Training complete. Best model: {best_candidate_name}")

    def _generate_plots(
        self,
        dataframe: pd.DataFrame,
        X_test: pd.DataFrame,
        y_test: pd.Series,
        y_pred: np.ndarray,
        y_prob: np.ndarray | None,
        leaderboard_rows: list[dict[str, Any]],
        feature_importance: list[dict[str, Any]],
        task_type: str,
    ) -> list[dict[str, Any]]:
        plot_items: list[dict[str, Any]] = []

        def save_plot(name: str, title: str, kind: str, figure: plt.Figure) -> None:
            path = PLOTS_DIR / f"{self.state.experiment_id}_{name}.png"
            figure.savefig(path, bbox_inches="tight", dpi=160)
            plt.close(figure)
            plot_items.append({"name": name, "title": title, "kind": kind, "url": f"/artifacts/plots/{path.name}", "path": str(path)})

        if task_type == "classification":
            classes = np.unique(y_test)
            figure = plt.figure(figsize=(6.5, 5.5))
            sns.heatmap(confusion_matrix(y_test, y_pred), annot=True, fmt="d", cmap="mako", cbar=False)
            plt.title("Confusion Matrix")
            plt.xlabel("Predicted")
            plt.ylabel("Actual")
            save_plot("confusion_matrix", "Confusion Matrix", "classification", figure)

            figure = plt.figure(figsize=(7.0, 5.5))
            if y_prob is not None:
                if len(classes) > 2:
                    y_bin = label_binarize(y_test, classes=classes)
                    for idx, cls in enumerate(classes):
                        fpr, tpr, _ = roc_curve(y_bin[:, idx], y_prob[:, idx])
                        plt.plot(fpr, tpr, label=f"{cls}")
                else:
                    fpr, tpr, _ = roc_curve(y_test, y_prob[:, 1] if y_prob.ndim > 1 else y_prob)
                    plt.plot(fpr, tpr, label="ROC")
            plt.plot([0, 1], [0, 1], linestyle="--", color="white", alpha=0.7)
            plt.title("ROC Curve")
            plt.xlabel("False Positive Rate")
            plt.ylabel("True Positive Rate")
            plt.legend(frameon=False)
            save_plot("roc_curve", "ROC Curve", "classification", figure)

            figure = plt.figure(figsize=(6.5, 5.5))
            y_counts = y_test.value_counts().sort_index()
            sns.barplot(x=y_counts.index.astype(str), y=y_counts.values, palette="viridis")
            plt.title("Class Distribution")
            plt.xlabel("Class")
            plt.ylabel("Count")
            save_plot("class_distribution", "Class Distribution", "classification", figure)
        else:
            figure = plt.figure(figsize=(6.5, 5.5))
            plt.scatter(y_test, y_pred, alpha=0.7, c="#06b6d4")
            min_value = float(min(np.min(y_test), np.min(y_pred)))
            max_value = float(max(np.max(y_test), np.max(y_pred)))
            plt.plot([min_value, max_value], [min_value, max_value], linestyle="--", color="#ffffff", alpha=0.85)
            plt.title("Actual vs Predicted")
            plt.xlabel("Actual")
            plt.ylabel("Predicted")
            save_plot("actual_vs_predicted", "Actual vs Predicted", "regression", figure)

            figure = plt.figure(figsize=(6.5, 5.5))
            residuals = y_test - y_pred
            plt.scatter(y_pred, residuals, alpha=0.7, c="#8b5cf6")
            plt.axhline(0, linestyle="--", color="white", alpha=0.8)
            plt.title("Residuals")
            plt.xlabel("Predicted")
            plt.ylabel("Residual")
            save_plot("residuals", "Residuals", "regression", figure)

        figure = plt.figure(figsize=(7.0, 5.5))
        comparison_frame = pd.DataFrame(leaderboard_rows)
        sns.barplot(data=comparison_frame, x="model", y="score", palette="rocket")
        plt.xticks(rotation=25, ha="right")
        plt.title("Model Comparison")
        plt.ylabel(_primary_metric(task_type).upper())
        save_plot("model_comparison", "Model Comparison", "comparison", figure)

        figure = plt.figure(figsize=(7.0, 5.5))
        corr = dataframe.select_dtypes(include=[np.number]).corr()
        if corr.empty:
            corr = pd.DataFrame([[1.0]], columns=["x"], index=["x"])
        sns.heatmap(corr, cmap="coolwarm", center=0, annot=False)
        plt.title("Correlation Heatmap")
        save_plot("correlation_heatmap", "Correlation Heatmap", "heatmap", figure)

        figure = plt.figure(figsize=(7.0, 5.5))
        sns.heatmap(dataframe.isna(), cbar=False, cmap="magma")
        plt.title("Missing Value Heatmap")
        save_plot("missing_value_heatmap", "Missing Value Heatmap", "heatmap", figure)

        figure = plt.figure(figsize=(7.0, 5.5))
        importance_frame = pd.DataFrame(feature_importance)
        sns.barplot(data=importance_frame, x="importance", y="feature", palette="crest")
        plt.title("Feature Importance")
        save_plot("feature_importance", "Feature Importance", "importance", figure)

        with self.state.lock:
            self.state.logs.append(f"Generated {len(plot_items)} visualizations.")

        return plot_items

    def get_status(self) -> dict[str, Any]:
        with self.state.lock:
            return self.state.snapshot()

    def get_leaderboard(self) -> dict[str, Any]:
        with self.state.lock:
            rows = [
                {
                    "model": row["model"],
                    "score": row["score"],
                    "metrics": row["metrics"],
                    "status": row["status"],
                }
                for row in self.state.leaderboard
            ]
            return {
                "experiment_id": self.state.experiment_id,
                "task_type": self.state.task_type,
                "primary_metric": self.state.primary_metric,
                "rows": rows,
            }

    def get_metrics(self) -> dict[str, Any]:
        with self.state.lock:
            return {
                "experiment_id": self.state.experiment_id,
                "task_type": self.state.task_type,
                "primary_metric": self.state.primary_metric,
                "metrics": deepcopy(self.state.metrics),
                "best_model_name": self.state.best_model_name,
                "best_params": deepcopy(self.state.best_params),
            }

    def get_plots(self) -> dict[str, Any]:
        with self.state.lock:
            return {
                "experiment_id": self.state.experiment_id,
                "items": [
                    {"name": plot["name"], "title": plot["title"], "kind": plot["kind"], "url": plot["url"]}
                    for plot in self.state.plots
                ],
            }

    def predict(self, file: UploadFile) -> dict[str, Any]:
        if not file.filename or not file.filename.lower().endswith(".csv"):
            raise HTTPException(status_code=400, detail="Only CSV uploads are supported.")

        with self.state.lock:
            if self.state.model_path is None or not self.state.model_path.exists():
                raise HTTPException(status_code=400, detail="Train a model before running predictions.")

            bundle = joblib.load(self.state.model_path)

        pipeline: Pipeline = bundle["pipeline"]
        task_type: str = bundle["task_type"]
        label_encoder: LabelEncoder | None = bundle.get("label_encoder")
        raw_bytes = file.file.read()
        dataframe = pd.read_csv(io.BytesIO(raw_bytes))

        predictions = pipeline.predict(dataframe)
        if task_type == "classification" and label_encoder is not None:
            decoded_predictions = label_encoder.inverse_transform(np.asarray(predictions, dtype=int))
        else:
            decoded_predictions = predictions
        response_rows: list[dict[str, Any]] = []

        probabilities = None
        if task_type == "classification" and hasattr(pipeline, "predict_proba"):
            try:
                probabilities = pipeline.predict_proba(dataframe)
            except Exception:
                probabilities = None

        classes = list(getattr(pipeline.named_steps["model"], "classes_", []))
        if task_type == "classification" and label_encoder is not None:
            classes = label_encoder.classes_.tolist()

        for index, prediction in enumerate(decoded_predictions):
            row: dict[str, Any] = {"row_index": int(index), "prediction": _jsonable(prediction)}
            if probabilities is not None:
                row_probabilities = {str(class_name): float(probabilities[index][idx]) for idx, class_name in enumerate(classes)}
                row["confidence"] = float(max(row_probabilities.values()))
                row["probabilities"] = row_probabilities
            response_rows.append(row)

        return {
            "experiment_id": self.state.experiment_id,
            "task_type": task_type,
            "row_count": int(len(response_rows)),
            "rows": response_rows,
        }

    def get_report_path(self) -> Path:
        with self.state.lock:
            if self.state.report_path is None:
                raise HTTPException(status_code=400, detail="No report has been generated yet.")
            return self.state.report_path

    def get_model_path(self) -> Path:
        with self.state.lock:
            if self.state.model_path is None:
                raise HTTPException(status_code=400, detail="No trained model is available.")
            return self.state.model_path


SERVICE = AutoMLService()

