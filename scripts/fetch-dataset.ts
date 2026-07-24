/**
 * Re-fetch utility — rebuild `dashboard/data.json` from an EXISTING Apify
 * dataset instead of running a fresh (paid) scrape.
 *
 * Usage:
 *   npm run fetch -- <datasetId>
 *
 * Handy for re-materializing data from a run you already paid for, or for
 * regenerating the file after a change to the normalizer.
 */

import { config } from './config.js';
import { fetchDatasetItems } from './services/apify.js';
import { groupIntoDataset } from './services/build-dataset.js';
import { writeDataset } from './services/output.js';

async function main(): Promise<void> {
  const datasetId = process.argv[2];
  if (!datasetId) {
    console.error('❌ Missing dataset id.\n   Usage: npm run fetch -- <datasetId>');
    process.exit(1);
  }

  console.log(`📥 Re-fetching Apify dataset ${datasetId}…`);
  const raw = await fetchDatasetItems(datasetId);
  console.log(`   ↳ ${raw.length} raw items`);

  const dataset = groupIntoDataset(raw, config.igUsername, config.competitors);
  const path = await writeDataset(dataset);

  const total =
    dataset.me.scrapedPosts +
    dataset.competitors.reduce((sum, c) => sum + c.scrapedPosts, 0);

  console.log(`   @${dataset.me.username}: ${dataset.me.scrapedPosts} posts`);
  for (const c of dataset.competitors) {
    console.log(`   @${c.username}: ${c.scrapedPosts} posts`);
  }
  console.log(`\n✅ Done. ${total} posts written to ${path}`);
}

main().catch((err) => {
  console.error('\n❌ Fetch failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
