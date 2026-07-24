/**
 * Dataset builder — groups a flat list of raw Instagram items into our
 * `Dataset` shape (my account vs. competitors).
 *
 * Shared by the live scraper (`scrape.ts`) and the re-fetch utility
 * (`fetch-dataset.ts`) so grouping logic lives in exactly one place.
 */

import type { RawInstagramPost } from './apify.js';
import { normalizePosts } from './normalize.js';
import type { AccountData, Dataset } from '../types.js';

/** Case-insensitive match on the owner username. */
function itemsFor(raw: RawInstagramPost[], username: string): RawInstagramPost[] {
  const target = username.toLowerCase();
  return raw.filter((item) => (item.ownerUsername ?? '').toLowerCase() === target);
}

/** Build one account's normalized data from the flat raw list. */
function accountFrom(
  raw: RawInstagramPost[],
  username: string,
  isSelf: boolean,
): AccountData {
  const posts = normalizePosts(itemsFor(raw, username), username);
  return { username, isSelf, scrapedPosts: posts.length, posts };
}

/**
 * Turn a flat list of raw items (all accounts mixed) into the final Dataset.
 *
 * @param raw          Every raw item from the actor run.
 * @param igUsername   The user's own handle.
 * @param competitors  Competitor handles.
 */
export function groupIntoDataset(
  raw: RawInstagramPost[],
  igUsername: string,
  competitors: string[],
): Dataset {
  return {
    generatedAt: new Date().toISOString(),
    me: accountFrom(raw, igUsername, true),
    competitors: competitors.map((c) => accountFrom(raw, c, false)),
  };
}
