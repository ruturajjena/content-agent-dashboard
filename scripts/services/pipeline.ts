/**
 * Pipeline — the reusable building blocks of the daily workflow.
 *
 * Shared by `scrape.ts`, `automate.ts`, and `schedule.ts` so the scrape/report
 * logic lives in exactly one place.
 */

import { config } from '../config.js';
import { scrapeProfiles } from './apify.js';
import { groupIntoDataset } from './build-dataset.js';
import { writeDataset, readDataset } from './output.js';
import { buildDailyReport } from './report.js';
import { sendMessage } from './telegram.js';
import type { Dataset } from '../types.js';

/** Scrape all accounts and persist a fresh dashboard/data.json. */
export async function runScrape(): Promise<Dataset> {
  const accounts = [config.igUsername, ...config.competitors];
  const raw = await scrapeProfiles(accounts, config.postsLimit);
  const dataset = groupIntoDataset(raw, config.igUsername, config.competitors);
  await writeDataset(dataset);
  return dataset;
}

/** Build the digest and deliver it to Telegram. */
export async function runReport(dataset?: Dataset): Promise<void> {
  if (!config.telegramBotToken || !config.telegramChatId) {
    throw new Error('Telegram not configured — set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env.');
  }
  const ds = dataset ?? (await readDataset());
  await sendMessage(config.telegramBotToken, config.telegramChatId, buildDailyReport(ds));
}

/** Small helper for consistent per-account logging. */
export function logDataset(dataset: Dataset): void {
  const total =
    dataset.me.scrapedPosts +
    dataset.competitors.reduce((s, c) => s + c.scrapedPosts, 0);
  console.log(`   @${dataset.me.username}: ${dataset.me.scrapedPosts} posts`);
  for (const c of dataset.competitors) {
    console.log(`   @${c.username}: ${c.scrapedPosts} posts`);
  }
  console.log(`   total: ${total} posts`);
}
