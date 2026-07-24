/**
 * Hashtag analytics — which tags appear, and which actually drive engagement.
 *
 * Powers the Ideator (what's working in the niche) and the Hook & Script
 * Writer (which SEO hashtags to attach).
 */

import type { Post } from '@/types';
import { postEngagement } from './engagement';

export interface HashtagStat {
  tag: string;
  count: number;
  totalEngagement: number;
  avgEngagement: number;
}

/** Aggregate hashtag usage + performance across a set of posts. */
export function hashtagStats(posts: Post[]): HashtagStat[] {
  const map = new Map<string, { count: number; total: number }>();
  for (const p of posts) {
    const eng = postEngagement(p);
    for (const raw of p.hashtags) {
      const tag = raw.toLowerCase();
      const entry = map.get(tag) ?? { count: 0, total: 0 };
      entry.count += 1;
      entry.total += eng;
      map.set(tag, entry);
    }
  }
  return Array.from(map.entries())
    .map(([tag, { count, total }]) => ({
      tag,
      count,
      totalEngagement: total,
      avgEngagement: Math.round(total / count),
    }))
    .sort((a, b) => b.totalEngagement - a.totalEngagement);
}

/** Top N hashtags by total engagement. */
export function topHashtags(posts: Post[], n = 10): HashtagStat[] {
  return hashtagStats(posts).slice(0, n);
}

/**
 * Content-gap tags: hashtags competitors use well that I rarely/never use.
 * A concrete "try these" list for the Ideator.
 */
export function hashtagGaps(
  myPosts: Post[],
  competitorPosts: Post[],
  n = 10,
): HashtagStat[] {
  const mine = new Set(hashtagStats(myPosts).map((h) => h.tag));
  return hashtagStats(competitorPosts)
    .filter((h) => !mine.has(h.tag) && h.count >= 2)
    .slice(0, n);
}
