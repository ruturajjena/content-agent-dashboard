/**
 * Analytics aggregator — turns the raw Dataset into a single typed `Insights`
 * object that every agent panel reads from. One computation, shared by all.
 */

import type { Dataset, Post, AccountData } from '@/types';
import { summarize, compareFormats, type EngagementSummary, type FormatComparison } from './engagement';
import { byDayOfWeek, byHourOfDay, bestSlot, cadenceDays, type Slot } from './timing';
import { topHashtags, hashtagGaps, type HashtagStat } from './hashtags';
import { topPosts } from './ranking';

export * from './engagement';
export * from './timing';
export * from './hashtags';
export * from './ranking';

export interface AccountInsight {
  username: string;
  isSelf: boolean;
  postCount: number;
  engagement: EngagementSummary;
  formats: FormatComparison;
  byDay: Slot[];
  byHour: Slot[];
  bestDay: Slot | null;
  bestHour: Slot | null;
  cadenceDays: number | null;
  topHashtags: HashtagStat[];
  topPosts: Post[];
}

function analyzeAccount(account: AccountData): AccountInsight {
  const posts = account.posts;
  const byDay = byDayOfWeek(posts);
  const byHour = byHourOfDay(posts);
  return {
    username: account.username,
    isSelf: account.isSelf,
    postCount: posts.length,
    engagement: summarize(posts),
    formats: compareFormats(posts),
    byDay,
    byHour,
    bestDay: bestSlot(byDay),
    bestHour: bestSlot(byHour),
    cadenceDays: cadenceDays(posts),
    topHashtags: topHashtags(posts, 8),
    topPosts: topPosts(posts, 5),
  };
}

export interface Insights {
  generatedAt: string;
  me: AccountInsight;
  competitors: AccountInsight[];
  /** Every competitor post, pooled — the "field" the niche is playing on. */
  field: {
    avgEngagement: number;
    topHashtags: HashtagStat[];
    topPosts: Post[];
  };
  /** Hashtags competitors use well that I don't — Ideator fuel. */
  hashtagGaps: HashtagStat[];
  /** My avg engagement as a multiple of the competitor average (1 = on par). */
  relativeEngagement: number | null;
}

/** Compute the full insights bundle from a dataset. */
export function computeInsights(dataset: Dataset): Insights {
  const me = analyzeAccount(dataset.me);
  const competitors = dataset.competitors.map(analyzeAccount);

  const competitorPosts: Post[] = dataset.competitors.flatMap((c) => c.posts);
  const field = {
    avgEngagement: summarize(competitorPosts).avgEngagement,
    topHashtags: topHashtags(competitorPosts, 12),
    topPosts: topPosts(competitorPosts, 6),
  };

  return {
    generatedAt: dataset.generatedAt,
    me,
    competitors,
    field,
    hashtagGaps: hashtagGaps(dataset.me.posts, competitorPosts, 10),
    relativeEngagement:
      field.avgEngagement > 0
        ? +(me.engagement.avgEngagement / field.avgEngagement).toFixed(2)
        : null,
  };
}
