/**
 * Timing analytics — when does content post, and when does it perform best.
 *
 * Uses the viewer's local timezone (Date.getDay / getHours) so "best time"
 * recommendations are actionable for the person reading the dashboard.
 */

import type { Post } from '@/types';
import { postEngagement, mean } from './engagement';

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export interface Slot {
  /** 0=Sun … 6=Sat, or 0..23 for hours. */
  key: number;
  label: string;
  posts: number;
  avgEngagement: number;
}

/** Posts bucketed by day-of-week, with average engagement each. */
export function byDayOfWeek(posts: Post[]): Slot[] {
  return bucket(posts, (d) => d.getDay(), (k) => DAYS[k] ?? String(k), 7);
}

/** Posts bucketed by hour-of-day (0..23). */
export function byHourOfDay(posts: Post[]): Slot[] {
  return bucket(posts, (d) => d.getHours(), (k) => `${k}:00`, 24);
}

/** Generic bucketer over a time dimension. */
function bucket(
  posts: Post[],
  keyOf: (d: Date) => number,
  labelOf: (k: number) => string,
  size: number,
): Slot[] {
  const groups = new Map<number, number[]>();
  for (const p of posts) {
    if (!p.timestamp) continue;
    const d = new Date(p.timestamp);
    if (Number.isNaN(d.getTime())) continue;
    const k = keyOf(d);
    (groups.get(k) ?? groups.set(k, []).get(k)!).push(postEngagement(p));
  }
  return Array.from({ length: size }, (_, k) => {
    const eng = groups.get(k) ?? [];
    return {
      key: k,
      label: labelOf(k),
      posts: eng.length,
      avgEngagement: Math.round(mean(eng)),
    };
  });
}

/** The single best slot (by avg engagement, needing at least one post). */
export function bestSlot(slots: Slot[]): Slot | null {
  const withPosts = slots.filter((s) => s.posts > 0);
  if (withPosts.length === 0) return null;
  return withPosts.reduce((best, s) =>
    s.avgEngagement > best.avgEngagement ? s : best,
  );
}

/** Average days between consecutive posts (posting cadence). Null if <2 posts. */
export function cadenceDays(posts: Post[]): number | null {
  const times = posts
    .map((p) => new Date(p.timestamp).getTime())
    .filter((t) => !Number.isNaN(t))
    .sort((a, b) => a - b);
  if (times.length < 2) return null;
  const spanDays = (times[times.length - 1]! - times[0]!) / 86_400_000;
  return +(spanDays / (times.length - 1)).toFixed(1);
}
