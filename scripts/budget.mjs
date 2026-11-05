// Measures what each creative really loads from dist. Run `npm run build` first.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';

const LIMIT = 3_000_000;
const CREATIVES = {
  'variant-a-game/dist': ['index.html'],
  'variant-b-fireplace/dist': ['top.html', 'left.html', 'right.html'],
};

// Follows relative src/href in HTML and url() in CSS.
function filesOf(root, entry, seen = new Set()) {
  if (seen.has(entry)) return seen;
  seen.add(entry);
  if (!/\.(html|css)$/.test(entry)) return seen;
  const source = readFileSync(join(root, entry), 'utf8');
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

let everything = 0;
let failed = false;
for (const [root, entries] of Object.entries(CREATIVES)) {
  let packages = 0;
  for (const entry of entries) {
    const files = filesOf(root, entry);
    const bytes = size(root, files);
    packages += bytes;
    failed ||= bytes > LIMIT;
    console.log(`${root}/${entry}: ${mb(bytes)} (${files.size} files)`);
  }
  everything += packages;
  failed ||= packages > LIMIT;
  console.log(`${root} delivered as separate packages: ${mb(packages)}`);
}
failed ||= everything > LIMIT;
console.log(`All creatives together: ${mb(everything)}`);
console.log(failed ? `OVER the ${mb(LIMIT)} limit` : `This build is within ${mb(LIMIT)} under every reading of the limit`);
process.exit(failed ? 1 : 0);
