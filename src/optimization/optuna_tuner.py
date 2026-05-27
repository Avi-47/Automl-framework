import optuna

from sklearn.metrics import accuracy_score, f1_score, r2_score

# =========================
# REGRESSION MODELS
# =========================

from sklearn.linear_model import (LinearRegression,Ridge,Lasso,ElasticNet,SGDRegressor)

from sklearn.ensemble import (RandomForestRegressor,ExtraTreesRegressor, GradientBoostingRegressor,AdaBoostRegressor)

from sklearn.svm import SVR, LinearSVR

from sklearn.neighbors import KNeighborsRegressor

from sklearn.neural_network import MLPRegressor


# =========================
# CLASSIFICATION MODELS
# =========================

from sklearn.linear_model import (LogisticRegression,RidgeClassifier,SGDClassifier)

from sklearn.ensemble import (RandomForestClassifier,ExtraTreesClassifier,GradientBoostingClassifier,AdaBoostClassifier)

from sklearn.svm import SVC, LinearSVC

from sklearn.neighbors import KNeighborsClassifier

from sklearn.naive_bayes import GaussianNB

from sklearn.neural_network import MLPClassifier


# =========================================================
# MODEL FACTORY
# =========================================================

def get_model(trial, model_name, task_type):

    # =====================================================
    # REGRESSION
    # =====================================================

    if task_type == "regression":

        # ---------------- Linear Models ----------------

        if model_name == "linear_regression":

            return LinearRegression()

        elif model_name == "ridge":

            return Ridge(
                alpha=trial.suggest_float("alpha",1e-4,100,log=True
                )
            )

        elif model_name == "lasso":

            return Lasso(
                alpha=trial.suggest_float("alpha",1e-4,10,log=True
                )
            )

        elif model_name == "elasticnet":

            return ElasticNet(
                alpha=trial.suggest_float("alpha",1e-4,10,log=True
                ),
                l1_ratio=trial.suggest_float("l1_ratio",0.0,1.0
                )
            )

        elif model_name == "sgd_regressor":

            return SGDRegressor(
                alpha=trial.suggest_float("alpha",1e-5,1e-1,log=True
                ),
                penalty=trial.suggest_categorical(
                    "penalty",
                    ["l2", "l1", "elasticnet"]
                ),
                max_iter=trial.suggest_int("max_iter",1000,5000
                )
            )

        # ---------------- Tree Models ----------------

        elif model_name == "random_forest":

            return RandomForestRegressor(
                n_estimators=trial.suggest_int("n_estimators",50,300
                ),
                max_depth=trial.suggest_int("max_depth",2,30
                ),
                random_state=42
            )

        elif model_name == "extra_trees":

            return ExtraTreesRegressor(
                n_estimators=trial.suggest_int("n_estimators",50,300
                ),
                max_depth=trial.suggest_int("max_depth",2,30
                ),
                random_state=42
            )

        elif model_name == "gradient_boosting":

            return GradientBoostingRegressor(
                n_estimators=trial.suggest_int("n_estimators",50,300
                ),
                learning_rate=trial.suggest_float("learning_rate",0.01,0.3
                ),
                max_depth=trial.suggest_int("max_depth",2,10
                )
            )

        elif model_name == "adaboost":

            return AdaBoostRegressor(
                n_estimators=trial.suggest_int("n_estimators",50,300
                ),
                learning_rate=trial.suggest_float("learning_rate",0.01,1.0
                ),
                random_state=42
            )

        # ---------------- SVM ----------------

        elif model_name == "svr":

            return SVR(
                C=trial.suggest_float("C",0.01,100,log=True
                ),
                kernel=trial.suggest_categorical("kernel",["rbf", "linear"]
                )
            )

        elif model_name == "linear_svr":

            return LinearSVR(
                C=trial.suggest_float("C",0.01,100,log=True
                ),
                max_iter=trial.suggest_int("max_iter",1000,5000
                ),
                random_state=42
            )

        # ---------------- KNN ----------------

        elif model_name == "knn":

            return KNeighborsRegressor(
                n_neighbors=trial.suggest_int("n_neighbors",2,20
                ),
                weights=trial.suggest_categorical(
                    "weights",
                    ["uniform", "distance"]
                )
            )

        # ---------------- Neural Network ----------------

        elif model_name == "mlp_regressor":

            hidden_layer = trial.suggest_categorical(
                "hidden_layer_sizes",
                [
                    "50",
                    "100",
                    "100_50",
                    "128_64"
                ]
            )

            mapping = {
                "50": (50,),
                "100": (100,),
                "100_50": (100, 50),
                "128_64": (128, 64)
            }

            return MLPRegressor(

                hidden_layer_sizes=mapping[hidden_layer],

                learning_rate_init=trial.suggest_float("learning_rate_init",1e-4,1e-1,log=True),

                alpha=trial.suggest_float("alpha",1e-5,1e-2,log=True),

                max_iter=3000,
                random_state=42
            )

    # =====================================================
    # CLASSIFICATION
    # =====================================================

    else:

        # ---------------- Linear Models ----------------

        if model_name == "logistic_regression":

            return LogisticRegression(
                C=trial.suggest_float("C",0.01,100,log=True
                ),
                max_iter=3000
            )

        elif model_name == "ridge_classifier":

            return RidgeClassifier(
                alpha=trial.suggest_float("alpha",1e-4,100,log=True
                )
            )

        elif model_name == "sgd_classifier":

            return SGDClassifier(
                alpha=trial.suggest_float("alpha",1e-5,1e-1,log=True
                ),
                penalty=trial.suggest_categorical("penalty",["l2", "l1", "elasticnet"]
                ),
                max_iter=trial.suggest_int("max_iter",1000,5000
                ),
                random_state=42
            )

        # ---------------- Tree Models ----------------

        elif model_name == "random_forest":

            return RandomForestClassifier(
                n_estimators=trial.suggest_int("n_estimators",50,300
                ),
                max_depth=trial.suggest_int("max_depth",2,30
                ),
                random_state=42
            )

        elif model_name == "extra_trees":

            return ExtraTreesClassifier(
                n_estimators=trial.suggest_int("n_estimators",50,300
                ),
                max_depth=trial.suggest_int("max_depth",2,30
                ),
                random_state=42
            )

        elif model_name == "gradient_boosting":

            return GradientBoostingClassifier(
                n_estimators=trial.suggest_int("n_estimators",50,300
                ),
                learning_rate=trial.suggest_float("learning_rate",0.01,0.3
                ),
                max_depth=trial.suggest_int("max_depth",2,10
                )
            )

        elif model_name == "adaboost":

            return AdaBoostClassifier(
                n_estimators=trial.suggest_int("n_estimators",50,300
                ),
                learning_rate=trial.suggest_float(
                    "learning_rate",
                    0.01,
                    1.0
                ),
                random_state=42
            )

        # ---------------- SVM ----------------

        elif model_name == "svm":

            return SVC(
                C=trial.suggest_float("C",0.01,100,log=True
                ),
                kernel=trial.suggest_categorical(
                    "kernel",
                    ["rbf", "linear"]
                ),
                probability=True
            )

        elif model_name == "linear_svm":

            return LinearSVC(
                C=trial.suggest_float("C",0.01,100,log=True),
                max_iter=5000
            )

        # ---------------- KNN ----------------

        elif model_name == "knn":

            return KNeighborsClassifier(
                n_neighbors=trial.suggest_int("n_neighbors",2,20),
                weights=trial.suggest_categorical(
                    "weights",
                    ["uniform", "distance"]
                )
            )

        # ---------------- Naive Bayes ----------------

        elif model_name == "naive_bayes":
            return GaussianNB(
                var_smoothing=trial.suggest_float("var_smoothing",1e-12,1e-6,log=True)
            )

        # ---------------- Neural Network ----------------

        elif model_name == "mlp_classifier":

            hidden_layer = trial.suggest_categorical(
                "hidden_layer_sizes",
                [
                    "50",
                    "100",
                    "100_50",
                    "128_64"
                ]
            )

            mapping = {
                "50": (50,),
                "100": (100,),
                "100_50": (100, 50),
                "128_64": (128, 64)
            }

            return MLPClassifier(

                hidden_layer_sizes=mapping[hidden_layer],

                learning_rate_init=trial.suggest_float("learning_rate_init",1e-4,1e-1,log=True),

                alpha=trial.suggest_float("alpha",1e-5,1e-2,log=True),

                max_iter=3000, random_state=42
            )

    raise ValueError(f"Unsupported model: {model_name}")


# =========================================================
# OBJECTIVE FUNCTION
# =========================================================

def objective(trial,X_train,X_test,y_train,y_test,task_type,model_name):

    model = get_model(trial,model_name,task_type)

    model.fit(X_train, y_train)

    preds = model.predict(X_test)

    # ---------------- REGRESSION ----------------

    if task_type == "regression":

        return r2_score(y_test, preds)

    # ---------------- CLASSIFICATION ----------------

    else:

        return f1_score(y_test,preds,average="weighted")


# =========================================================
# MAIN TUNING FUNCTION
# =========================================================

def tune_model(model_name,X_train,X_test,y_train,y_test,task_type,n_trials=30):

    study = optuna.create_study(
        direction="maximize"
    )

    study.optimize(
        lambda trial: objective(trial, X_train, X_test, y_train, y_test, task_type, model_name),
        n_trials=n_trials
    )

    return study