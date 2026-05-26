from src.evaluation.leaderboard import build_leaderboard
from src.models.model_factory import get_models
from src.data.loader import load_data
from src.data.validator import validate_data
from src.preprocessing import scaler
from src.utils.task_detector import detect_task
from src.preprocessing.cleaner import clean_data
from src.preprocessing.imputer import handle_missing_values
import os
import joblib

from src.preprocessing.encoder import (
    encode_target,
    encode_features
)

from src.preprocessing.scaler import scale_features
from src.preprocessing.splitter import split_data

from src.models.model_factory import get_models

from src.optimization.optuna_tuner import tune_model

from src.evaluation.evaluator import evaluate_model

from src.reports.report_generator import generate_report


def run_pipeline(data_path, target_column):

    # Load dataset
    df = load_data(data_path)

    # Validate dataset
    validate_data(df, target_column)

    # Clean dataset
    df = clean_data(df)

    # Handle missing values
    df = handle_missing_values(df)

    # Encode target column
    df, encoder = encode_target(
        df,
        target_column
    )

    # Separate features and target
    X = df.drop(columns=[target_column])

    # Encode categorical features
    X = encode_features(X)

    y = df[target_column]
    task_type = detect_task(y)
    print("Detected task:", task_type)

    # Split dataset
    X_train, X_test, y_train, y_test = split_data(X, y)

    # Scale features
    X_train, X_test, scaler = scale_features(X_train,X_test)

    # Get models
    models = get_models(task_type)

    leaderboard, trained_models = build_leaderboard(models,X_train,X_test,y_train,y_test,task_type)
    

    print("\nMODEL LEADERBOARD")
    print(leaderboard)

    best_model_name = leaderboard.iloc[0]["model"]
    model = get_models(task_type)[best_model_name]

    study = tune_model(model_name=best_model_name,X_train=X_train,X_test=X_test,y_train=y_train,y_test=y_test,task_type=task_type)

    best_params = study.best_params

    print("Best model:", best_model_name)
    print("Best params:", best_params)

    # APPLY OPTUNA PARAMETERS
    model.set_params(**best_params)

    # RETRAIN FINAL MODEL
    model.fit(X_train, y_train)

    os.makedirs("artifacts", exist_ok=True)

    # Evaluate model
    metrics = evaluate_model(model, X_test, y_test, task_type)
    joblib.dump(model, "artifacts/best_model.pkl")
    joblib.dump(scaler, "artifacts/scaler.pkl")
    joblib.dump(encoder, "artifacts/encoder.pkl")

    # Generate report
    generate_report(
        metrics,
        best_params
    )

    print("Pipeline completed.")