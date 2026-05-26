def generate_report(metrics, best_params):

    with open("outputs/reports/report.txt", "w") as f:

        f.write("MODEL REPORT\n")
        f.write("=" * 50 + "\n\n")

        f.write("Metrics:\n")

        for k, v in metrics.items():
            f.write(f"{k}: {v}\n")

        f.write("\nBest Parameters:\n")

        for k, v in best_params.items():
            f.write(f"{k}: {v}\n")