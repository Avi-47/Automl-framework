# 🚀 AutoML Framework

<<<<<<< HEAD
An end-to-end modular AutoML framework with a production-style frontend and backend.
=======
## Production Stack

This repository now contains a complete frontend + backend AutoML SaaS prototype:

* `frontend/` - React + Vite dashboard with Tailwind, shadcn-style components, Framer Motion, Recharts, Lucide, and Axios
* `backend/` - FastAPI AutoML engine with CSV upload, preprocessing, model training, Optuna tuning, metrics, plots, predictions, and report/model downloads

### Run it locally

1. Start the backend:

```bash
cd backend
pip install -r requirements.txt
python app.py
```

2. Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

3. Open the dashboard at the Vite URL shown in the terminal.

### API surface

* `POST /upload`
* `POST /train`
* `GET /status`
* `GET /leaderboard`
* `GET /metrics`
* `GET /plots`
* `POST /predict`
* `GET /download-report`
* `GET /download-model`

### Frontend integration

The dashboard reads backend data through Axios. Set `VITE_API_URL` in the frontend if the FastAPI server is not running on `http://localhost:8000`.

An end-to-end modular AutoML framework built using Python and Scikit-learn that automatically handles:
>>>>>>> 7933bbe (Add full-stack AutoML dashboard)

## What’s included

* `frontend/` - React + Vite dashboard with Tailwind, Framer Motion, Recharts, Lucide, and Axios
* `backend/` - FastAPI AutoML engine with CSV upload, preprocessing, model training, Optuna tuning, metrics, plots, predictions, and report/model downloads
* `src/` - Core Python pipeline, preprocessing, evaluation, optimization, reporting, and utilities

## Run locally

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal. The frontend talks to the FastAPI server at `http://localhost:8000` by default.

## API surface

* `POST /upload`
* `POST /train`
* `GET /status`
* `GET /leaderboard`
* `GET /metrics`
* `GET /plots`
* `POST /predict`
* `GET /download-report`
* `GET /download-model`

## Core pipeline

The Python pipeline still handles the traditional AutoML flow:

* Data loading and validation
* Preprocessing and encoding
* Feature scaling and train/test splitting
* Model training and hyperparameter optimization
* Evaluation, reporting, and artifact export

## Supported tasks

* Classification
* Regression

## Notes

The uploaded CSV is persisted as backend experiment metadata, so switching between Upload, Training, Visualizations, Predictions, and Reports keeps the active dataset visible in the UI.
