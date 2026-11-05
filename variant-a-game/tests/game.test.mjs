import assert from 'node:assert/strict';
import { test } from 'node:test';
import sharp from 'sharp';
import { Game, HOVER_END_Y, HOVER_SCROLL } from '../src/game.js';
import { END_SCROLL, OBSTACLES, PLAYER } from '../src/level.js';
import { buildMask, masksOverlap } from '../src/masks.js';
import { fitStage } from '../src/render.js';

const ASSETS = new URL('../assets/', import.meta.url).pathname;

async function loadMask(path, width, height, erode) {
  const w = Math.ceil(width);
  const h = Math.ceil(height);
  const data = await sharp(ASSETS + path).ensureAlpha().resize(w, h, { fit: 'fill' }).raw().toBuffer();
  return buildMask(data, w, h, erode);
}

async function loadFullAlpha(path) {
  const { data, info } = await sharp(ASSETS + path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

const masks = {
  player: await loadMask('01_game/player.png', PLAYER.width, PLAYER.height, 2),
  border: await loadMask('border.png', 360, 640, 1),
  obstacles: {},
};
for (const o of OBSTACLES) {
  masks.obstacles[o.file] = await loadMask(`01_game/${o.file}.png`, o.width, o.height, 1);
}

// Plays by steering through the bigger gap next to the upcoming obstacles.
function playWithBot(game, frame = 1 / 60) {
  game.tap();
  for (let t = 0; t < 60 && game.state === 'playing'; t += frame) {
    const next = OBSTACLES.find((o) => o.x + o.width - game.scroll > PLAYER.x - 4);
    let target = 400;
    if (next) {
      // Obstacles right behind the next one must be cleared in the same move.
      const group = OBSTACLES.filter((o) => o.x >= next.x && o.x <= next.x + next.width + 60);
      const top = Math.min(...group.map((o) => o.y));
      const bottom = Math.max(...group.map((o) => o.y + o.height));
      target = top - 240 > 560 - bottom ? (240 + top) / 2 : (bottom + 560) / 2;
    }
    if (game.y + PLAYER.height / 2 > target + 8 && game.velocity > -60) game.tap();
    game.advance(frame);
  }
}

test('the stage fits every target viewport without distortion or cropping', () => {
  for (const [width, height] of [[320, 568], [360, 640], [390, 664], [412, 732], [430, 932]]) {
    const { scale, offsetX, offsetY } = fitStage(width, height);
    assert.ok(offsetX >= 0 && offsetY >= 0, `${width}x${height}`);
    assert.ok(Math.min(offsetX, offsetY) < 1e-9, `${width}x${height} touches two edges`);
    assert.ok(360 * scale <= width + 1e-9 && 640 * scale <= height + 1e-9, `${width}x${height}`);
  }
});

test('level has every obstacle exactly once', () => {
  const expected = ['bac1', 'bac2', 'bac3', 'bac4', 'bac5', 'bac6', 'txt1', 'txt2', 'txt3', 'txt4', 'txt5', 'txt6', 'txt7', 'txt8', 'txt9'];
  assert.deepEqual(OBSTACLES.map((o) => o.file).sort(), expected);
});

test('obstacle sizes are 50% of the asset, except the bac6 the design draws smaller', async () => {
  for (const o of OBSTACLES) {
    const meta = await sharp(`${ASSETS}01_game/${o.file}.png`).metadata();
    if (o.file === 'bac6') continue;
    assert.deepEqual([o.width, o.height], [meta.width / 2, meta.height / 2], o.file);
  }
});

test('every obstacle is passed before the end of the gut', () => {
  for (const o of OBSTACLES) assert.ok(o.x + o.width - END_SCROLL < PLAYER.x, o.file);
});

test('nothing moves before the first tap', () => {
  const game = new Game(masks);
  game.advance(5);
  assert.equal(game.state, 'ready');
  assert.equal(game.y, PLAYER.y);
  assert.equal(game.scroll, 0);
});

function skipHover(game) {
  game.tap();
  while (game.scroll < HOVER_SCROLL) game.advance(1 / 120);
}

test('the first tap starts the run and the player hovers safely over the first obstacles', () => {
  const game = new Game(masks);
  game.tap();
  assert.equal(game.state, 'playing');
  game.tap();
  skipHover(game);
  assert.equal(game.state, 'playing');
  assert.ok(game.velocity >= 0, 'taps during the hover have no effect');
  assert.ok(game.y > PLAYER.y && game.y < HOVER_END_Y + 1, `y ${game.y}`);
});

test('a tap after the hover makes the player jump up, without touching the top fold', () => {
  const game = new Game(masks);
  skipHover(game);
  const start = game.y;
  game.tap();
  game.advance(0.1);
  assert.ok(game.y < start);
  for (let i = 0; i < 60; i++) game.advance(1 / 120);
  assert.equal(game.state, 'playing');
});

test('without taps the player falls and the run fails', () => {
  const game = new Game(masks);
  game.tap();
  for (let i = 0; i < 300 && game.state === 'playing'; i++) game.advance(1 / 60);
  assert.equal(game.state, 'failed');
  assert.ok(game.y > PLAYER.y);
});

test('flying up into the top fold fails the run', () => {
  const game = new Game(masks);
  skipHover(game);
  for (let i = 0; i < 300 && game.state === 'playing'; i++) {
    game.tap();
    game.advance(1 / 60);
  }
  assert.equal(game.state, 'failed');
  assert.equal(game.hit, 'fold');
  assert.ok(game.y < PLAYER.y);
});

test('a run that avoids every obstacle reaches the win state', () => {
  const game = new Game(masks);
  playWithBot(game);
  assert.equal(game.state, 'won', `stopped on ${game.hit} at scroll ${Math.round(game.scroll)}, y ${Math.round(game.y)}`);
  assert.equal(game.scroll, END_SCROLL);
  assert.equal(game.passed, OBSTACLES.length);
});

test('the result does not depend on the frame rate', () => {
  const a = new Game(masks);
  const b = new Game(masks);
  a.tap();
  b.tap();
  for (let i = 0; i < 30; i++) a.advance(1 / 60);
  for (let i = 0; i < 72; i++) b.advance(1 / 144);
  assert.ok(Math.abs(a.y - b.y) < 3);
  assert.ok(Math.abs(a.scroll - b.scroll) < 1.5);
});

test('a very long frame cannot skip through the level', () => {
  const game = new Game(masks);
  game.tap();
  game.advance(60);
  assert.ok(game.scroll < 20);
});

test('reset restores the starting state', () => {
  const game = new Game(masks);
  game.tap();
  for (let i = 0; i < 300 && game.state === 'playing'; i++) game.advance(1 / 60);
  game.reset();
  assert.deepEqual(
    [game.state, game.y, game.velocity, game.scroll, game.hit, game.accumulator],
    ['ready', PLAYER.y, 0, 0, null, 0],
  );
});

test('a player centred on an obstacle collides', () => {
  const game = new Game(masks);
  const bac1 = OBSTACLES.find((o) => o.file === 'bac1');
  game.scroll = bac1.x + bac1.width / 2 - PLAYER.x - PLAYER.width / 2;
  game.y = bac1.y + bac1.height / 2 - PLAYER.height / 2;
  assert.equal(game.findHit(), 'bac1');
});

test('fair collision: every hit is a real overlap of drawn pixels, and hitboxes beat rectangles', async () => {
  const player = await loadFullAlpha('01_game/player.png');
  let hits = 0;
  let forgiven = 0;
  for (const o of OBSTACLES) {
    const image = await loadFullAlpha(`01_game/${o.file}.png`);
    const assetScale = image.width / o.width;
    const mask = masks.obstacles[o.file];
    for (let dx = -PLAYER.width; dx <= o.width; dx += 1.5) {
      for (let dy = -PLAYER.height; dy <= o.height; dy += 1.5) {
        const collides = masksOverlap(masks.player, 0, 0, mask, Math.round(-dx), Math.round(-dy));
        if (!collides) {
          forgiven++;
          continue;
        }
        hits++;
        let drawnOverlap = false;
        for (let y = 0; y < player.height && !drawnOverlap; y++) {
          for (let x = 0; x < player.width && !drawnOverlap; x++) {
            if (!player.data[(y * player.width + x) * 4 + 3]) continue;
            const ox = Math.floor(((x / 2 + dx) * assetScale));
            const oy = Math.floor(((y / 2 + dy) * assetScale));
            if (ox < 0 || oy < 0 || ox >= image.width || oy >= image.height) continue;
            if (image.data[(oy * image.width + ox) * 4 + 3]) drawnOverlap = true;
          }
        }
        assert.ok(drawnOverlap, `${o.file} dx ${dx} dy ${dy}: hit with no drawn overlap`);
      }
    }
  }
  assert.ok(hits > 1000);
  const forgivenShare = forgiven / (forgiven + hits);
  console.log(`rectangle overlaps that are not hits: ${(forgivenShare * 100).toFixed(1)}%`);
  assert.ok(forgivenShare > 0.25, `only ${forgivenShare} of rectangle overlaps are forgiven`);
});
