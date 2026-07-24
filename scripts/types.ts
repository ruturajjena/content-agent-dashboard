/**
 * Shared data contract for the whole project.
 *
 * The scraper produces this shape and writes it to `dashboard/data.json`.
 * The dashboard (Step 3) and the Telegram reporter (Step 4) both consume it.
 * Keep this file the single source of truth for the data model.
 */

/** A single normalized Instagram post (or reel). */
export interface Post {
  /** Instagram internal id. */
  id: string;
  /** Short code, e.g. the `ABC123` in instagram.com/p/ABC123. */
  shortCode: string;
  /** Canonical permalink. */
  url: string;
  /** Media kind as reported by Instagram. */
  type: 'image' | 'video' | 'sidecar' | 'unknown';
  /** True when the post is a Reel (short-form video). */
  isReel: boolean;
  /** Caption text (may be empty). */
  caption: string;
  /** Hashtags without the leading `#`. */
  hashtags: string[];
  /** @mentioned usernames without the leading `@`. */
  mentions: string[];
  /** Like count (0 when hidden). */
  likes: number;
  /** Comment count. */
  comments: number;
  /** Video view count, or null for images. */
  videoViews: number | null;
  /** ISO 8601 timestamp of when it was posted. */
  timestamp: string;
  /** Account that owns the post. */
  ownerUsername: string;
}

/** All scraped content for one account. */
export interface AccountData {
  username: string;
  /** True for the user's own account, false for competitors. */
  isSelf: boolean;
  /** How many posts we actually retrieved. */
  scrapedPosts: number;
  posts: Post[];
}

/** The full dataset written to disk. */
export interface Dataset {
  /** ISO timestamp of when this snapshot was generated. */
  generatedAt: string;
  /** The user's own account. */
  me: AccountData;
  /** Competitor accounts. */
  competitors: AccountData[];
}
