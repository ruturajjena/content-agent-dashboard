/**
 * Output service — writes the final Dataset to `dashboard/data.json`.
 *
 * Path is resolved relative to this file (not the current working directory)
 * so the scripts work no matter where they're launched from.
 */

import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Dataset } from '../types.js';

const HERE = dirname(fileURLToPath(import.meta.url));
/** scripts/services → ../../dashboard/data.json */
export const OUTPUT_PATH = resolve(HERE, '..', '..', 'dashboard', 'data.json');

/** Write the dataset as pretty JSON. Returns the path written. */
export async function writeDataset(dataset: Dataset): Promise<string> {
  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(dataset, null, 2), 'utf8');
  return OUTPUT_PATH;
}

/** Read the saved snapshot back. Throws a friendly error if it's missing. */
export async function readDataset(): Promise<Dataset> {
  try {
    const raw = await readFile(OUTPUT_PATH, 'utf8');
    return JSON.parse(raw) as Dataset;
  } catch {
    throw new Error(
      'No dashboard/data.json found. Run `npm run scrape` (or `npm run fetch`) first.',
    );
  }
}
