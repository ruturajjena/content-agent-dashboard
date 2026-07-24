/**
 * Engagement analytics — the core "how well did content perform" math.
 *
 * We don't have follower counts (not scraped), so engagement is measured as
 * absolute interactions (likes + comments) per post and averaged per account.
 * That's an honest, comparable signal across accounts of similar size.
 */

import type { Post } from '@/types';

/** Total interactions on a single post. */
export function postEngagement(p: Post): number {
  return p.likes + p.comments;
}

/** Average of a numeric list (0 for empty). */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

/** Median of a numeric list (0 for empty). */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
    : (sorted[mid] ?? 0);
}

export interface EngagementSummary {
  avgLikes: number;
  avgComments: number;
  avgEngagement: number;
  medianEngagement: number;
  totalEngagement: number;
}

/** Roll a set of posts into an engagement summary. */
export function summarize(posts: Post[]): EngagementSummary {
  const eng = posts.map(postEngagement);
  return {
    avgLikes: Math.round(mean(posts.map((p) => p.likes))),
    avgComments: Math.round(mean(posts.map((p) => p.comments))),
    avgEngagement: Math.round(mean(eng)),
    medianEngagement: Math.round(median(eng)),
    totalEngagement: eng.reduce((s, v) => s + v, 0),
  };
}

export interface FormatComparison {
  reelAvgEngagement: number;
  imageAvgEngagement: number;
  reelShare: number; // 0..1
  /** How much better reels do vs non-reels, e.g. 1.4 = 40% better. Null if N/A. */
  reelLift: number | null;
}

/** Compare reel performance against everything else. */
export function compareFormats(posts: Post[]): FormatComparison {
  const reels = posts.filter((p) => p.isReel);
  const others = posts.filter((p) => !p.isReel);
  const reelAvg = Math.round(mean(reels.map(postEngagement)));
  const otherAvg = Math.round(mean(others.map(postEngagement)));
  return {
    reelAvgEngagement: reelAvg,
    imageAvgEngagement: otherAvg,
    reelShare: posts.length ? reels.length / posts.length : 0,
    reelLift: otherAvg > 0 ? reelAvg / otherAvg : null,
  };
}
