import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function FeatureImportanceChart({ data }: { data: { feature: string; importance: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature importance</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis type="number" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="feature" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} width={90} />
            <Tooltip contentStyle={{ background: 'rgba(2,6,23,0.92)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 }} />
            <Bar dataKey="importance" radius={[0, 14, 14, 0]} fill="url(#importanceGradient)" />
            <defs>
              <linearGradient id="importanceGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}