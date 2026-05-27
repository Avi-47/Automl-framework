import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
});

export type UploadResponse = {
  experiment_id: string;
  target_column: string;
  task_type: 'classification' | 'regression';
  row_count: number;
  column_count: number;
  dataset_health_score: number;
  numeric_columns: string[];
  categorical_columns: string[];
  preview_rows: Array<Record<string, unknown>>;
  column_stats: Array<{ column: string; dtype: string; missing: number; unique: number }>;
  missing_summary: Array<{ column: string; missing: number; percent: number }>;
};

export type TrainResponse = {
  experiment_id: string;
  status: string;
  message: string;
};

export type StatusResponse = {
  experiment_id: string;
  status: string;
  progress: number;
  target_column?: string;
  task_type?: string;
  best_model_name?: string;
  updated_at: string;
  logs: string[];
  trial_history: Array<{ trial: number; score: number; params: Record<string, unknown> }>;
};

export type LeaderboardResponse = {
  experiment_id: string;
  task_type?: string;
  primary_metric?: string;
  rows: Array<{
    model: string;
    score: number;
    metrics: Record<string, number>;
    status: string;
  }>;
};

export type MetricsResponse = {
  experiment_id: string;
  task_type?: string;
  primary_metric?: string;
  metrics: Record<string, number>;
  best_model_name?: string;
  best_params: Record<string, unknown>;
};

export type PlotResponse = {
  experiment_id: string;
  items: Array<{ name: string; title: string; kind: string; url: string }>;
};

export type PredictResponse = {
  experiment_id: string;
  task_type?: string;
  row_count: number;
  rows: Array<{
    row_index: number;
    prediction: unknown;
    confidence?: number | null;
    probabilities?: Record<string, number> | null;
  }>;
};

export async function uploadDataset(file: File, targetColumn?: string) {
  const formData = new FormData();
  formData.append('file', file);

  if (targetColumn) {
    formData.append('target_column', targetColumn);
  }

  const { data } = await api.post<UploadResponse>('/upload', formData, {
    headers: {},
  });

  return data;
}

export async function startTraining(targetColumn?: string, optunaTrials = 15) {
  const { data } = await api.post<TrainResponse>('/train', {
    target_column: targetColumn ?? null,
    optuna_trials: optunaTrials,
  });

  return data;
}

export async function getStatus() {
  const { data } = await api.get<StatusResponse>('/status');
  return data;
}

export async function getLeaderboard() {
  const { data } = await api.get<LeaderboardResponse>('/leaderboard');
  return data;
}

export async function getMetrics() {
  const { data } = await api.get<MetricsResponse>('/metrics');
  return data;
}

export async function getPlots() {
  const { data } = await api.get<PlotResponse>('/plots');
  return data;
}

export async function predictDataset(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post<PredictResponse>('/predict', formData, {
    headers: {},
  });

  return data;
}

export function reportUrl() {
  return `${API_BASE_URL}/download-report`;
}

export function modelUrl() {
  return `${API_BASE_URL}/download-model`;
}
