import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type CorrelationHeatmapProps = {
  labels: string[];
  matrix: number[][];
};

export function CorrelationHeatmap({ labels, matrix }: CorrelationHeatmapProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Correlation heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 text-xs sm:gap-3">
          <div className="grid grid-cols-[90px_repeat(5,minmax(0,1fr))] gap-2 text-slate-400 sm:gap-3">
            <div />
            {labels.map((label) => <div key={label} className="text-center">{label}</div>)}
          </div>
          {labels.map((rowLabel, rowIndex) => (
            <div key={rowLabel} className="grid grid-cols-[90px_repeat(5,minmax(0,1fr))] gap-2 sm:gap-3">
              <div className="flex items-center text-slate-400">{rowLabel}</div>
              {matrix[rowIndex].map((value, columnIndex) => (
                <div
                  key={`${rowLabel}-${labels[columnIndex]}`}
                  className="flex min-h-14 items-center justify-center rounded-2xl border border-white/10 text-white transition hover:scale-[1.02]"
                  style={{
                    backgroundColor: `rgba(34, 211, 238, ${Math.abs(value) * 0.52 + 0.04})`,
                  }}
                >
                  {value.toFixed(2)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}