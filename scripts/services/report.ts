/**
 * Report builder — condenses the dataset into a daily Telegram digest.
 *
 * This is a lightweight, backend-local summary (a subset of the dashboard's
 * analytics) so the scripts stay decoupled from the React app. It mirrors what
 * the five agents surface: performance, best time, and next ideas.
 */

import type { Dataset, Post } from '../types.js';

const engagement = (p: Post): number => p.likes + p.comments;
const mean = (xs: number[]): number =>
  xs.length ? Math.round(xs.reduce((s, v) => s + v, 0) / xs.length) : 0;

/** Escape the few characters Telegram's HTML parse mode cares about. */
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** First non-empty caption line, trimmed. */
function hook(p: Post): string {
  const line = p.caption.split('\n').map((l) => l.trim()).find(Boolean) ?? '(no caption)';
  return line.length > 80 ? `${line.slice(0, 77)}…` : line;
}

/** Best weekday by average engagement (name only). */
function bestDay(posts: Post[]): string | null {
  const buckets = new Map<number, number[]>();
  for (const p of posts) {
    const d = new Date(p.timestamp);
    if (Number.isNaN(d.getTime())) continue;
    const k = d.getDay();
    (buckets.get(k) ?? buckets.set(k, []).get(k)!).push(engagement(p));
  }
  let best: { day: number; avg: number } | null = null;
  for (const [day, es] of buckets) {
    const avg = mean(es);
    if (!best || avg > best.avg) best = { day, avg };
  }
  return best ? (DAYS[best.day] ?? null) : null;
}

/** Hashtags competitors use (≥2×) that I don't. */
function hashtagGaps(mine: Post[], theirs: Post[], n = 5): string[] {
  const used = new Set(mine.flatMap((p) => p.hashtags.map((h) => h.toLowerCase())));
  const counts = new Map<string, number>();
  for (const p of theirs) {
    for (const h of p.hashtags) {
      const tag = h.toLowerCase();
      if (!used.has(tag)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([tag]) => tag);
}

const fmt = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;

/** Build the HTML digest string sent to Telegram. */
export function buildDailyReport(dataset: Dataset): string {
  const mine = dataset.me.posts;
  const theirs = dataset.competitors.flatMap((c) => c.posts);

  const myAvg = mean(mine.map(engagement));
  const nicheAvg = mean(theirs.map(engagement));
  const rel = nicheAvg ? (myAvg / nicheAvg).toFixed(2) : '—';

  const myTop = [...mine].sort((a, b) => engagement(b) - engagement(a))[0];
  const nicheTop = [...theirs].sort((a, b) => engagement(b) - engagement(a)).slice(0, 3);
  const gaps = hashtagGaps(mine, theirs);
  const day = bestDay(mine);

  const date = new Date(dataset.generatedAt).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const lines: string[] = [];
  lines.push(`<b>📊 Content Agent — Daily Report</b>`);
  lines.push(`<i>${esc(date)} · @${esc(dataset.me.username)}</i>`);
  lines.push('');
  lines.push(`<b>Your performance</b>`);
  lines.push(`• Avg engagement: <b>${fmt(myAvg)}</b> / post`);
  lines.push(`• Niche average: ${fmt(nicheAvg)} (you're at <b>${rel}×</b>)`);
  if (day) lines.push(`• Best day to post: <b>${day}</b>`);
  if (myTop) lines.push(`• Your top post: “${esc(hook(myTop))}” (${fmt(engagement(myTop))})`);
  lines.push('');
  lines.push(`<b>🔥 Winning in your niche</b>`);
  for (const p of nicheTop) {
    lines.push(`• @${esc(p.ownerUsername)}: “${esc(hook(p))}” (${fmt(engagement(p))})`);
  }
  lines.push('');
  lines.push(`<b>💡 Today's moves</b>`);
  if (nicheTop[0]) lines.push(`• Recreate: “${esc(hook(nicheTop[0]))}”`);
  if (gaps.length) lines.push(`• Try hashtags: ${gaps.map((g) => `#${esc(g)}`).join(' ')}`);
  lines.push(`• Post a reel${day ? ` on ${day}` : ''} with a comment-CTA hook.`);

  return lines.join('\n');
}
