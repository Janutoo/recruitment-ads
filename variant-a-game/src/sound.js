// Web Audio: one context, one master gain for mute, and every source tracked so a replay
// cannot leave anything playing.
const MUSIC_VOLUME = 0.6;
// The music file has 72 ms of silence at the start and 140 ms at the end.
const MUSIC_LOOP = { start: 0.0721, end: 57.6947 };

const urls = {
  music: new URL('../assets/music/background_music/Funny Game Loop.mp3', import.meta.url).href,
  crash: new URL('../assets/music/crash/Cartoon Crash Boing.mp3', import.meta.url).href,
  fail: new URL('../assets/music/endcard_fail/Fail.mp3', import.meta.url).href,
  applause: new URL('../assets/music/endcard_win/applause.mp3', import.meta.url).href,
  cheer: new URL('../assets/music/endcard_win/Celebrative Happy Woohoo Cheer 2.mp3', import.meta.url).href,
};

export class Sound {
  constructor() {
    // Files download at load, but nothing can be decoded or played before the first interaction.
    this.files = Object.fromEntries(
      Object.entries(urls).map(([name, url]) => [name, fetch(url).then((response) => response.arrayBuffer())]),
    );
    this.buffers = {};
    this.sources = new Set();
    this.generation = 0;
    this.muted = false;
    this.context = null;
    this.hidden = false;
    this.held = false;
  }

  // Safe to call on every interaction. A failed sound must never stop the ad.
  unlock() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      this.context = new AudioContextClass();
      this.master = this.context.createGain();
      this.master.gain.value = this.muted ? 0 : 1;
      this.master.connect(this.context.destination);
      for (const [name, file] of Object.entries(this.files)) {
        this.buffers[name] = file
          .then((data) => this.context.decodeAudioData(data))
          .catch((error) => {
            console.warn(`Sound ${name} is unavailable`, error);
            return null;
          });
      }
    }
    this.resume();
  }

  async play(name, { loop = false, volume = 1 } = {}) {
    if (!this.context) return;
    const generation = this.generation;
    const buffer = await this.buffers[name];
    if (!buffer || generation !== this.generation) return; // stopAll ran while this was decoding.

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    if (loop) {
      source.loop = true;
      source.loopStart = MUSIC_LOOP.start;
      source.loopEnd = MUSIC_LOOP.end;
    }
    const gain = this.context.createGain();
    gain.gain.value = volume;
    source.connect(gain).connect(this.master);
    source.onended = () => this.sources.delete(source);
    this.sources.add(source);
    source.start(0, loop ? MUSIC_LOOP.start : 0);
  }

  startMusic() {
    return this.play('music', { loop: true, volume: MUSIC_VOLUME });
  }

  stopAll() {
    this.generation++;
    for (const source of this.sources) {
      source.onended = null;
      source.stop();
    }
    this.sources.clear();
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.setTargetAtTime(muted ? 0 : 1, this.context.currentTime, 0.01);
  }

  setHidden(hidden) {
    this.hidden = hidden;
    this.resume();
  }

  // Keeps the sound stopped while a run waits for a tap after the tab returns.
  setHeld(held) {
    this.held = held;
    this.resume();
  }

  resume() {
    if (!this.context) return;
    if (this.hidden || this.held) this.context.suspend();
    else this.context.resume();
  }
}
