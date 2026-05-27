import { useMemo, useState } from 'react';
import { Download, FileUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SectionHeader } from '@/components/SectionHeader';
import { useToast } from '@/components/ToastProvider';
import { Progress } from '@/components/ui/progress';
import { predictDataset, type PredictResponse } from '@/services/automlApi';

type PredictionRow = PredictResponse['rows'][number];

export function PredictionPage() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictResponse | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const rows = predictionResult?.rows ?? [];

  const exportCsv = () => {
    if (!rows.length) {
      toast({ title: 'No predictions available', description: 'Run prediction first.', tone: 'warning' });
      return;
    }

    const headers = ['row_index', 'prediction', 'confidence'];
    const csvLines = [
      headers.join(','),
      ...rows.map((row) => [row.row_index, JSON.stringify(row.prediction), row.confidence ?? ''].join(',')),
    ];

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'predictions.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const summaryCards = useMemo(
    () => [
      { label: 'Rows scored', value: rows.length.toLocaleString() || '0' },
      { label: 'Average confidence', value: rows.length ? `${(rows.reduce((sum, row) => sum + (row.confidence ?? 0), 0) / rows.length).toFixed(1)}%` : '—' },
      { label: 'Task type', value: predictionResult?.task_type?.toUpperCase() ?? '—' },
    ],
    [predictionResult?.task_type, rows],
  );

  const handleFileSelect = async (file: File | null) => {
    setSelectedFile(file);

    if (!file) {
      setPredictionResult(null);
      return;
    }

    try {
      setIsPredicting(true);
      const response = await predictDataset(file);
      setPredictionResult(response);
      toast({ title: 'Predictions ready', description: `${response.row_count.toLocaleString()} rows scored successfully.`, tone: 'success' });
    } catch {
      setPredictionResult(null);
      toast({ title: 'Prediction backend unavailable', description: 'Train a model on the backend before scoring files.', tone: 'warning' });
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Predictions" title="Generate prediction outputs" description="Upload a scoring CSV, call the backend /predict endpoint, and review probability bars plus exportable results." />

      <Card className="border-dashed">
        <CardContent className="space-y-5 p-0">
          <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-white">Upload a scoring file</h3>
              <p className="mt-2 text-sm text-slate-300">This page sends a new CSV to the FastAPI backend and renders predictions, probabilities, and confidence bars.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="default" onClick={() => document.getElementById('prediction-input')?.click()}>
                <FileUp size={16} />
                Choose CSV
              </Button>
              <Button variant="outline" onClick={exportCsv}>
                <Download size={16} />
                Export CSV
              </Button>
            </div>
          </div>
          <div className="px-6 pb-6">
            <input
              id="prediction-input"
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => void handleFileSelect(event.target.files?.[0] ?? null)}
            />
            {selectedFile ? (
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">Selected file: {selectedFile.name}</div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-400">No prediction file selected yet.</div>
            )}
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
                <span>{isPredicting ? 'Scoring file...' : 'Prediction ready'}</span>
                <span>{predictionResult?.row_count ?? 0} rows</span>
              </div>
              <Progress value={predictionResult?.row_count ? 100 : 0} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((item) => (
          <Card key={item.label}>
            <CardContent className="space-y-3 p-0">
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="text-3xl font-semibold text-white">{item.value}</p>
              <Badge variant="secondary">Backend + frontend</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prediction results</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Record</TableHead>
                <TableHead>Prediction</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Probability scores</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row: PredictionRow) => (
                <TableRow key={row.row_index}>
                  <TableCell className="font-semibold text-white">#{row.row_index + 1}</TableCell>
                  <TableCell>
                    <Badge variant="success">{String(row.prediction)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-slate-300">
                        <span>{row.confidence ? row.confidence.toFixed(1) + '%' : '—'}</span>
                        <span>confidence</span>
                      </div>
                      <Progress value={row.confidence ?? 0} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {row.probabilities
                        ? Object.entries(row.probabilities).map(([label, value]) => (
                            <span key={label} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                              {label}: {(value * 100).toFixed(1)}%
                            </span>
                          ))
                        : (
                          <span className="text-sm text-slate-400">Probability scores are available for classification tasks.</span>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/10 to-fuchsia-400/10 p-5">
        <div className="flex items-center gap-2 text-cyan-200">
          <Sparkles size={16} />
          <span className="text-sm font-semibold">Production-style scoring panel</span>
        </div>
        <p className="mt-3 text-sm leading-7 text-slate-200">
          The backend returns predictions and confidence scores from the trained pipeline, while the frontend handles export, browsing, and presentation.
        </p>
      </div>
    </div>
  );
}
