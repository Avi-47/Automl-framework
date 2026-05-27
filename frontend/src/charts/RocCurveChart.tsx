import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function RocCurveChart({ data }: { data: { fpr: number; tpr: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ROC curve</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="rocFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="fpr" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'rgba(2,6,23,0.92)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 }} />
            <Area type="monotone" dataKey="tpr" stroke="#22d3ee" fill="url(#rocFill)" strokeWidth={3} />
            <Line type="monotone" dataKey="fpr" stroke="#f8fafc" strokeDasharray="6 6" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}