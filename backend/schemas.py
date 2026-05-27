from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class UploadResponse(BaseModel):
    experiment_id: str
    target_column: str
    task_type: Literal["classification", "regression"]
    row_count: int
    column_count: int
    dataset_health_score: float
    numeric_columns: list[str]
    categorical_columns: list[str]
    preview_rows: list[dict[str, Any]]
    column_stats: list[dict[str, Any]]
    missing_summary: list[dict[str, Any]]


class TrainRequest(BaseModel):
    target_column: str | None = None
    optuna_trials: int = Field(default=15, ge=3, le=40)


class TrainResponse(BaseModel):
    experiment_id: str
    status: str
    message: str


class StatusResponse(BaseModel):
    experiment_id: str
    status: str
    progress: int
    target_column: str | None = None
    task_type: str | None = None
    best_model_name: str | None = None
    updated_at: datetime
    logs: list[str]
    trial_history: list[dict[str, Any]]


class LeaderboardRow(BaseModel):
    model: str
    score: float
    metrics: dict[str, float]
    status: str


class LeaderboardResponse(BaseModel):
    experiment_id: str
    task_type: str | None = None
    primary_metric: str | None = None
    rows: list[LeaderboardRow]


class MetricsResponse(BaseModel):
    experiment_id: str
    task_type: str | None = None
    primary_metric: str | None = None
    metrics: dict[str, Any]
    best_model_name: str | None = None
    best_params: dict[str, Any]


class PlotItem(BaseModel):
    name: str
    title: str
    kind: str
    url: str


class PlotResponse(BaseModel):
    experiment_id: str
    items: list[PlotItem]


class PredictRequest(BaseModel):
    return_probabilities: bool = True


class PredictRow(BaseModel):
    row_index: int
    prediction: Any
    confidence: float | None = None
    probabilities: dict[str, float] | None = None


class PredictResponse(BaseModel):
    experiment_id: str
    task_type: str | None = None
    row_count: int
    rows: list[PredictRow]

