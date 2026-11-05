// Game rules with no DOM, so they run the same in the browser and in tests.
import { END_SCROLL, OBSTACLES, PLAYER } from './level.js';
import { masksOverlap } from './masks.js';

const STEP = 1 / 120; // Fixed step: a 60 Hz and a 120 Hz phone play the same game.
const MAX_FRAME = 0.1; // A long frame must not teleport the player.
const GRAVITY = 1100;
const JUMP_VELOCITY = -310;
const MAX_FALL_SPEED = 520;
const SPEED_START = 120;
const SPEED_END = 160;

// Get-ready moment: the first two obstacles pass under the player while it glides down from
// its designed position, which is too close to the top fold for a full jump.
export const HOVER_SCROLL = 75;
export const HOVER_END_Y = 285;

const smoothstep = (t) => t * t * (3 - 2 * t);

export class Game {
  constructor(masks) {
    this.masks = masks; // { player, border, obstacles: { [file]: mask } }
    this.reset();
  }

  reset() {
    this.state = 'ready'; // ready | playing | failed | won
    this.y = PLAYER.y;
    this.velocity = 0;
    this.scroll = 0;
    this.hit = null;
    this.accumulator = 0;
  }

  get speed() {
    return SPEED_START + (SPEED_END - SPEED_START) * (this.scroll / END_SCROLL);
  }

  // Obstacles fully behind the player.
  get passed() {
    return OBSTACLES.filter((o) => o.x + o.width - this.scroll < PLAYER.x).length;
  }

  tap() {
    if (this.state === 'ready') {
      this.state = 'playing';
    } else if (this.state === 'playing' && this.scroll >= HOVER_SCROLL) {
      this.velocity = JUMP_VELOCITY;
    }
  }

  advance(seconds) {
    this.accumulator += Math.min(seconds, MAX_FRAME);
    while (this.accumulator >= STEP) {
      this.accumulator -= STEP;
      this.step();
    }
  }

  step() {
    if (this.state !== 'playing') return;
    this.scroll = Math.min(this.scroll + this.speed * STEP, END_SCROLL);
    if (this.scroll < HOVER_SCROLL) {
      this.y = PLAYER.y + (HOVER_END_Y - PLAYER.y) * smoothstep(this.scroll / HOVER_SCROLL);
    } else {
      this.velocity = Math.min(this.velocity + GRAVITY * STEP, MAX_FALL_SPEED);
      this.y += this.velocity * STEP;
    }

    this.hit = this.findHit();
    if (this.hit) this.state = 'failed';
    else if (this.scroll >= END_SCROLL) this.state = 'won';
  }

  findHit() {
    const { player, border, obstacles } = this.masks;
    const px = Math.round(PLAYER.x);
    const py = Math.round(this.y);
    // The folds are the edge of the playfield, so touching one is leaving it.
    if (masksOverlap(player, px, py, border, 0, 0)) return 'fold';
    for (const o of OBSTACLES) {
      const ox = Math.round(o.x - this.scroll);
      if (masksOverlap(player, px, py, obstacles[o.file], ox, Math.round(o.y))) return o.file;
    }
    return null;
  }
}
