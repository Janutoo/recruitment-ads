import { Game } from './game.js';
import { OBSTACLES, PLAYER, STAGE_HEIGHT, STAGE_WIDTH } from './level.js';
import { buildMask } from './masks.js';
import { Renderer } from './render.js';
import { fx, hideEndcards, later, playCrash, playIntro, playRestart, showEndcard, stopAnimations } from './screens.js';
import { Sound } from './sound.js';

const clickTag = window.clickTag || 'https://example.com/landing';

const CRASH_TO_ENDCARD = 0.75; // Seconds to see what happened before the endcard covers it.
const WIN_TO_ENDCARD = 0.2;

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

const sound = new Sound();
const images = await loadImages();
const masks = buildMasks(images);
const game = new Game(masks);
const canvas = document.querySelector('canvas');
const stage = document.querySelector('.stage');
const renderer = new Renderer(canvas, images, masks);
const debug = new URLSearchParams(location.search).get('debug') === '1';

let pausedByVisibility = false;
let endcardOpen = false;

function fitToViewport() {
  const viewport = window.visualViewport;
  // width x scale cancels zoom, so pinch zoom or a zoomed preview does not change the layout.
  const width = viewport ? viewport.width * viewport.scale : innerWidth;
  const height = viewport ? viewport.height * viewport.scale : innerHeight;
  const { scale, offsetX, offsetY, view } = renderer.resize(Math.round(width), Math.round(height));
  stage.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
  stage.style.setProperty('--side', `${-view.left}px`);
  stage.style.setProperty('--below', `${view.bottom - STAGE_HEIGHT}px`);
}
fitToViewport();
window.addEventListener('resize', fitToViewport);
window.visualViewport?.addEventListener('resize', fitToViewport);

// Audio may only start from an interaction, and on touch that means the end of the tap.
for (const type of ['pointerdown', 'pointerup', 'touchend', 'keydown']) {
  window.addEventListener(type, () => sound.unlock(), { passive: true });
}

function onTap() {
  if (endcardOpen) return;
  if (pausedByVisibility) {
    pausedByVisibility = false;
    sound.setHeld(false);
    return;
  }
  if (game.state === 'ready') {
    stopAnimations();
    sound.unlock();
    sound.startMusic();
  }
  game.tap();
}

canvas.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  onTap();
});
window.addEventListener('keydown', (event) => {
  if (endcardOpen || event.repeat) return;
  if (event.code === 'Space' || event.code === 'ArrowUp') {
    event.preventDefault();
    onTap();
  }
});

// A running game waits for a tap after the tab returns, so nobody crashes before looking.
document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.state === 'playing') {
    pausedByVisibility = true;
    sound.setHeld(true);
  }
  sound.setHidden(document.hidden);
});

function onRunEnded() {
  sound.stopAll();
  if (game.state === 'failed') {
    sound.play('crash');
    playCrash();
    later(CRASH_TO_ENDCARD, () => openEndcard('fail'));
  } else {
    later(WIN_TO_ENDCARD, () => openEndcard('win'));
  }
}

function openEndcard(kind) {
  endcardOpen = true;
  showEndcard(kind);
  if (kind === 'fail') {
    sound.play('fail');
  } else {
    sound.play('cheer');
    sound.play('applause');
  }
}

function restart() {
  stopAnimations();
  sound.stopAll();
  hideEndcards();
  endcardOpen = false;
  pausedByVisibility = false;
  sound.setHeld(false);
  game.reset();
  playRestart();
}

for (const button of document.querySelectorAll('.cta')) {
  button.addEventListener('click', () => window.open(clickTag, '_blank'));
}
document.querySelector('.replay').addEventListener('click', restart);

const muteButton = document.querySelector('.mute');
muteButton.addEventListener('click', () => {
  const muted = muteButton.getAttribute('aria-pressed') !== 'true';
  muteButton.setAttribute('aria-pressed', String(muted));
  sound.setMuted(muted);
  muteButton.blur(); // Space must keep jumping, not toggle the sound again.
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
    if (wasPlaying && game.state !== 'playing') onRunEnded();
  }

  renderer.draw(game, fx, pausedByVisibility);
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

hideEndcards();
playIntro();
stage.classList.add('is-ready');
requestAnimationFrame(frame);

if (debug) {
  window.__gutRun = {
    game,
    sound,
    fx,
    isPaused: () => pausedByVisibility,
    isEndcardOpen: () => endcardOpen,
  };
}
