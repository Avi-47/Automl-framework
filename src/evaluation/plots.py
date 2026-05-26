import os
import matplotlib.pyplot as plt
from sklearn.metrics import ConfusionMatrixDisplay


def plot_confusion_matrix(model, X_test, y_test):

    os.makedirs("outputs/plots", exist_ok=True)

    ConfusionMatrixDisplay.from_estimator(
        model,
        X_test,
        y_test
    )

    plt.title("Confusion Matrix")
    plt.savefig("outputs/plots/confusion_matrix.png")
    plt.close()


def plot_regression_results(y_true, y_pred):

    os.makedirs("outputs/plots", exist_ok=True)

    plt.figure()

    plt.scatter(y_true, y_pred, alpha=0.6)

    plt.xlabel("Actual Values")
    plt.ylabel("Predicted Values")
    plt.title("Regression: Actual vs Predicted")

    plt.savefig("outputs/plots/regression_plot.png")
    plt.close()