import { Lightbulb } from 'lucide-react';
import type { Insights } from '@/lib/analytics';
import { hookOf } from '@/lib/analytics';
import { formatNumber } from '@/lib/utils';
import { AgentCard, Section } from './AgentCard';

export interface Idea {
  title: string;
  rationale: string;
  source: string;
}

/**
 * Ideator — turns competitor wins, content gaps, and my own best posts into
 * concrete, sourced content ideas.
 */
export function deriveIdeas(insights: Insights): Idea[] {
  const ideas: Idea[] = [];

  // 1. Model the top competitor posts.
  for (const p of insights.field.topPosts.slice(0, 3)) {
    ideas.push({
      title: `Recreate: "${hookOf(p) || 'top niche post'}"`,
      rationale: `${formatNumber(p.likes + p.comments)} engagement for @${p.ownerUsername}. Adapt the angle to your voice.`,
      source: `@${p.ownerUsername}`,
    });
  }

  // 2. Attack the hashtag/topic gaps.
  for (const h of insights.hashtagGaps.slice(0, 2)) {
    ideas.push({
      title: `Make a reel around #${h.tag}`,
      rationale: `Competitors average ${formatNumber(h.avgEngagement)} on #${h.tag}, and you don't use it yet.`,
      source: 'content gap',
    });
  }

  // 3. Double down on my own best-performing post.
  const mine = insights.me.topPosts[0];
  if (mine) {
    ideas.push({
      title: `Do a part 2 of your best: "${hookOf(mine) || 'top post'}"`,
      rationale: `Your strongest post (${formatNumber(mine.likes + mine.comments)}). Series compound reach.`,
      source: 'your history',
    });
  }

  return ideas;
}

export function Ideator({ insights }: { insights: Insights }) {
  const ideas = deriveIdeas(insights);
  return (
    <AgentCard
      icon={Lightbulb}
      name="Ideator"
      tagline="Ideas from trends, competitors & your history"
      status="active"
      iconClass="bg-warn/15 text-warn"
      headline={`${ideas.length} ideas generated from ${insights.competitors.length} competitors and ${insights.hashtagGaps.length} content gaps.`}
    >
      <Section label="Suggested ideas">
        <ol className="space-y-2">
          {ideas.map((idea, i) => (
            <li key={i} className="rounded-lg bg-panel-2 p-2.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium">{idea.title}</span>
                <span className="shrink-0 rounded bg-black/20 px-1.5 py-0.5 text-[10px] text-muted">
                  {idea.source}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">{idea.rationale}</p>
            </li>
          ))}
        </ol>
      </Section>
    </AgentCard>
  );
}
