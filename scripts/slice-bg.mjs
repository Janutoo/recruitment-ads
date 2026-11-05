// Builds the three production backgrounds from the provided images.
// Top: cut from bg-big.jpg.
// Sides: bg-big.jpg above the seam line (continuous with the top banner) fading into
// the pre-cut bg.jpg below it (correct product size, matches layout.png).
// Offsets assume the parts sit 4 CSS px apart: 320 + 4 + 1032 + 4 + 320 = 1680 = bg-big width / 2.
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const dir = 'variant-b-fireplace/assets';
const quality = Number(process.argv[2] ?? 75);
const jpeg = { quality, mozjpeg: true };

// Fade zone in asset px: starts under the logo (ends y 381), ends above the right part's leaf (starts y 470).
const FADE_START = 385;
const FADE_END = 480;
const WIDTH = 640;
const HEIGHT = 1950;

function fadeMask() {
  const mask = Buffer.alloc(WIDTH * HEIGHT);
  for (let y = 0; y < HEIGHT; y++) {
    const t = Math.min(1, Math.max(0, (y - FADE_START) / (FADE_END - FADE_START)));
    const alpha = Math.round(255 * (1 - t * t * (3 - 2 * t)));
    mask.fill(alpha, y * WIDTH, (y + 1) * WIDTH);
  }
  return mask;
}

async function buildSide(name, left) {
  const continuous = await sharp(`${dir}/bg-big.jpg`)
    .extract({ left, top: 0, width: WIDTH, height: HEIGHT })
    .joinChannel(fadeMask(), { raw: { width: WIDTH, height: HEIGHT, channels: 1 } })
    .png()
    .toBuffer();

  return sharp(`${dir}/${name}/bg.jpg`)
    .composite([{ input: continuous }])
    .jpeg(jpeg)
    .toFile(`${dir}/slices/${name}.jpg`);
}

await mkdir(`${dir}/slices`, { recursive: true });

const results = {
  left: await buildSide('left', 0),
  top: await sharp(`${dir}/bg-big.jpg`)
    .extract({ left: 648, top: 0, width: 2064, height: 500 })
    .jpeg(jpeg)
    .toFile(`${dir}/slices/top.jpg`),
  right: await buildSide('right', 2720),
};

for (const [name, { size }] of Object.entries(results)) {
  console.log(`${name}.jpg q${quality}: ${size} B`);
}
