/**
 * Scrape orchestrator — the entry point for `npm run scrape`.
 *
 * One actor run over my account + every competitor → group + normalize →
 * write a single `dashboard/data.json` snapshot.
 */

import { config } from './config.js';
import { runScrape, logDataset } from './services/pipeline.js';
import { OUTPUT_PATH } from './services/output.js';

async function main(): Promise<void> {
  const accounts = [config.igUsername, ...config.competitors];
  console.log('📸 Instagram intelligence scrape starting…');
  console.log(`   accounts: ${accounts.map((a) => `@${a}`).join(', ')}`);
  console.log(`   posts per account: ${config.postsLimit}\n`);

  const dataset = await runScrape();
  logDataset(dataset);
  console.log(`\n✅ Done. Written to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('\n❌ Scrape failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
