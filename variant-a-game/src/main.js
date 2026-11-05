import { Game } from './game.js';
import { OBSTACLES, PLAYER, STAGE_HEIGHT, STAGE_WIDTH } from './level.js';
import { buildMask } from './masks.js';
import { Renderer } from './render.js';

const RESTART_DELAY = 500; // ms. A panicked tap at the moment of the crash must not restart.

const urls = {
  ...Object.fromEntries(
    Object.entries(import.meta.glob('../assets/01_game/*.png', { eager: true, query: '?url', import: 'default' })).map(
      ([path, url]) => [path.split('/').pop().replace('.png', ''), url],
    ),
  ),
  bg: new URL('../assets/bg.jpg', import.meta.url).href,
  border: new URL('../assets/border.png', import.meta.url).href,
  gesture: new URL('../assets/gesture.png', import.meta.url).href,
  logo: new URL('../assets/logo.png', import.meta.url).href,
};

async function loadImages() {
  const entries = await Promise.all(
    Object.entries(urls).map(async ([name, url]) => {
      const image = new Image();
      image.src = url;
      await image.decode();
      return [name, image];
    }),
  );
  return Object.fromEntries(entries);
}

function maskFromImage(image, width, height, erode) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(width);
  canvas.height = Math.ceil(height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return buildMask(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height, erode);
}

function buildMasks(images) {
  return {
    player: maskFromImage(images.player, PLAYER.width, PLAYER.height, 2),
    border: maskFromImage(images.border, STAGE_WIDTH, STAGE_HEIGHT, 1),
    obstacles: Object.fromEntries(OBSTACLES.map((o) => [o.file, maskFromImage(images[o.file], o.width, o.height, 1)])),
  };
}

const images = await loadImages();
const masks = buildMasks(images);
const game = new Game(masks);
const canvas = document.querySelector('canvas');
const renderer = new Renderer(canvas, images, masks);
const debug = new URLSearchParams(location.search).get('debug') === '1';

function fitToViewport() {
  const viewport = window.visualViewport;
  if (viewport && viewport.scale > 1.01) return; // Pinch zoom is not a layout change.
  renderer.resize(Math.round(viewport?.width ?? innerWidth), Math.round(viewport?.height ?? innerHeight));
}
fitToViewport();
window.addEventListener('resize', fitToViewport);
window.visualViewport?.addEventListener('resize', fitToViewport);

let pausedByVisibility = false;
let endedAt = 0;

function onTap() {
  if (pausedByVisibility) {
    pausedByVisibility = false;
    return;
  }
  if (game.state === 'failed' || game.state === 'won') {
    if (performance.now() - endedAt >= RESTART_DELAY) game.reset();
    return;
  }
  game.tap();
}

canvas.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  onTap();
});
window.addEventListener('keydown', (event) => {
  if ((event.code === 'Space' || event.code === 'ArrowUp') && !event.repeat) {
    event.preventDefault();
    onTap();
  }
});

// A running game waits for a tap after the tab returns, so nobody crashes before looking.
document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.state === 'playing') pausedByVisibility = true;
});

let lastTime = performance.now();
let frames = 0;
let fps = 0;
let fpsTime = lastTime;

function frame(now) {
  const elapsed = (now - lastTime) / 1000;
  lastTime = now;

  if (!pausedByVisibility) {
    const wasPlaying = game.state === 'playing';
    game.advance(elapsed);
    if (wasPlaying && game.state !== 'playing') endedAt = now;
  }

  renderer.draw(game);
  if (game.state === 'failed' || game.state === 'won') renderer.drawEndLabel(game.state);
  if (debug) {
    frames++;
    if (now - fpsTime >= 500) {
      fps = Math.round((frames * 1000) / (now - fpsTime));
      frames = 0;
      fpsTime = now;
    }
    renderer.drawDebug(game, fps);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

if (debug) window.__gutRun = { game, isPaused: () => pausedByVisibility };
