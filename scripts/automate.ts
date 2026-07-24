/**
 * Automate — the full daily pipeline in one command.
 *
 * Flow: scrape fresh Instagram data → refresh dashboard/data.json (which the
 * dashboard + all five agents read) → build & deliver the Telegram report.
 *
 * Usage:
 *   npm run automate                 scrape + report (costs an Apify run)
 *   npm run automate -- --skip-scrape  report from existing data ($0)
 */

import { runScrape, runReport, logDataset } from './services/pipeline.js';
import { readDataset } from './services/output.js';
import type { Dataset } from './types.js';

async function main(): Promise<void> {
  const skipScrape = process.argv.includes('--skip-scrape');
  const startedAt = new Date().toISOString();
  console.log(`🤖 Automation run @ ${startedAt}`);

  let dataset: Dataset;
  if (skipScrape) {
    console.log('   ↳ --skip-scrape: reusing existing dashboard/data.json');
    dataset = await readDataset();
  } else {
    console.log('   ↳ scraping fresh Instagram data…');
    dataset = await runScrape();
    logDataset(dataset);
  }

  console.log('   ↳ sending Telegram report…');
  await runReport(dataset);

  console.log('✅ Automation run complete.');
}

main().catch((err) => {
  console.error('\n❌ Automation failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
