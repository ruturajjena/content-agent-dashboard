/**
 * Apify service — the only file that talks to the Apify API.
 *
 * Keeping the SDK isolated here means the rest of the app depends on our own
 * types, not on Apify's client shape, and the actor can be swapped in one place.
 */

import { ApifyClient } from 'apify-client';
import { config } from '../config.js';

/** Official Instagram Scraper actor. */
const INSTAGRAM_SCRAPER_ACTOR = 'apify/instagram-scraper';

const client = new ApifyClient({ token: config.apifyToken });

/** Raw item shape as returned by apify/instagram-scraper (partial). */
export interface RawInstagramPost {
  id?: string;
  shortCode?: string;
  url?: string;
  type?: string;
  productType?: string;
  caption?: string;
  hashtags?: string[];
  mentions?: string[];
  likesCount?: number;
  commentsCount?: number;
  videoViewCount?: number;
  videoUrl?: string;
  timestamp?: string;
  ownerUsername?: string;
  [key: string]: unknown;
}

/**
 * Scrape the most recent posts for several Instagram profiles in one run.
 *
 * A single actor run with multiple `directUrls` is cheaper and simpler than one
 * run per account. `resultsLimit` applies per URL.
 *
 * @param usernames  Instagram handles (without @).
 * @param limit      Max posts to retrieve per profile.
 * @returns          Raw dataset items for all profiles, mixed together.
 */
export async function scrapeProfiles(
  usernames: string[],
  limit: number,
): Promise<RawInstagramPost[]> {
  const input = {
    directUrls: usernames.map((u) => `https://www.instagram.com/${u}/`),
    resultsType: 'posts',
    resultsLimit: limit,
    addParentData: false,
  };

  // Blocks until the run finishes (or fails).
  const run = await client.actor(INSTAGRAM_SCRAPER_ACTOR).call(input);

  return fetchDatasetItems(run.defaultDatasetId);
}

/**
 * Fetch all items from an existing Apify dataset by id.
 *
 * Lets us re-materialize `data.json` from a run we already paid for, without
 * triggering (and being charged for) a fresh scrape.
 */
export async function fetchDatasetItems(
  datasetId: string,
): Promise<RawInstagramPost[]> {
  const { items } = await client.dataset(datasetId).listItems();
  return items as RawInstagramPost[];
}
