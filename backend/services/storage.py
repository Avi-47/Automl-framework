from __future__ import annotations

import threading
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any

import pandas as pd


@dataclass
class ExperimentState:
    experiment_id: str = ""
    status: str = "idle"
    progress: int = 0
    logs: list[str] = field(default_factory=list)
    trial_history: list[dict[str, Any]] = field(default_factory=list)
    dataframe: pd.DataFrame | None = None
    uploaded_filename: str | None = None
    target_column: str | None = None
    task_type: str | None = None
    primary_metric: str | None = None
    leaderboard: list[dict[str, Any]] = field(default_factory=list)
    metrics: dict[str, Any] = field(default_factory=dict)
    plots: list[dict[str, Any]] = field(default_factory=list)
    best_model_name: str | None = None
    best_params: dict[str, Any] = field(default_factory=dict)
    model_path: Path | None = None
    report_path: Path | None = None
    metrics_path: Path | None = None
    leaderboard_path: Path | None = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    lock: threading.RLock = field(default_factory=threading.RLock, repr=False)

    def snapshot(self) -> dict[str, Any]:
        return {
            "experiment_id": self.experiment_id,
            "status": self.status,
            "progress": self.progress,
            "target_column": self.target_column,
            "task_type": self.task_type,
            "best_model_name": self.best_model_name,
            "updated_at": self.updated_at,
            "logs": list(self.logs),
            "trial_history": list(self.trial_history),
        }

