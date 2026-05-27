import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const colors = ['#22d3ee', '#8b5cf6', '#14b8a6'];

export function ClassDistributionChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Class distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip contentStyle={{ background: 'rgba(2,6,23,0.92)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 }} />
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={72} outerRadius={118} paddingAngle={4}>
              {data.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}