import { MessageSquare } from 'lucide-react';
import { allAccounts } from '@/lib/data';
import { AgentCard, Section } from './AgentCard';

/**
 * DM Manager.
 *
 * Instagram DMs are private and CANNOT be scraped via Apify. Rather than fake
 * inbox data, this agent runs on what we *do* have — @mentions across the niche
 * as real collaboration signals — and clearly marks the DM inbox features as
 * awaiting a proper source (Instagram Graph API + a Business account).
 */
export function deriveCollabSignals(limit = 6): { account: string; mentions: number }[] {
  const counts = new Map<string, number>();
  for (const account of allAccounts) {
    for (const post of account.posts) {
      for (const m of post.mentions) {
        const tag = m.toLowerCase();
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
  }
  return Array.from(counts.entries())
    .map(([account, mentions]) => ({ account, mentions }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, limit);
}

// Clearly-labelled illustrative sample of the DM triage this agent will do
// once a DM source is connected. NOT real data.
const SAMPLE_DMS = [
  { category: 'Collab', text: '"Hey, want to collab on a reel?"', reply: 'Thanks! What did you have in mind — a duet or a joint tutorial?' },
  { category: 'Lead', text: '"Do you take on client websites?"', reply: 'Yes! Sharing my packages + a Calendly link now.' },
  { category: 'Question', text: '"Which tool did you use in the last reel?"', reply: 'That was built with Claude — tutorial is pinned on my profile.' },
];

export function DmManager() {
  const collabs = deriveCollabSignals();
  return (
    <AgentCard
      icon={MessageSquare}
      name="DM Manager"
      tagline="DM triage, replies & collab spotting"
      status="attention"
      iconClass="bg-bad/15 text-bad"
      headline="DMs are private and can't be scraped. Running on real @mention signals; inbox triage awaits a DM source."
    >
      <Section label="Collaboration signals (real — from @mentions)">
        {collabs.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {collabs.map((c) => (
              <span key={c.account} className="rounded-md bg-panel-2 px-2 py-0.5 text-xs">
                @{c.account} <span className="text-muted">·{c.mentions}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted">No @mentions found in the current snapshot.</p>
        )}
      </Section>

      <Section label="DM triage preview (sample — awaiting DM API)">
        <ul className="space-y-1.5">
          {SAMPLE_DMS.map((d, i) => (
            <li key={i} className="rounded-lg bg-panel-2 p-2">
              <div className="flex items-center gap-2">
                <span className="rounded bg-black/20 px-1.5 py-0.5 text-[10px] text-muted">
                  {d.category}
                </span>
                <span className="truncate text-xs">{d.text}</span>
              </div>
              <p className="mt-1 text-[11px] text-muted">↳ Suggested: {d.reply}</p>
            </li>
          ))}
        </ul>
      </Section>
    </AgentCard>
  );
}
