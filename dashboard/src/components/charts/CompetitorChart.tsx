import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Insights } from '@/lib/analytics';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

/** Shorten a handle so axis labels stay readable. */
const short = (u: string) => (u.length > 10 ? `${u.slice(0, 9)}…` : u);

/**
 * Competitive landscape — average engagement per post, you vs each competitor.
 * The gap between your bar and the leaders is the story.
 */
export function CompetitorChart({ insights }: { insights: Insights }) {
  const data = [insights.me, ...insights.competitors].map((a) => ({
    name: short(a.username),
    value: a.engagement.avgEngagement,
    isSelf: a.isSelf,
  }));

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div>
          <h3 className="text-sm font-semibold">Competitive landscape</h3>
          <p className="text-xs text-muted">Avg engagement per post</p>
        </div>
      </CardHeader>
      <CardContent className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--color-border)' }}
              tickLine={false}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={48}
            />
            <YAxis
              tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => formatNumber(v)}
              width={36}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              contentStyle={{
                background: 'var(--color-panel-2)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                color: 'var(--color-text)',
                fontSize: 12,
              }}
              formatter={(v: number) => [formatNumber(v), 'Avg engagement']}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {data.map((d) => (
                <Cell
                  key={d.name}
                  fill={d.isSelf ? 'var(--color-accent)' : 'var(--color-accent-2)'}
                  fillOpacity={d.isSelf ? 1 : 0.55}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
