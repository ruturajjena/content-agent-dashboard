/**
 * Scheduler — runs the daily pipeline on a cron schedule (local dev).
 *
 * Keeps a long-running process alive and fires `automate` at the configured
 * time. For an always-on machine, prefer system cron/launchd (see README);
 * for the cloud, prefer the GitHub Actions workflow.
 *
 * Usage:
 *   npm run schedule                    start the daily scheduler
 *   npm run schedule -- --now           run the job once now, then exit (test)
 *   npm run schedule -- --now --skip-scrape   test without an Apify run
 */

import cron from 'node-cron';
import { config } from './config.js';
import { runScrape, runReport, logDataset } from './services/pipeline.js';
import { readDataset } from './services/output.js';

/** One pipeline execution (scrape unless skipped, then report). */
async function runJob(skipScrape: boolean): Promise<void> {
  console.log(`\n▶️  Job start @ ${new Date().toISOString()}`);
  const dataset = skipScrape ? await readDataset() : await runScrape();
  if (!skipScrape) logDataset(dataset);
  await runReport(dataset);
  console.log('✅ Job done.');
}

async function main(): Promise<void> {
  const runNow = process.argv.includes('--now');
  const skipScrape = process.argv.includes('--skip-scrape');

  if (runNow) {
    await runJob(skipScrape);
    return; // one-shot test mode
  }

  if (!cron.validate(config.reportCron)) {
    console.error(`❌ Invalid REPORT_CRON: "${config.reportCron}"`);
    process.exit(1);
  }

  cron.schedule(config.reportCron, () => {
    runJob(skipScrape).catch((err) =>
      console.error('❌ Scheduled job failed:', err instanceof Error ? err.message : err),
    );
  });

  console.log(`🕒 Scheduler running. Cron: "${config.reportCron}" (local time).`);
  console.log('   Leave this process running. Ctrl+C to stop.');
}

main().catch((err) => {
  console.error('\n❌ Scheduler failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
