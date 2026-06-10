/**
 * Copies Space Grotesk 700 (woff) into public/fonts for offline 3D typography.
 * Source: @fontsource/space-grotesk (OFL license).
 */
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(
  root,
  'node_modules',
  '@fontsource',
  'space-grotesk',
  'files',
  'space-grotesk-latin-700-normal.woff',
);
const destDir = join(root, 'public', 'fonts');
const dest = join(destDir, 'space-grotesk-latin-700-normal.woff');

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.info('[sync-display-font] copied Space Grotesk 700 → public/fonts/');
