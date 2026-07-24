/**
 * Normalization — maps Apify's raw output into our clean `Post` model.
 *
 * All the messy defensiveness about missing/renamed fields lives here so the
 * agents in Step 3 can trust a stable, fully-typed shape.
 */

import type { Post } from '../types.js';
import type { RawInstagramPost } from './apify.js';

/** Map Instagram's media type string to our enum. */
function mapType(raw?: string): Post['type'] {
  switch ((raw ?? '').toLowerCase()) {
    case 'image':
      return 'image';
    case 'video':
      return 'video';
    case 'sidecar':
      return 'sidecar';
    default:
      return 'unknown';
  }
}

/** A Reel is short-form video — Instagram tags these with productType "clips". */
function isReel(raw: RawInstagramPost): boolean {
  const productType = (raw.productType ?? '').toLowerCase();
  if (productType === 'clips') return true;
  // Fallback: a video whose URL is a /reel/ permalink.
  return mapType(raw.type) === 'video' && (raw.url ?? '').includes('/reel/');
}

/** Convert a single raw item into a normalized Post. */
export function normalizePost(raw: RawInstagramPost, fallbackOwner: string): Post {
  const type = mapType(raw.type);
  return {
    id: raw.id ?? raw.shortCode ?? '',
    shortCode: raw.shortCode ?? '',
    url: raw.url ?? '',
    type,
    isReel: isReel(raw),
    caption: raw.caption ?? '',
    hashtags: Array.isArray(raw.hashtags) ? raw.hashtags : [],
    mentions: Array.isArray(raw.mentions) ? raw.mentions : [],
    likes: typeof raw.likesCount === 'number' && raw.likesCount > 0 ? raw.likesCount : 0,
    comments: typeof raw.commentsCount === 'number' ? raw.commentsCount : 0,
    videoViews:
      type === 'video' && typeof raw.videoViewCount === 'number'
        ? raw.videoViewCount
        : null,
    timestamp: raw.timestamp ?? '',
    ownerUsername: raw.ownerUsername ?? fallbackOwner,
  };
}

/** Normalize a full batch of raw items for one account. */
export function normalizePosts(
  rawItems: RawInstagramPost[],
  fallbackOwner: string,
): Post[] {
  return rawItems
    .filter((item) => item && (item.shortCode || item.id))
    .map((item) => normalizePost(item, fallbackOwner));
}
