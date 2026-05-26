import optuna
from sklearn.ensemble import (
    RandomForestClassifier, RandomForestRegressor,
    GradientBoostingClassifier, GradientBoostingRegressor
)
from sklearn.svm import SVC, SVR
from sklearn.linear_model import LogisticRegression, LinearRegression

from sklearn.metrics import accuracy_score, r2_score


def get_model(trial, model_name, task_type):

    if task_type == "classification":

        if model_name == "random_forest":
            return RandomForestClassifier(
                n_estimators=trial.suggest_int("n_estimators", 50, 300),
                max_depth=trial.suggest_int("max_depth", 2, 20)
            )

        if model_name == "gradient_boosting":
            return GradientBoostingClassifier(
                n_estimators=trial.suggest_int("n_estimators", 50, 200),
                learning_rate=trial.suggest_float("lr", 0.01, 0.3)
            )

        if model_name == "svm":
            return SVC(
                C=trial.suggest_float("C", 0.1, 10)
            )

        return LogisticRegression()

    else:

        if model_name == "random_forest":
            return RandomForestRegressor(
                n_estimators=trial.suggest_int("n_estimators", 50, 300),
                max_depth=trial.suggest_int("max_depth", 2, 20)
            )

        if model_name == "gradient_boosting":
            return GradientBoostingRegressor(
                n_estimators=trial.suggest_int("n_estimators", 50, 200),
                learning_rate=trial.suggest_float("lr", 0.01, 0.3)
            )

        if model_name == "svm":
            return SVR(
                C=trial.suggest_float("C", 0.1, 10)
            )

        return LinearRegression()

def objective(trial, X_train, X_test, y_train, y_test, task_type, model_name):

    # ---------------- REGRESSION ----------------
    if task_type == "regression":

        if model_name == "random_forest":
            model = RandomForestRegressor(
                n_estimators=trial.suggest_int("n_estimators", 50, 300),
                max_depth=trial.suggest_int("max_depth", 2, 20)
            )

        elif model_name == "gradient_boosting":
            model = GradientBoostingRegressor(
                n_estimators=trial.suggest_int("n_estimators", 50, 200),
                learning_rate=trial.suggest_float("learning_rate", 0.01, 0.3)
            )

        elif model_name == "svr":
            model = SVR(
                C=trial.suggest_float("C", 0.1, 10)
            )

        else:
            model = LinearRegression()

    # ---------------- CLASSIFICATION ----------------
    else:

        if model_name == "random_forest":
            model = RandomForestClassifier(
                n_estimators=trial.suggest_int("n_estimators", 50, 300),
                max_depth=trial.suggest_int("max_depth", 2, 20)
            )

        elif model_name == "gradient_boosting":
            model = GradientBoostingClassifier(
                n_estimators=trial.suggest_int("n_estimators", 50, 200),
                learning_rate=trial.suggest_float("learning_rate", 0.01, 0.3)
            )

        elif model_name == "svm":
            model = SVC(
                C=trial.suggest_float("C", 0.1, 10)
            )

        else:
            model = LogisticRegression()

    model.fit(X_train, y_train)
    preds = model.predict(X_test)

    return r2_score(y_test, preds) if task_type == "regression" else accuracy_score(y_test, preds)

def tune_model(model_name, X_train, X_test, y_train, y_test, task_type):

    study = optuna.create_study(direction="maximize")

    study.optimize(
        lambda trial: objective(
            trial,
            X_train,
            X_test,
            y_train,
            y_test,
            task_type,
            model_name
        ),
        n_trials=30
    )

    return study