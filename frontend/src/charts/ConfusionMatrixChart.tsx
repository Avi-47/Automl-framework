import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/utils/cn';

type MatrixCell = {
  actual: string;
  predicted: string;
  value: number;
};

type ConfusionMatrixChartProps = {
  cells: MatrixCell[];
};

const labels = ['Class A', 'Class B', 'Class C'];

export function ConfusionMatrixChart({ cells }: ConfusionMatrixChartProps) {
  const max = Math.max(...cells.map((cell) => cell.value));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Confusion matrix</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[auto_repeat(3,minmax(0,1fr))] gap-2 text-xs">
          <div />
          {labels.map((label) => <div key={label} className="px-2 py-1 text-center text-slate-400">{label}</div>)}
          {labels.map((rowLabel) => (
            <>
              <div key={`${rowLabel}-label`} className="flex items-center px-2 py-4 text-slate-400">{rowLabel}</div>
              {labels.map((columnLabel) => {
                const cell = cells.find((entry) => entry.actual === rowLabel && entry.predicted === columnLabel)!;
                const intensity = cell.value / max;
                return (
                  <div
                    key={`${rowLabel}-${columnLabel}`}
                    className={cn('flex min-h-24 flex-col items-center justify-center rounded-2xl border border-white/10 text-white transition hover:scale-[1.02]',
                      intensity > 0.85 && 'bg-cyan-400/25',
                      intensity > 0.6 && intensity <= 0.85 && 'bg-cyan-400/18',
                      intensity > 0.35 && intensity <= 0.6 && 'bg-violet-400/14',
                      intensity <= 0.35 && 'bg-white/5',
                    )}
                  >
                    <span className="text-lg font-semibold">{cell.value}</span>
                    <span className="mt-1 text-[11px] text-slate-300">{Math.round(intensity * 100)}%</span>
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}