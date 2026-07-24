/**
 * Telegram service — the only file that talks to the Telegram Bot API.
 *
 * Uses the built-in global `fetch` (Node 20+), so no bot library dependency.
 * Docs: https://core.telegram.org/bots/api
 */

const API_BASE = 'https://api.telegram.org';

interface TelegramResponse<T> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
}

/** Low-level call to a Bot API method. Throws on API-level failure. */
async function callApi<T>(
  token: string,
  method: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${API_BASE}/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json()) as TelegramResponse<T>;
  if (!data.ok) {
    throw new Error(
      `Telegram ${method} failed: ${data.error_code ?? '?'} ${data.description ?? 'unknown error'}`,
    );
  }
  return data.result as T;
}

/** Send an HTML-formatted message to a chat. */
export async function sendMessage(
  token: string,
  chatId: string,
  text: string,
): Promise<void> {
  await callApi(token, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });
}

/** A minimal view of an incoming update, enough to discover a chat id. */
export interface ChatRef {
  id: number;
  name: string;
}

/**
 * Fetch recent updates and extract the chats that have messaged the bot.
 * Used once, to auto-discover the user's chat id.
 */
export async function discoverChats(token: string): Promise<ChatRef[]> {
  const updates = await callApi<
    Array<{ message?: { chat?: { id: number; first_name?: string; username?: string } } }>
  >(token, 'getUpdates', {});

  const seen = new Map<number, ChatRef>();
  for (const u of updates) {
    const chat = u.message?.chat;
    if (chat) {
      seen.set(chat.id, {
        id: chat.id,
        name: chat.username ?? chat.first_name ?? String(chat.id),
      });
    }
  }
  return Array.from(seen.values());
}
