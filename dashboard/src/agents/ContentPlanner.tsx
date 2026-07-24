import { CalendarDays } from 'lucide-react';
import type { Insights } from '@/lib/analytics';
import { DAYS } from '@/lib/analytics';
import { AgentCard, Section } from './AgentCard';

export interface PlannedDay {
  date: string;
  day: string;
  action: 'Post' | 'Engage';
  detail: string;
}

/**
 * Content Planner — builds a 7-day schedule from the user's own best days,
 * best hour, and posting cadence.
 */
export function derivePlan(insights: Insights, from = new Date()): PlannedDay[] {
  const me = insights.me;
  const bestHour = me.bestHour?.label ?? '18:00';

  // Which weekdays historically perform best for me → "Post" days.
  const rankedDays = [...me.byDay]
    .filter((d) => d.posts > 0)
    .sort((a, b) => b.avgEngagement - a.avgEngagement)
    .slice(0, 3)
    .map((d) => d.key);
  const postDays = new Set(rankedDays);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(from);
    date.setDate(from.getDate() + i);
    const dow = date.getDay();
    const isPost = postDays.has(dow);
    return {
      date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      day: DAYS[dow] ?? '',
      action: isPost ? 'Post' : 'Engage',
      detail: isPost
        ? `Reel + comment-CTA at ${bestHour}`
        : 'Reply to comments · story poll',
    };
  });
}

export function ContentPlanner({ insights }: { insights: Insights }) {
  const plan = derivePlan(insights);
  const cadence = insights.me.cadenceDays;
  return (
    <AgentCard
      icon={CalendarDays}
      name="Content Planner"
      tagline="Posting calendar & optimal schedule"
      status="active"
      iconClass="bg-accent-2/15 text-accent-2"
      headline={`Optimal schedule built from your best days${
        insights.me.bestHour ? ` and peak hour (${insights.me.bestHour.label})` : ''
      }.`}
    >
      <Section label="Next 7 days">
        <div className="space-y-1">
          {plan.map((d) => (
            <div
              key={d.date}
              className="flex items-center gap-3 rounded-lg bg-panel-2 px-2.5 py-1.5"
            >
              <div className="w-14 shrink-0">
                <div className="text-xs font-medium">{d.day}</div>
                <div className="text-[10px] text-muted">{d.date}</div>
              </div>
              <span
                className={
                  d.action === 'Post'
                    ? 'rounded bg-good/15 px-1.5 py-0.5 text-[10px] font-semibold text-good'
                    : 'rounded bg-panel px-1.5 py-0.5 text-[10px] font-semibold text-muted'
                }
              >
                {d.action}
              </span>
              <span className="truncate text-xs text-muted">{d.detail}</span>
            </div>
          ))}
        </div>
      </Section>
      {cadence !== null && (
        <p className="mt-3 text-xs text-muted">
          Your current cadence: ~1 post every {cadence} days.
        </p>
      )}
    </AgentCard>
  );
}
