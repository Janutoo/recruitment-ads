// Collision masks: 1 cell = 1 stage px. Built from alpha, so hitboxes follow what is drawn.
const ALPHA_THRESHOLD = 128;

// Erosion makes hitboxes slightly smaller than the image, so near misses never count as hits.
export function buildMask(rgba, width, height, erode) {
  let data = new Uint8Array(width * height);
  for (let i = 0; i < data.length; i++) {
    data[i] = rgba[i * 4 + 3] >= ALPHA_THRESHOLD ? 1 : 0;
  }
  for (let pass = 0; pass < erode; pass++) {
    const next = new Uint8Array(data.length);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = y * width + x;
        next[i] = data[i] & data[i - 1] & data[i + 1] & data[i - width] & data[i + width];
      }
    }
    data = next;
  }
  return { width, height, data };
}

export function masksOverlap(a, ax, ay, b, bx, by) {
  const left = Math.max(ax, bx);
  const top = Math.max(ay, by);
  const right = Math.min(ax + a.width, bx + b.width);
  const bottom = Math.min(ay + a.height, by + b.height);
  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      if (a.data[(y - ay) * a.width + x - ax] && b.data[(y - by) * b.width + x - bx]) return true;
    }
  }
  return false;
}
