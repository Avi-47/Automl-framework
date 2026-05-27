from __future__ import annotations

from pathlib import Path
from typing import Any

import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages


def _add_summary_page(pdf: PdfPages, title: str, metrics: dict[str, Any], best_model: str | None, best_params: dict[str, Any]) -> None:
    figure = plt.figure(figsize=(11.69, 8.27))
    figure.patch.set_facecolor("white")
    axis = figure.add_subplot(111)
    axis.axis("off")

    lines = [title, "", f"Best model: {best_model or 'n/a'}", "", "Metrics:"]
    for key, value in metrics.items():
        if isinstance(value, float):
            lines.append(f"- {key}: {value:.4f}")
        else:
            lines.append(f"- {key}: {value}")

    lines.extend(["", "Best parameters:"])
    for key, value in best_params.items():
        lines.append(f"- {key}: {value}")

    axis.text(0.05, 0.95, "\n".join(lines), va="top", ha="left", fontsize=14, family="monospace")
    pdf.savefig(figure, bbox_inches="tight")
    plt.close(figure)


def generate_pdf_report(report_path: Path, metrics: dict[str, Any], best_model: str | None, best_params: dict[str, Any], plot_paths: list[Path]) -> Path:
    report_path.parent.mkdir(parents=True, exist_ok=True)

    with PdfPages(report_path) as pdf:
        _add_summary_page(pdf, "AutoML Model Report", metrics, best_model, best_params)

        for image_path in plot_paths:
            if not image_path.exists():
                continue

            figure = plt.figure(figsize=(11, 8.5))
            axis = figure.add_subplot(111)
            axis.axis("off")
            image = plt.imread(image_path)
            axis.imshow(image)
            axis.set_title(image_path.stem.replace("_", " ").title(), pad=16)
            pdf.savefig(figure, bbox_inches="tight")
            plt.close(figure)

    return report_path

