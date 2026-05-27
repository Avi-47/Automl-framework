from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from schemas import MetricsResponse, PlotResponse, PredictResponse, StatusResponse, TrainRequest, TrainResponse, UploadResponse
from services.automl_service import ARTIFACTS_DIR, SERVICE


app = FastAPI(title="AutoML SaaS API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/artifacts", StaticFiles(directory=str(ARTIFACTS_DIR)), name="artifacts")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/upload", response_model=UploadResponse)
async def upload_csv(file: UploadFile = File(...), target_column: str | None = Form(default=None)):
    return SERVICE.upload_dataset(file, target_column)


@app.post("/train", response_model=TrainResponse)
async def train_model(payload: TrainRequest):
    response = SERVICE.start_training(payload.target_column, payload.optuna_trials)
    return response


@app.get("/status", response_model=StatusResponse)
def get_status():
    return SERVICE.get_status()


@app.get("/leaderboard")
def get_leaderboard():
    return SERVICE.get_leaderboard()


@app.get("/metrics", response_model=MetricsResponse)
def get_metrics():
    return SERVICE.get_metrics()


@app.get("/plots", response_model=PlotResponse)
def get_plots():
    return SERVICE.get_plots()


@app.post("/predict", response_model=PredictResponse)
async def predict(file: UploadFile = File(...)):
    return SERVICE.predict(file)


@app.get("/download-report")
def download_report():
    report_path = SERVICE.get_report_path()
    return FileResponse(path=str(report_path), filename=report_path.name, media_type="application/pdf")


@app.get("/download-model")
def download_model():
    model_path = SERVICE.get_model_path()
    return FileResponse(path=str(model_path), filename=model_path.name, media_type="application/octet-stream")

