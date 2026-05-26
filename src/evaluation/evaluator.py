from src.evaluation.metrics import (
    classification_metrics,
    regression_metrics
)

from src.evaluation.plots import (
    plot_confusion_matrix,
    plot_regression_results
)


def evaluate_model(model, X_test, y_test, task_type):

    preds = model.predict(X_test)

    if task_type == "classification":

        metrics = classification_metrics(y_test, preds)

        plot_confusion_matrix(model, X_test, y_test)

    else:

        metrics = regression_metrics(y_test, preds)

        plot_regression_results(y_test, preds)

    return metrics