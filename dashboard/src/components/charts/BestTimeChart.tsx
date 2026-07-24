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

/**
 * Best time to post — your average engagement by day of week.
 * The peak day is highlighted; the Content Planner schedules against it.
 */
export function BestTimeChart({ insights }: { insights: Insights }) {
  const bestKey = insights.me.bestDay?.key;
  const data = insights.me.byDay.map((d) => ({
    name: d.label,
    value: d.avgEngagement,
    posts: d.posts,
    isBest: d.key === bestKey,
  }));

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div>
          <h3 className="text-sm font-semibold">Best time to post</h3>
          <p className="text-xs text-muted">Your avg engagement by weekday</p>
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
              formatter={(v: number, _n, item) => [
                `${formatNumber(v)} · ${item?.payload?.posts ?? 0} posts`,
                'Avg engagement',
              ]}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {data.map((d) => (
                <Cell
                  key={d.name}
                  fill={d.isBest ? 'var(--color-good)' : 'var(--color-border)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
