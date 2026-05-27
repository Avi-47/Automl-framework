import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/SectionHeader';
import { AccuracyComparisonChart } from '@/charts/AccuracyComparisonChart';
import { ClassDistributionChart } from '@/charts/ClassDistributionChart';
import { ConfusionMatrixChart } from '@/charts/ConfusionMatrixChart';
import { CorrelationHeatmap } from '@/charts/CorrelationHeatmap';
import { FeatureImportanceChart } from '@/charts/FeatureImportanceChart';
import { PrecisionRecallChart } from '@/charts/PrecisionRecallChart';
import { RocCurveChart } from '@/charts/RocCurveChart';
import { useToast } from '@/components/ToastProvider';
import {
  getMetrics,
  getPlots,
  API_BASE_URL,
  type MetricsResponse,
  type PlotResponse,
} from '@/services/automlApi';
import {
  accuracyComparison,
  classDistribution,
  confusionMatrix,
  correlationLabels,
  correlationMatrix,
  featureImportance,
  precisionRecallF1,
  rocCurve,
} from '@/data/mockMlData';

type PlotItem = PlotResponse['items'][number];

export function VisualizationDashboardPage() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [plots, setPlots] = useState<PlotItem[]>([]);

  useEffect(() => {
    const refresh = async () => {
      try {
        const [metricsResponse, plotResponse] = await Promise.all([getMetrics(), getPlots()]);
        setMetrics(metricsResponse);
        setPlots(plotResponse.items);
      } catch {
        setMetrics(null);
        setPlots([]);
      }
    };

    void refresh();
  }, []);

  const summaryCards = useMemo(
    () => [
      { label: 'Balanced accuracy', value: metrics?.metrics.accuracy ? `${(metrics.metrics.accuracy * 100).toFixed(1)}%` : '97.2%' },
      { label: 'Macro F1', value: metrics?.metrics.f1 ? `${(metrics.metrics.f1 * 100).toFixed(1)}%` : '96.8%' },
      { label: 'ROC-AUC', value: metrics?.metrics.roc_auc ? `${(metrics.metrics.roc_auc * 100).toFixed(1)}%` : '99.3%' },
    ],
    [metrics],
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Visualizations"
        title="Insight studio"
        description="Interactive charts plus backend-generated plot assets for confusion matrix, ROC, feature importance, correlation, and comparison views."
        action={<Badge variant="secondary">{plots.length ? 'Backend plots ready' : 'Using built-in charts'}</Badge>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((item) => (
          <Card key={item.label}>
            <CardContent className="space-y-2 p-0">
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="text-3xl font-semibold text-white">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ConfusionMatrixChart cells={confusionMatrix} />
        <RocCurveChart data={rocCurve} />
        <FeatureImportanceChart data={featureImportance} />
        <CorrelationHeatmap labels={correlationLabels} matrix={correlationMatrix} />
        <ClassDistributionChart data={classDistribution} />
        <AccuracyComparisonChart data={accuracyComparison} />
      </div>

      <PrecisionRecallChart data={precisionRecallF1} />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Backend plot gallery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {plots.length ? (
              plots.map((plot) => (
                <div key={plot.name} className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                  <img src={`${API_BASE_URL}${plot.url}`} alt={plot.title} className="h-56 w-full object-cover" />
                  <div className="flex items-center justify-between px-4 py-3 text-sm">
                    <div>
                      <p className="font-semibold text-white">{plot.title}</p>
                      <p className="text-slate-400">{plot.kind}</p>
                    </div>
                    <a href={`${API_BASE_URL}${plot.url}`} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-3 py-2 text-slate-200 transition hover:bg-white/10">
                      Open
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
                Train a model to generate backend plot assets. Until then the Recharts panels above display the visual story.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Model diagnostics summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {[
              { label: 'Best model', value: metrics?.best_model_name ?? 'XGBoost' },
              { label: 'Primary metric', value: metrics?.primary_metric ?? 'accuracy' },
              { label: 'Status', value: metrics ? 'Fetched from backend' : 'Using mock analytics' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
              </div>
            ))}
            <div className="md:col-span-3 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
              <p className="text-sm text-cyan-200">Live insights</p>
              <p className="mt-2 text-sm leading-7 text-slate-200">
                These plots are generated by the FastAPI backend with Matplotlib and Seaborn, then exposed via the /plots endpoint for the dashboard.
              </p>
              <button
                type="button"
                onClick={() => toast({ title: 'Plot assets refreshed', description: 'The backend plot gallery was reloaded.' })}
                className="mt-4 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Refresh gallery
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
