/**
 * Loads the scraped snapshot.
 *
 * `data.json` lives at the dashboard root and is produced by `npm run scrape`
 * (or `npm run fetch`). Vite inlines it at build time via a JSON import, so the
 * dashboard always reflects the latest snapshot on the last build/dev start.
 */

import type { Dataset, AccountData } from '@/types';
import raw from '../../data.json';

export const dataset = raw as Dataset;

/** Every account (me first, then competitors) as a flat list. */
export const allAccounts: AccountData[] = [dataset.me, ...dataset.competitors];
