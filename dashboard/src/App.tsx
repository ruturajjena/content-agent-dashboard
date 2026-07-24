import { Activity, Users, TrendingUp, Film } from 'lucide-react';
import { dataset, allAccounts } from '@/lib/data';
import { formatNumber } from '@/lib/utils';
import { computeInsights } from '@/lib/analytics';
import { CompetitorChart } from '@/components/charts/CompetitorChart';
import { BestTimeChart } from '@/components/charts/BestTimeChart';
import { Ideator } from '@/agents/Ideator';
import { HookWriter } from '@/agents/HookWriter';
import { ContentPlanner } from '@/agents/ContentPlanner';
import { PerformanceAnalyst } from '@/agents/PerformanceAnalyst';
import { DmManager } from '@/agents/DmManager';

const insights = computeInsights(dataset);

export default function App() {
  const totalPosts = allAccounts.reduce((s, a) => s + a.scrapedPosts, 0);
  const totalReels = allAccounts.reduce(
    (s, a) => s + a.posts.filter((p) => p.isReel).length,
    0,
  );
  const snapshot = new Date(dataset.generatedAt).toLocaleString();

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Content Agent — Operations Center
            </h1>
            <p className="text-sm text-muted">
              @{dataset.me.username} · snapshot {snapshot}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <HeaderStat icon={Users} label="Accounts" value={allAccounts.length} />
          <HeaderStat icon={TrendingUp} label="Posts" value={totalPosts} />
          <HeaderStat icon={Film} label="Reels" value={totalReels} />
          <HeaderStat
            icon={Activity}
            label="Niche avg eng."
            value={formatNumber(insights.field.avgEngagement)}
          />
        </div>
      </header>

      {/* Intelligence overview */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CompetitorChart insights={insights} />
        <BestTimeChart insights={insights} />
      </div>

      {/* Agent grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Ideator insights={insights} />
        <HookWriter insights={insights} />
        <ContentPlanner insights={insights} />
        <PerformanceAnalyst insights={insights} />
        <DmManager />
      </div>

      <footer className="mt-8 border-t border-border/50 pt-4 text-center text-xs text-muted">
        Content Agent · {allAccounts.length} accounts · {totalPosts} posts · run{' '}
        <code className="rounded bg-panel-2 px-1">npm run scrape</code> to refresh
      </footer>
    </div>
  );
}

function HeaderStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-panel px-3 py-2">
      <Icon className="h-4 w-4 text-muted" />
      <div>
        <div className="text-sm font-semibold leading-none">{value}</div>
        <div className="mt-0.5 text-[10px] text-muted">{label}</div>
      </div>
    </div>
  );
}
