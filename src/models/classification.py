from sklearn.linear_model import LogisticRegression, RidgeClassifier, SGDClassifier
from sklearn.ensemble import AdaBoostClassifier, ExtraTreesClassifier, GradientBoostingClassifier, RandomForestClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVC, LinearSVC

def get_classification_models():

    models = {

        # Linear
        "logistic_regression": LogisticRegression(),
        "ridge_classifier": RidgeClassifier(),
        "sgd_classifier": SGDClassifier(),

        # Tree
        "random_forest": RandomForestClassifier(),
        "extra_trees": ExtraTreesClassifier(),
        "gradient_boosting": GradientBoostingClassifier(),
        "adaboost": AdaBoostClassifier(),

        # Kernel
        "svm": SVC(probability=True),
        "linear_svm": LinearSVC(),

        # Distance
        "knn": KNeighborsClassifier(),

        # Probabilistic
        "naive_bayes": GaussianNB(),

        # Neural
        "mlp_classifier": MLPClassifier()
    }

    return models