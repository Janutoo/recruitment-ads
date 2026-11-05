import { FIELD_TOP, GESTURE, GUT_WIDTH, GUT_X, OBSTACLES, PLAYER, STAGE_HEIGHT, STAGE_WIDTH } from './level.js';

const NAVY = '#0b1e49'; // bg.jpg
const OUTSIDE_COLOUR = '#05080f'; // Beyond the ad, on screens much wider than a phone.
const FOLD_COLOUR = '#d89c95'; // Bottom row of border.png.
const LOGO_BAR_HEIGHT = 58;
const ASSET_SCALE = 2; // Assets are 2x, so more canvas pixels per stage px add no detail.
const MAX_SIDE_EXTENSION = 24; // Stage px. Covers phones with toolbars, and keeps look-ahead equal.

// The stage keeps its proportions. Free space is filled by extending the surroundings.
export function fitStage(viewportWidth, viewportHeight) {
  const scale = Math.min(viewportWidth / STAGE_WIDTH, viewportHeight / STAGE_HEIGHT);
  return {
    scale,
    offsetX: (viewportWidth - STAGE_WIDTH * scale) / 2,
    offsetY: (viewportHeight - STAGE_HEIGHT * scale) / 2,
  };
}

function maskToCanvas(mask, colour) {
  const canvas = document.createElement('canvas');
  canvas.width = mask.width;
  canvas.height = mask.height;
  const ctx = canvas.getContext('2d');
  const pixels = ctx.createImageData(mask.width, mask.height);
  for (let i = 0; i < mask.data.length; i++) {
    if (!mask.data[i]) continue;
    pixels.data.set(colour, i * 4);
  }
  ctx.putImageData(pixels, 0, 0);
  return canvas;
}

export class Renderer {
  constructor(canvas, images, masks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.images = images;
    this.masks = masks;
    this.debugLayers = null;
  }

  resize(viewportWidth, viewportHeight) {
    const { scale, offsetX, offsetY } = fitStage(viewportWidth, viewportHeight);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, ASSET_SCALE / scale);
    this.canvas.width = Math.round(viewportWidth * pixelRatio);
    this.canvas.height = Math.round(viewportHeight * pixelRatio);
    this.canvas.style.width = `${viewportWidth}px`;
    this.canvas.style.height = `${viewportHeight}px`;

    this.transform = [scale * pixelRatio, 0, 0, scale * pixelRatio, offsetX * pixelRatio, offsetY * pixelRatio];
    // Area of the ad in stage coordinates.
    const sideExtension = Math.min(offsetX / scale, MAX_SIDE_EXTENSION);
    this.view = {
      left: -sideExtension,
      right: STAGE_WIDTH + sideExtension,
      top: -offsetY / scale,
      bottom: STAGE_HEIGHT + offsetY / scale,
    };
    this.ctx.imageSmoothingQuality = 'high';
  }

  draw(game) {
    const { ctx, images, view } = this;
    const width = view.right - view.left;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = OUTSIDE_COLOUR;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.setTransform(...this.transform);
    ctx.save();
    ctx.beginPath();
    ctx.rect(view.left, view.top, width, view.bottom - view.top);
    ctx.clip();

    ctx.fillStyle = NAVY;
    ctx.fillRect(view.left, view.top, width, view.bottom - view.top);
    ctx.drawImage(images.bg, 0, 0, STAGE_WIDTH, STAGE_HEIGHT);

    ctx.save();
    ctx.beginPath();
    ctx.rect(view.left, FIELD_TOP, width, STAGE_HEIGHT - FIELD_TOP);
    ctx.clip();
    this.drawExtended(images.bg_texture, 0, STAGE_WIDTH);
    this.drawExtended(images.gameplay, GUT_X - game.scroll, GUT_WIDTH);
    for (const o of OBSTACLES) {
      const x = o.x - game.scroll;
      if (x + o.width > view.left && x < view.right) ctx.drawImage(images[o.file], x, o.y, o.width, o.height);
    }
    ctx.restore();

    // Starts under the fold's last row, so a fractional scale leaves no line between them.
    ctx.fillStyle = FOLD_COLOUR;
    ctx.fillRect(view.left, STAGE_HEIGHT - 1, width, view.bottom - STAGE_HEIGHT + 1);
    this.drawExtended(images.border, 0, STAGE_WIDTH);

    ctx.fillStyle = '#fff';
    ctx.fillRect(view.left, view.top, width, LOGO_BAR_HEIGHT - view.top);
    ctx.drawImage(images.logo, 0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    ctx.drawImage(images.tut, 0, 0, STAGE_WIDTH, STAGE_HEIGHT);

    if (game.state === 'ready') ctx.drawImage(images.gesture, GESTURE.x, GESTURE.y, GESTURE.width, GESTURE.height);
    ctx.drawImage(images.player, PLAYER.x, game.y, PLAYER.width, PLAYER.height);
    ctx.restore();
  }

  // A mirrored copy continues the image past an end that is inside the ad, without a jump.
  // It overlaps the original by 1 px, so a fractional scale leaves no line at the join.
  drawExtended(image, x, width) {
    const { ctx, view } = this;
    const mirrorLines = [];
    if (x > view.left) mirrorLines.push(x + 1);
    if (x + width < view.right) mirrorLines.push(x + width - 1);
    for (const line of mirrorLines) {
      ctx.save();
      ctx.translate(line * 2, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(image, x, 0, width, STAGE_HEIGHT);
      ctx.restore();
    }
    ctx.drawImage(image, x, 0, width, STAGE_HEIGHT);
  }

  // Temporary until the endcards exist.
  drawEndLabel(state) {
    const { ctx } = this;
    ctx.setTransform(...this.transform);
    ctx.fillStyle = 'rgba(11, 30, 73, 0.75)';
    ctx.fillRect(40, 300, 280, 70);
    ctx.fillStyle = '#fff';
    ctx.font = '700 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state === 'won' ? 'WON: tap to restart' : 'FAILED: tap to restart', 180, 342);
    ctx.textAlign = 'start';
  }

  // Shows the real collision data, at the rounded positions the game tests.
  drawDebug(game, fps) {
    const { ctx, masks } = this;
    this.debugLayers ??= {
      player: maskToCanvas(masks.player, [0, 255, 0, 170]),
      border: maskToCanvas(masks.border, [255, 255, 0, 90]),
      obstacles: Object.fromEntries(
        Object.entries(masks.obstacles).map(([file, mask]) => [file, maskToCanvas(mask, [255, 0, 0, 170])]),
      ),
    };
    const layers = this.debugLayers;
    ctx.setTransform(...this.transform);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(layers.border, 0, 0);
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = '#fff';
    for (const o of OBSTACLES) {
      const x = Math.round(o.x - game.scroll);
      ctx.drawImage(layers.obstacles[o.file], x, Math.round(o.y));
      ctx.strokeRect(x, Math.round(o.y), o.width, o.height);
    }
    ctx.drawImage(layers.player, Math.round(PLAYER.x), Math.round(game.y));
    ctx.strokeRect(Math.round(PLAYER.x), Math.round(game.y), PLAYER.width, PLAYER.height);
    ctx.imageSmoothingEnabled = true;

    const lines = [
      `${game.state} ${fps} fps`,
      `scroll ${Math.round(game.scroll)} y ${Math.round(game.y)}`,
      `passed ${game.passed}/${OBSTACLES.length} hit ${game.hit ?? '-'}`,
    ];
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(4, 62, 190, 46);
    ctx.fillStyle = '#0f0';
    ctx.font = '12px monospace';
    lines.forEach((line, i) => ctx.fillText(line, 8, 76 + i * 14));
  }
}
