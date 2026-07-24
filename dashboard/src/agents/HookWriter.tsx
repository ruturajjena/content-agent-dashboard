import { PenLine } from 'lucide-react';
import type { Insights } from '@/lib/analytics';
import { hookOf } from '@/lib/analytics';
import { AgentCard, Section } from './AgentCard';

/**
 * Hook & Script Writer — studies winning hooks in the niche and produces
 * ready-to-use hooks, a script skeleton, a CTA, and SEO hashtags.
 */
export function deriveWriting(insights: Insights) {
  // Winning hooks pulled from the top niche posts (real, proven openers).
  const provenHooks = insights.field.topPosts
    .map(hookOf)
    .filter(Boolean)
    .slice(0, 3);

  // Hook templates derived from what performs here (comment-CTA mechanics win).
  const hookTemplates = [
    'Comment "[keyword]" and I\'ll send you [resource] 👇',
    'You no longer need [old way] to [outcome].',
    'How I [impressive result] with [tool] (steal this) 🧵',
  ];

  // SEO hashtags: proven niche tags + gaps you're missing.
  const seoHashtags = [
    ...insights.field.topHashtags.slice(0, 6).map((h) => h.tag),
    ...insights.hashtagGaps.slice(0, 4).map((h) => h.tag),
  ];
  const uniqueHashtags = Array.from(new Set(seoHashtags)).slice(0, 10);

  return { provenHooks, hookTemplates, seoHashtags: uniqueHashtags };
}

export function HookWriter({ insights }: { insights: Insights }) {
  const { provenHooks, hookTemplates, seoHashtags } = deriveWriting(insights);
  return (
    <AgentCard
      icon={PenLine}
      name="Hook & Script Writer"
      tagline="Hooks, scripts, captions, CTAs & SEO tags"
      status="active"
      iconClass="bg-accent/15 text-accent"
      headline="Hook templates modeled on the highest-engagement posts in your niche."
    >
      <Section label="Hook templates">
        <ul className="space-y-1.5">
          {hookTemplates.map((h, i) => (
            <li key={i} className="rounded-lg bg-panel-2 p-2 text-sm">
              {h}
            </li>
          ))}
        </ul>
      </Section>

      <Section label="Proven hooks in your niche">
        <ul className="space-y-1 text-xs text-muted">
          {provenHooks.map((h, i) => (
            <li key={i} className="truncate">
              • {h}
            </li>
          ))}
        </ul>
      </Section>

      <Section label="Caption skeleton">
        <pre className="whitespace-pre-wrap rounded-lg bg-panel-2 p-2.5 text-xs text-text/90">
{`[Hook line — stop the scroll]

[1–2 lines of value / the "how"]

[CTA — "Comment X" or "Save this"]`}
        </pre>
      </Section>

      <Section label="Recommended SEO hashtags">
        <div className="flex flex-wrap gap-1.5">
          {seoHashtags.map((t) => (
            <span key={t} className="rounded-md bg-accent/10 px-2 py-0.5 text-xs text-accent">
              #{t}
            </span>
          ))}
        </div>
      </Section>
    </AgentCard>
  );
}
