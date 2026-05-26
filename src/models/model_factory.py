from src.models.classification import get_classification_models
from src.models.regression import get_regression_models

def get_models(task_type="classification"):

    if task_type == "classification":
        return get_classification_models()

    return get_regression_models()