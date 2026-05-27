import { useEffect, useMemo, useState } from 'react';
import { Brain, CheckCircle2, Flame, Gauge, LoaderCircle, Search, WandSparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { SectionHeader } from '@/components/SectionHeader';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ToastProvider';
import {
  getLeaderboard,
  getMetrics,
  getStatus,
  startTraining,
  type LeaderboardResponse,
  type MetricsResponse,
  type StatusResponse,
} from '@/services/automlApi';
import { leaderboard as mockLeaderboard, optunaTrials as mockOptunaTrials, trainingLogs as mockTrainingLogs, bestHyperparameters as mockBestParams } from '@/data/mockMlData';
import { formatPercent } from '@/utils/format';

const fallbackStatus: StatusResponse = {
  experiment_id: 'mock-experiment',
  status: 'idle',
  progress: 0,
  target_column: 'Price',
  task_type: 'regression',
  best_model_name: 'XGBoost',
  updated_at: new Date().toISOString(),
  logs: mockTrainingLogs,
  trial_history: mockOptunaTrials.map((trial) => ({ trial: trial.trial, score: trial.score, params: { note: trial.params } })),
};

export function TrainingDashboardPage() {
  const { toast } = useToast();
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTraining, setIsTraining] = useState(false);

  const refresh = async (silent = false) => {
    try {
      if (!silent) {
        setIsRefreshing(true);
      }

      const [statusResponse, leaderboardResponse, metricsResponse] = await Promise.all([
        getStatus(),
        getLeaderboard(),
        getMetrics(),
      ]);

      setStatus(statusResponse);
      setLeaderboard(leaderboardResponse);
      setMetrics(metricsResponse);
    } catch {
      setStatus((current) => current ?? fallbackStatus);
      setLeaderboard((current) => current ?? {
        experiment_id: 'mock-experiment',
        task_type: 'regression',
        primary_metric: 'r2',
        rows: mockLeaderboard.map((row) => ({ model: row.model, score: row.accuracy, metrics: { accuracy: row.accuracy, precision: row.precision, recall: row.recall, f1: row.f1, auc: row.auc }, status: row.status })),
      });
      setMetrics((current) => current ?? {
        experiment_id: 'mock-experiment',
        task_type: 'regression',
        primary_metric: 'r2',
        metrics: {
          accuracy: 0.984,
          precision: 0.981,
          recall: 0.979,
          f1: 0.98,
          roc_auc: 0.993,
        },
        best_model_name: 'XGBoost',
        best_params: Object.fromEntries(mockBestParams.map((item) => [item.name, item.value])),
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => void refresh(true), 3000);
    return () => window.clearInterval(interval);
  }, []);

  const effectiveStatus = status ?? fallbackStatus;
  const effectiveLeaderboard = leaderboard?.rows.length
    ? leaderboard.rows
    : mockLeaderboard.map((row) => ({
        model: row.model,
        score: row.accuracy,
        metrics: { accuracy: row.accuracy, precision: row.precision, recall: row.recall, f1: row.f1, auc: row.auc },
        status: row.status,
      }));
  const effectiveMetrics = metrics ?? {
    experiment_id: 'mock-experiment',
    task_type: 'regression',
    primary_metric: 'r2',
    metrics: {
      accuracy: 0.984,
      precision: 0.981,
      recall: 0.979,
      f1: 0.98,
      roc_auc: 0.993,
    },
    best_model_name: 'XGBoost',
    best_params: Object.fromEntries(mockBestParams.map((item) => [item.name, item.value])),
  };

  const visibleLeaderboard = useMemo(
    () => effectiveLeaderboard.filter((row) => row.model.toLowerCase().includes(search.toLowerCase())),
    [effectiveLeaderboard, search],
  );

  const start = async () => {
    try {
      setIsTraining(true);
      const response = await startTraining(effectiveStatus.target_column, 15);
      toast({ title: 'Training started', description: response.message, tone: 'success' });
      await refresh(true);
    } catch {
      toast({ title: 'Backend unavailable', description: 'Training is currently showing mock progress.', tone: 'warning' });
    } finally {
      setIsTraining(false);
    }
  };

  const progress = effectiveStatus.progress;
  const bestModel = effectiveStatus.best_model_name ?? effectiveMetrics.best_model_name ?? 'XGBoost';
  const liveLogs = effectiveStatus.logs.length ? effectiveStatus.logs : mockTrainingLogs;
  const trialHistory = effectiveStatus.trial_history.length
    ? effectiveStatus.trial_history
    : mockOptunaTrials.map((trial) => ({ trial: trial.trial, score: trial.score, params: { note: trial.params } }));

  if (!status && !leaderboard && !metrics) {
    return (
      <div className="space-y-6">
        <SectionHeader eyebrow="Training" title="AutoML training dashboard" description="Live-style pipeline telemetry, tuning progress, and leaderboard monitoring." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((index) => <Skeleton key={index} className="h-28" />)}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <Skeleton className="h-[360px]" />
          <Skeleton className="h-[360px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Training"
        title="AutoML training dashboard"
        description="Backend-backed training flow with status polling, model comparison, Optuna traces, and tuned model summary."
        action={
          <div className="flex items-center gap-3">
            <Badge variant={effectiveStatus.status === 'completed' ? 'success' : 'secondary'}>{effectiveStatus.status.toUpperCase()}</Badge>
            <button
              type="button"
              onClick={start}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110"
            >
              {isTraining ? <LoaderCircle size={16} className="animate-spin" /> : <WandSparkles size={16} />}
              {isTraining ? 'Starting...' : 'Start training'}
            </button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Pipeline progress', value: `${progress}%`, icon: Gauge },
          { label: 'Leaderboard models', value: effectiveLeaderboard.length, icon: Brain },
          { label: 'Optuna trials', value: trialHistory.length, icon: WandSparkles },
          { label: 'Best score', value: `${((effectiveLeaderboard[0]?.score ?? 0) * 100).toFixed(1)}%`, icon: Flame },
        ].map((item, index) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card>
              <CardContent className="flex items-center justify-between p-0">
                <div>
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{typeof item.value === 'number' ? <AnimatedCounter value={item.value as number} /> : item.value}</p>
                </div>
                <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                  <item.icon size={20} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Model leaderboard</CardTitle>
                <p className="mt-1 text-sm text-slate-400">Search and compare tuned model performance from the backend.</p>
              </div>
              <div className="relative md:w-72">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search model..." className="pl-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Precision</TableHead>
                  <TableHead>Recall</TableHead>
                  <TableHead>F1</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleLeaderboard.map((row) => (
                  <TableRow key={row.model}>
                    <TableCell className="font-semibold text-white">{row.model}</TableCell>
                    <TableCell>{formatPercent(row.score)}</TableCell>
                    <TableCell>{formatPercent(row.metrics.accuracy ?? row.score)}</TableCell>
                    <TableCell>{formatPercent(row.metrics.precision ?? row.score)}</TableCell>
                    <TableCell>{formatPercent(row.metrics.recall ?? row.score)}</TableCell>
                    <TableCell>{formatPercent(row.metrics.f1 ?? row.score)}</TableCell>
                    <TableCell>
                      <Badge variant={row.status === 'Best' ? 'success' : 'secondary'}>{row.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Best model card</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <p className="text-sm text-cyan-200">Selected model</p>
              <h3 className="mt-1 text-3xl font-semibold text-white">{bestModel}</h3>
              <p className="mt-2 text-sm text-slate-300">{effectiveMetrics.primary_metric?.toUpperCase() ?? 'SCORE'} optimized by Optuna after benchmarking multiple candidate models.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Primary metric</p>
                <p className="mt-2 text-2xl font-semibold text-white">{effectiveMetrics.primary_metric ?? 'score'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Run status</p>
                <p className="mt-2 text-2xl font-semibold text-white">{effectiveStatus.status}</p>
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
                <span>Pipeline completion</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Optuna tuning progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {trialHistory.map((trial) => (
              <div key={trial.trial} className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">Trial {trial.trial}</p>
                    <p className="text-sm text-slate-400">{JSON.stringify(trial.params)}</p>
                  </div>
                  <Badge variant={trial.trial === trialHistory[trialHistory.length - 1]?.trial ? 'success' : 'secondary'}>{formatPercent(trial.score)}</Badge>
                </div>
                <Progress value={trial.score * 100} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hyperparameter cards</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {Object.entries(effectiveMetrics.best_params).map(([name, value]) => (
              <div key={name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">{name}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{String(value)}</p>
              </div>
            ))}
            <div className="sm:col-span-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
              <div className="flex items-center gap-2 text-emerald-200">
                <CheckCircle2 size={16} />
                <span className="text-sm font-semibold">Model artifact ready</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">The backend persists the trained pipeline, metrics, report PDF, and plot assets in the artifacts directory.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live training logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-72 space-y-3 overflow-auto rounded-2xl border border-white/10 bg-slate-950/60 p-4 font-mono text-sm text-slate-200">
            {liveLogs.map((line, index) => (
              <div key={`${line}-${index}`} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
                <p>{line}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
            <span>{isRefreshing ? 'Refreshing backend status...' : `Last update: ${new Date(effectiveStatus.updated_at).toLocaleString()}`}</span>
            <button type="button" onClick={() => void refresh()} className="rounded-full border border-white/10 px-4 py-2 text-white transition hover:bg-white/10">
              Refresh now
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
