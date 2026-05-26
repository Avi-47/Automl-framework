from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet, SGDRegressor

from sklearn.ensemble import RandomForestRegressor, ExtraTreesRegressor, GradientBoostingRegressor, AdaBoostRegressor

from sklearn.svm import SVR, LinearSVR

from sklearn.neighbors import KNeighborsRegressor

from sklearn.neural_network import MLPRegressor


def get_regression_models():

    models = {

        # Linear Models
        "linear_regression": LinearRegression(),
        "ridge": Ridge(),
        "lasso": Lasso(),
        "elasticnet": ElasticNet(),
        "sgd_regressor": SGDRegressor(),

        # Tree-Based Models
        "random_forest": RandomForestRegressor(),
        "extra_trees": ExtraTreesRegressor(),
        "gradient_boosting": GradientBoostingRegressor(),
        "adaboost": AdaBoostRegressor(),

        # Support Vector Machines
        "svr": SVR(),
        "linear_svr": LinearSVR(),

        # Distance-Based
        "knn": KNeighborsRegressor(),

        # Neural Network
        "mlp_regressor": MLPRegressor()
    }

    return models