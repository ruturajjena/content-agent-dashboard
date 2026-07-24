/**
 * Data contract for the dashboard.
 *
 * This MIRRORS `scripts/types.ts` (the scraper's output). The two apps are
 * intentionally decoupled, so the shape is duplicated here on purpose — keep
 * them in sync when the scraper's output changes.
 */

export interface Post {
  id: string;
  shortCode: string;
  url: string;
  type: 'image' | 'video' | 'sidecar' | 'unknown';
  isReel: boolean;
  caption: string;
  hashtags: string[];
  mentions: string[];
  likes: number;
  comments: number;
  videoViews: number | null;
  timestamp: string;
  ownerUsername: string;
}

export interface AccountData {
  username: string;
  isSelf: boolean;
  scrapedPosts: number;
  posts: Post[];
}

export interface Dataset {
  generatedAt: string;
  me: AccountData;
  competitors: AccountData[];
}
