// Measures what each ad really loads from dist. Run `npm run build` first.
// The 3 MB limit applies per complete ad. The fireplace is one ad delivered as three
// packages, so files they share count once per package.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';

const LIMIT = 3_000_000;
const ADS = {
  'variant-a-game/dist': ['index.html'],
  'variant-b-fireplace/dist': ['top.html', 'left.html', 'right.html'],
};

// Follows relative src/href in HTML, url() in CSS and bundled file names in JS.
function filesOf(root, entry, seen = new Set()) {
  if (seen.has(entry)) return seen;
  seen.add(entry);
  if (!/\.(html|css|js)$/.test(entry)) return seen;
  const source = readFileSync(join(root, entry), 'utf8');
  if (entry.endsWith('.js')) {
    // Quoted, because bundled names can contain spaces (audio files do).
    for (const [, name] of source.matchAll(/["'`]([^"'`]+\.(?:png|jpe?g|mp3|js|css))["'`]/g)) {
      const path = join(dirname(entry), name.replace(/^\.\//, ''));
      if (existsSync(join(root, path))) filesOf(root, path, seen);
    }
    return seen;
  }
  const refs = source.matchAll(/(?:src|href)="([^"]+)"|url\(["']?([^"')]+)["']?\)/g);
  for (const [, html, css] of refs) {
    const ref = html ?? css;
    if (/^(https?:|data:|#)/.test(ref)) continue;
    const path = join(dirname(entry), ref);
    if (!existsSync(join(root, path))) throw new Error(`${entry}: missing ${ref}`);
    filesOf(root, path, seen);
  }
  return seen;
}

const size = (root, files) => [...files].reduce((sum, file) => sum + statSync(join(root, file)).size, 0);
const mb = (bytes) => `${(bytes / 1_000_000).toFixed(3)} MB`;

let failed = false;
for (const [root, entries] of Object.entries(ADS)) {
  let total = 0;
  for (const entry of entries) {
    const files = filesOf(root, entry);
    const bytes = size(root, files);
    total += bytes;
    console.log(`${root}/${entry}: ${mb(bytes)} (${files.size} files)`);
  }
  const over = total > LIMIT;
  failed ||= over;
  console.log(`${root} whole ad: ${mb(total)} ${over ? 'OVER' : 'ok'} (limit ${mb(LIMIT)})`);
}
process.exit(failed ? 1 : 0);
