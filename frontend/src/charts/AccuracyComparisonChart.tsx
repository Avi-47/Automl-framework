import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AccuracyComparisonChart({ data }: { data: { model: string; accuracy: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accuracy comparison</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="model" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'rgba(2,6,23,0.92)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 }} />
            <Legend />
            <Bar dataKey="accuracy" fill="#22d3ee" radius={[12, 12, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}