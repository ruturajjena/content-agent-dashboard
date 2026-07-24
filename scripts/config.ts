/**
 * Loads and validates environment configuration.
 *
 * Using Zod means a missing or malformed secret fails immediately with a clear
 * message, instead of surfacing as a confusing error deep inside an API call.
 */

import 'dotenv/config';
import { z } from 'zod';

/** Turn "a,b, c" into ["a", "b", "c"], dropping blanks. */
const csv = (value: string): string[] =>
  value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const EnvSchema = z.object({
  APIFY_TOKEN: z.string().min(1, 'APIFY_TOKEN is missing. Add it to .env.'),
  IG_USERNAME: z.string().min(1, 'IG_USERNAME is missing. Add it to .env.'),
  IG_COMPETITORS: z
    .string()
    .min(1, 'IG_COMPETITORS is missing. Add it to .env.')
    .transform(csv),
  IG_POSTS_LIMIT: z.coerce.number().int().positive().default(30),
  // Telegram is optional — only the report/telegram scripts need it.
  TELEGRAM_BOT_TOKEN: z.string().optional().default(''),
  TELEGRAM_CHAT_ID: z.string().optional().default(''),
  // Cron schedule for `npm run schedule` (default: 09:00 daily).
  REPORT_CRON: z.string().optional().default('0 9 * * *'),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  console.error(`\n❌ Invalid environment configuration:\n${issues}\n`);
  process.exit(1);
}

export const config = {
  apifyToken: parsed.data.APIFY_TOKEN,
  igUsername: parsed.data.IG_USERNAME,
  competitors: parsed.data.IG_COMPETITORS,
  postsLimit: parsed.data.IG_POSTS_LIMIT,
  telegramBotToken: parsed.data.TELEGRAM_BOT_TOKEN,
  telegramChatId: parsed.data.TELEGRAM_CHAT_ID,
  reportCron: parsed.data.REPORT_CRON,
} as const;
