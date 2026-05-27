import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FileDropzone } from '@/components/FileDropzone';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MissingValuesChart } from '@/charts/MissingValuesChart';
import { useToast } from '@/components/ToastProvider';
import { useWorkspace } from '@/components/WorkspaceProvider';
import { SectionHeader } from '@/components/SectionHeader';
import { uploadDataset, type UploadResponse } from '@/services/automlApi';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

type PreviewRow = Record<string, unknown>;

type SummaryCard = {
  label: string;
  value: string;
  accent: 'cyan' | 'violet' | 'rose' | 'emerald';
  note: string;
};

function formatPreviewValue(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? value.toLocaleString()
      : value.toFixed(4).replace(/\.0+$/, '').replace(/(\.[0-9]*?)0+$/, '$1');
  }

  if (typeof value === 'boolean') {
    return value ? 'True' : 'False';
  }

  return String(value);
}

function formatColumnLabel(name: string) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getAccentVariant(accent: SummaryCard['accent']) {
  if (accent === 'emerald') return 'success';
  if (accent === 'rose') return 'warning';
  return 'secondary';
}

export function UploadDatasetPage() {
  const { toast } = useToast();
  const { activeDataset, setActiveDataset, clearActiveDataset } = useWorkspace();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filter, setFilter] = useState('');
  const [targetColumn, setTargetColumn] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(activeDataset?.upload ?? null);

  const previewSource = uploadResult?.preview_rows ?? [];
  const filteredPreview = useMemo(
    () => previewSource.filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(filter.toLowerCase()))),
    [filter, previewSource],
  );

  const previewColumns = useMemo(() => {
    const columns: string[] = [];
    const seen = new Set<string>();

    previewSource.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (!seen.has(key)) {
          seen.add(key);
          columns.push(key);
        }
      });
    });

    return columns;
  }, [previewSource]);

  const columnStats = uploadResult?.column_stats ?? [];

  const missingSource = uploadResult?.missing_summary?.length
    ? uploadResult.missing_summary.map((item) => ({ column: item.column, percent: item.percent }))
    : [];

  const datasetHealthScore = uploadResult?.dataset_health_score ?? 0;
  const summaryCards: SummaryCard[] = uploadResult
    ? [
        {
          label: 'Rows',
          value: uploadResult.row_count.toLocaleString(),
          accent: 'cyan',
          note: 'Rows ingested from the uploaded CSV',
        },
        {
          label: 'Columns',
          value: uploadResult.column_count.toString(),
          accent: 'violet',
          note: `${uploadResult.numeric_columns.length} numeric and ${uploadResult.categorical_columns.length} categorical`,
        },
        {
          label: 'Missing cells',
          value: uploadResult.missing_summary.reduce((sum, item) => sum + item.missing, 0).toLocaleString(),
          accent: 'rose',
          note: `${uploadResult.missing_summary.length} columns contain nulls`,
        },
        {
          label: 'Health score',
          value: uploadResult.dataset_health_score.toFixed(1),
          accent: 'emerald',
          note: `Target column: ${uploadResult.target_column}`,
        },
      ]
    : [
        { label: 'Rows', value: 'Upload CSV', accent: 'cyan', note: 'Real counts appear after upload' },
        { label: 'Columns', value: 'Pending', accent: 'violet', note: 'Schema is inferred from the dataset' },
        { label: 'Missing cells', value: 'Pending', accent: 'rose', note: 'Nulls will be summarized by the backend' },
        { label: 'Health score', value: 'Pending', accent: 'emerald', note: 'Backend profiling updates this live' },
      ];

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Upload"
        title="Load a CSV dataset"
        description="Upload a CSV to the FastAPI backend. The page updates with live task detection, dataset health, schema profiling, and row previews."
      />

      {activeDataset ? (
        <Card className="border-emerald-400/20 bg-emerald-400/10">
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-100">Currently loaded in this workspace</p>
              <p className="text-sm text-emerald-100/80">
                {activeDataset.fileName} · experiment {activeDataset.upload.experiment_id} · {activeDataset.upload.row_count.toLocaleString()} rows
              </p>
            </div>
            <Badge variant="success">Real backend upload</Badge>
          </CardContent>
        </Card>
      ) : null}

      <FileDropzone
        title="Drop your dataset here"
        description="The upload action calls the backend /upload endpoint and returns profiling metadata, detected task type, and preview rows."
        selectedFile={selectedFile}
        onFileSelect={async (file) => {
          setSelectedFile(file);

          if (!file) {
            setUploadResult(null);
            clearActiveDataset();
            toast({ title: 'Dataset reset', description: 'Upload state cleared.', tone: 'warning' });
            return;
          }

          setIsUploading(true);

          try {
            const response = await uploadDataset(file, targetColumn || undefined);
            setUploadResult(response);
            setActiveDataset({ fileName: file.name, uploadedAt: new Date().toISOString(), upload: response });
            toast({
              title: `Imported ${file.name}`,
              description: `${response.task_type.toUpperCase()} task detected with ${response.row_count.toLocaleString()} rows.`,
              tone: 'success',
            });
          } catch {
            setUploadResult(null);
            clearActiveDataset();
            toast({
              title: 'Upload fallback active',
              description: 'Backend is unavailable, so the dashboard is using local sample data.',
              tone: 'warning',
            });
          } finally {
            setIsUploading(false);
          }
        }}
      />

      <Card>
        <CardContent className="grid gap-4 p-0 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div>
            <p className="text-sm text-slate-400">Optional target column override</p>
            <Input value={targetColumn} onChange={(event) => setTargetColumn(event.target.value)} placeholder="Leave blank for auto-detection" className="mt-2 max-w-md" />
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={uploadResult ? 'success' : 'secondary'}>{uploadResult?.task_type?.toUpperCase() ?? 'AUTO DETECT'}</Badge>
            <Badge variant="secondary">{isUploading ? 'Uploading...' : 'Ready'}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card>
              <CardContent className="space-y-3 p-0">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm text-slate-400">{stat.label}</span>
                  <Badge variant={getAccentVariant(stat.accent)}>{stat.accent}</Badge>
                </div>
                <p className="text-3xl font-semibold text-white">{stat.value}</p>
                <p className="text-sm leading-6 text-slate-400">{stat.note}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <MissingValuesChart data={missingSource} />
        <Card>
          <CardHeader>
            <CardTitle>Column types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {uploadResult ? (
              columnStats.map((column) => (
                <div key={column.column} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-white">{formatColumnLabel(column.column)}</p>
                    <p className="text-sm text-slate-400">
                      {column.dtype} · {column.unique.toLocaleString()} unique
                    </p>
                  </div>
                  <Badge variant={column.missing > 0 ? 'warning' : 'success'}>
                    {column.missing > 0 ? `${column.missing} missing` : 'Complete'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-400">
                Upload a CSV to see per-column types, missingness, and uniqueness.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dataset health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>Quality score</span>
            <span>{uploadResult ? `${datasetHealthScore.toFixed(1)} / 100` : 'Upload CSV to calculate'}</span>
          </div>
          <Progress value={datasetHealthScore} />
          <p className="text-sm leading-7 text-slate-300">
            The backend calculates this from missingness, duplicates, and column sparsity so the score reflects the uploaded dataset instead of placeholder demo data.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Dataset preview</CardTitle>
              <p className="mt-1 text-sm text-slate-400">Live rows from the uploaded CSV rendered as a searchable table.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">{filteredPreview.length} rows visible</div>
              <input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Search rows..." className="h-10 w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-slate-500 sm:w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {previewColumns.length ? previewColumns.map((column) => <TableHead key={column}>{formatColumnLabel(column)}</TableHead>) : <TableHead>Upload a CSV to preview rows</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPreview.length ? (
                filteredPreview.map((row, index) => {
                  const typedRow = row as PreviewRow;

                  return (
                    <TableRow key={index}>
                      {previewColumns.map((column) => (
                        <TableCell key={column}>{formatPreviewValue(typedRow[column])}</TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={Math.max(previewColumns.length, 1)} className="py-8 text-center text-slate-400">
                    {uploadResult ? 'No rows matched your search.' : 'Upload a CSV file to inspect the live preview.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}