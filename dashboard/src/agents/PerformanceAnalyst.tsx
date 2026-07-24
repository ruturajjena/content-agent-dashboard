import { BarChart3 } from 'lucide-react';
import type { Insights } from '@/lib/analytics';
import { hookOf } from '@/lib/analytics';
import { formatNumber } from '@/lib/utils';
import { AgentCard, Section } from './AgentCard';

/**
 * Performance Analyst — reports my engagement, top content, and the patterns
 * worth acting on, benchmarked against the niche.
 */
export function deriveRecommendations(insights: Insights): string[] {
  const recs: string[] = [];
  const me = insights.me;

  if (me.formats.reelLift && me.formats.reelLift > 1.2) {
    recs.push(
      `Reels earn ${me.formats.reelLift.toFixed(1)}× your other posts — go reel-first.`,
    );
  }
  if (me.bestDay && me.bestHour) {
    recs.push(`Your peak slot is ${me.bestDay.label} around ${me.bestHour.label}.`);
  }
  if (insights.relativeEngagement !== null && insights.relativeEngagement < 0.8) {
    recs.push(
      `You're at ${insights.relativeEngagement}× the niche average — adopt comment-CTA hooks that drive the leaders.`,
    );
  }
  if (insights.hashtagGaps[0]) {
    recs.push(`Start using #${insights.hashtagGaps[0].tag} — a proven niche tag you're missing.`);
  }
  return recs;
}

export function PerformanceAnalyst({ insights }: { insights: Insights }) {
  const me = insights.me;
  const recs = deriveRecommendations(insights);
  return (
    <AgentCard
      icon={BarChart3}
      name="Performance Analyst"
      tagline="Engagement, top content & patterns"
      status="active"
      iconClass="bg-good/15 text-good"
      headline={`Avg ${formatNumber(me.engagement.avgEngagement)} engagement/post · ${
        insights.relativeEngagement ?? '—'
      }× the niche average.`}
    >
      <Section label="Key metrics">
        <div className="grid grid-cols-3 gap-2 text-center">
          <Metric label="Avg likes" value={formatNumber(me.engagement.avgLikes)} />
          <Metric label="Avg comments" value={formatNumber(me.engagement.avgComments)} />
          <Metric label="Reel share" value={`${Math.round(me.formats.reelShare * 100)}%`} />
        </div>
      </Section>

      <Section label="Your top posts">
        <ul className="space-y-1">
          {me.topPosts.slice(0, 3).map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 text-xs">
              <span className="truncate text-muted">{hookOf(p) || '(no caption)'}</span>
              <span className="shrink-0 font-medium">{formatNumber(p.likes + p.comments)}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section label="Recommendations">
        <ul className="space-y-1 text-xs">
          {recs.map((r, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-good">→</span>
              <span className="text-text/90">{r}</span>
            </li>
          ))}
        </ul>
      </Section>
    </AgentCard>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-panel-2 py-2">
      <div className="text-base font-semibold">{value}</div>
      <div className="text-[10px] text-muted">{label}</div>
    </div>
  );
}
