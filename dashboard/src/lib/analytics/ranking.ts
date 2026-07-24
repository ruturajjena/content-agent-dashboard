/**
 * Ranking analytics — surface the best and worst content.
 *
 * The Performance Analyst uses this to show what to double down on, and the
 * Hook & Script Writer studies top captions to model winning hooks.
 */

import type { Post } from '@/types';
import { postEngagement } from './engagement';

/** Posts sorted by engagement, highest first. */
export function rankByEngagement(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => postEngagement(b) - postEngagement(a));
}

/** Top N performing posts. */
export function topPosts(posts: Post[], n = 5): Post[] {
  return rankByEngagement(posts).slice(0, n);
}

/** Bottom N performing posts (that still have some data). */
export function bottomPosts(posts: Post[], n = 5): Post[] {
  return rankByEngagement(posts).slice(-n).reverse();
}

/** First line of a caption — the "hook". */
export function hookOf(p: Post): string {
  const firstLine = p.caption.split('\n').map((l) => l.trim()).find(Boolean) ?? '';
  return firstLine.length > 120 ? `${firstLine.slice(0, 117)}…` : firstLine;
}
