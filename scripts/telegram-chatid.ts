/**
 * Chat-ID discovery — run once to find your Telegram chat id.
 *
 * Prereq: you've created the bot with @BotFather, put TELEGRAM_BOT_TOKEN in
 * .env, and sent it at least one message.
 *
 * Usage: npm run telegram:chatid
 */

import { config } from './config.js';
import { discoverChats } from './services/telegram.js';

async function main(): Promise<void> {
  if (!config.telegramBotToken) {
    console.error('❌ TELEGRAM_BOT_TOKEN is empty. Add it to .env first.');
    process.exit(1);
  }

  console.log('🔎 Looking for chats that have messaged your bot…');
  const chats = await discoverChats(config.telegramBotToken);

  if (chats.length === 0) {
    console.error(
      '\n❌ No chats found. Open your bot in Telegram and send it any message,\n' +
        '   then run this again.',
    );
    process.exit(1);
  }

  console.log('\n✅ Found:');
  for (const c of chats) {
    console.log(`   ${c.id}  (${c.name})`);
  }
  console.log('\n→ Copy your id into .env as TELEGRAM_CHAT_ID=<id>');
}

main().catch((err) => {
  console.error('\n❌ Failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
