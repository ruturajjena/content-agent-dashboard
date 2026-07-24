/**
 * Report entry — build the daily digest and deliver it to Telegram.
 *
 * Usage:
 *   npm run report          send the daily digest from dashboard/data.json
 *   npm run report -- --test  send a short "it works" message only
 */

import { config } from './config.js';
import { readDataset } from './services/output.js';
import { buildDailyReport } from './services/report.js';
import { sendMessage } from './services/telegram.js';

function assertTelegramConfigured(): void {
  const missing: string[] = [];
  if (!config.telegramBotToken) missing.push('TELEGRAM_BOT_TOKEN');
  if (!config.telegramChatId) missing.push('TELEGRAM_CHAT_ID');
  if (missing.length) {
    console.error(`❌ Missing in .env: ${missing.join(', ')}`);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const isDry = process.argv.includes('--dry');
  const isTest = process.argv.includes('--test');

  // Dry run: build and print the report locally, no Telegram needed.
  if (isDry) {
    console.log(buildDailyReport(await readDataset()));
    return;
  }

  assertTelegramConfigured();
  const text = isTest
    ? '✅ <b>Content Agent</b> is connected to Telegram.'
    : buildDailyReport(await readDataset());

  await sendMessage(config.telegramBotToken, config.telegramChatId, text);
  console.log(`✅ ${isTest ? 'Test message' : 'Daily report'} sent to Telegram.`);
}

main().catch((err) => {
  console.error('\n❌ Send failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
