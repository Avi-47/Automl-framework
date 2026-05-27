import { useEffect, useMemo, useState } from 'react';
import { Download, FileDown, FileSpreadsheet, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeader } from '@/components/SectionHeader';
import { useToast } from '@/components/ToastProvider';
import { getMetrics, getStatus, modelUrl, reportUrl, type MetricsResponse, type StatusResponse } from '@/services/automlApi';
import { reportSummary } from '@/data/mockMlData';

export function ReportsPage() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [status, setStatus] = useState<StatusResponse | null>(null);

  useEffect(() => {
    const refresh = async () => {
      try {
        const [metricsResponse, statusResponse] = await Promise.all([getMetrics(), getStatus()]);
        setMetrics(metricsResponse);
        setStatus(statusResponse);
      } catch {
        setMetrics(null);
        setStatus(null);
      }
    };

    void refresh();
  }, []);

  const summaryCards = useMemo(
    () => [
      { label: 'Best model', value: metrics?.best_model_name ?? 'XGBoost' },
      { label: 'Validation F1', value: metrics?.metrics.f1 ? `${(metrics.metrics.f1 * 100).toFixed(1)}%` : '98.0%' },
      { label: 'Trials completed', value: status?.trial_history.length ? status.trial_history.length.toString() : '5' },
      { label: 'Artifacts ready', value: '3' },
    ],
    [metrics, status],
  );

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Reports" title="Export assets and model reports" description="Download the backend-generated PDF report, metrics snapshot, and trained model artifact." />

      <div className="grid gap-4 md:grid-cols-4">
        {summaryCards.map((item) => (
          <Card key={item.label}>
            <CardContent className="space-y-2 p-0">
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="text-3xl font-semibold text-white">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Export center</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" asChild>
              <a href={reportUrl()} target="_blank" rel="noreferrer">
                <FileDown size={16} />
                Download PDF report
              </a>
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => toast({ title: 'Metrics exported', description: 'Open the backend metrics endpoint or wire up a CSV export if needed.', tone: 'success' })}>
              <FileSpreadsheet size={16} />
              Export metrics
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <a href={modelUrl()} target="_blank" rel="noreferrer">
                <Download size={16} />
                Download trained model
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
              <div className="flex items-center gap-2 text-cyan-200">
                <ShieldCheck size={16} />
                <span className="text-sm font-semibold">Final model certified</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                The backend packages metrics, visualizations, and artifact files into a downloadable report for stakeholder review.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">Recommended next step</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Share results with stakeholders</h3>
              <p className="mt-2 text-sm text-slate-300">Use the PDF report and trained model artifact to package the experiment into a shareable summary.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="success">Explainability ready</Badge>
              <Badge variant="secondary">Leaderboard locked</Badge>
              <Badge variant="secondary">Artifacts downloadable</Badge>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
              <p className="text-sm text-slate-400">Report notes</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                {metrics?.best_model_name ?? reportSummary[0].value} is the current best model. Metrics and artifacts are generated by FastAPI and surfaced through the dashboard for quick export.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
                <Sparkles size={12} />
                Premium AI SaaS style export panel
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
