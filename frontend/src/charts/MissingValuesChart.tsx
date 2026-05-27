import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type MissingValuesChartProps = {
  data: { column: string; percent: number }[];
};

const colors = ['#22d3ee', '#8b5cf6', '#f43f5e', '#10b981', '#f59e0b'];

export function MissingValuesChart({ data }: MissingValuesChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Missing values</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px]">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 12, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="column" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(2,6,23,0.92)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 }} />
              <Bar dataKey="percent" radius={[12, 12, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={entry.column} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 px-6 text-center text-sm text-slate-400">
            No missing values were detected in the uploaded CSV.
          </div>
        )}
      </CardContent>
    </Card>
  );
}