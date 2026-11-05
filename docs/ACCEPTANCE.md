# Acceptance checklist

Source: the task README. `[x]` means verified by running it, see the note on each item. Everything else is open.

## Both variants: required

- [ ] Plain HTML, CSS and ES6+. No UI framework. GSAP is the only runtime library.
- [ ] 2x assets render at 50% and positions come from measurements (static layers verified, animated ones open).
- [ ] Every CTA opens `window.clickTag || 'https://example.com/landing'` in a new window.
- [ ] `npm run budget` passes on the final build, with each complete ad under 3 MB, including audio and GSAP.
- [ ] New public repository, not a fork, with a readable commit history.
- [ ] README: run commands, next steps, known issues, AI note with one corrected example.
- [ ] DECISIONS.md complete and matching the final code.

## Variant A: required

**Format**
- [x] Fills the viewport at 320x568, 360x640, 390x664 and 430x932 without distortion or cropping (desktop Chromium and emulated phones at pixel ratio 2 and 3). Real phones are still open.
- [x] Wider screens (768x1024, 1920x1080) show a clean portrait column (Chromium).
- [ ] Stays correct when mobile browser toolbars show or hide. Viewport resize during a run works in desktop Chromium, real toolbars are untested.

**Start screen**
- [x] Logo bar, headline, player, obstacles and tutorial match `01-start.png` (Chromium, 360x640, average difference 1.2 of 255).
- [x] The first tap starts the game (mouse and keyboard, 8 of 8 from a fresh load, plus emulated touch on 3 phone sizes). A real touchscreen is untested.

**Gameplay**
- [x] Player x is fixed. A tap jumps, gravity pulls down (tests and Chromium).
- [x] Gut and obstacles scroll right to left, clipped below y 168.5 (Chromium).
- [x] 15 obstacles (`bac1-6`, `txt1-9`), each exactly once per run (test).
- [ ] Touching an obstacle or leaving the playfield at the top or bottom shows the fail endcard. The run ends correctly, the endcard is still missing.
- [ ] Reaching the end after all obstacles shows the win endcard. A bot reaches the win state in tests and in Chromium, the endcard is still missing.
- [x] No fail without visible contact: every hit in the test is an overlap of drawn pixels, and a crash was checked visually with `?debug=1`.

**Endcards**
- [ ] Fail: sad poo, bacteria, headline, CTA, replay.
- [ ] Replay restarts cleanly: after 5 replays, speed is unchanged and there is one loop of each timer and sound. The game logic restart passed 6 runs at about 120 px/s (Chromium), the button and sound are still missing.
- [ ] Win: happy poo, confetti, headline, CTA, applause or cheer.
- [ ] Animated entrance of endcard elements with easing.

**Sound and lifecycle**
- [ ] Music loop in game, crash on hit, fail and win sounds on endcards.
- [ ] Audio starts only after the first interaction.
- [ ] Mute toggle works in every state.
- [ ] Intro animation on the start screen.
- [ ] Hidden tab pauses game and sound, and resumes without a jump in position. The game part passed with a simulated `visibilitychange`, sound and a real tab switch are still open.

## Variant A: nice to have

- [x] "Get ready" moment before the first obstacle (test and Chromium).
- [ ] Gentle difficulty ramp. Speed goes from 120 to 160 px/s, but no person has judged the feel yet.
- [ ] `prefers-reduced-motion` for decorative animation.
- [x] `?debug=1` draws hitboxes (Chromium).

## Variant B: required

**Format**
- [x] `top.html` (1032x250), `left.html` and `right.html` (320x975) as separate documents (Chromium, measured in the browser).
- [x] `preview.html` places them in iframes with an empty middle area (Chromium).
- [x] Build loads from a subfolder with relative paths: all 15 referenced files returned 200.

**Layout**
- [x] Logo, product, panel, copy and CTA in the right place and size (Chromium, compared with `layout.png`). The CTA and panel colours differ because the provided assets do, see DECISIONS.md.
- [x] Three-line headline on the top banner, from the provided asset. Its wording differs from `layout.png`, see DECISIONS.md.
- [x] Seams line up where parts touch (Chromium, 1680x975, visual check and pixel metric, 4 px gap assumed).
- [x] Layers without alpha show no black areas (Chromium).

**Animation**
- [ ] Intro of 3 to 6 seconds, coordinated across the parts, revealing the baked-in product with a mask or light.
- [ ] Calm idle state with a gentle CTA pulse, reduced or stopped after about 30 seconds.
- [ ] Background motion keeps seams aligned (open design question, see DECISIONS.md).
- [ ] Only `transform` and `opacity` are animated, and it stays smooth with `mix-blend-mode` in place.
- [ ] `prefers-reduced-motion` shows the final state without motion.

**Clickout**
- [ ] Clicking a part, or at least its CTA, opens the click tag.

## Variant B: nice to have

- [ ] Parts start in sync through `postMessage` from the preview.
- [ ] Debug overlay shows `layout.png` at 50% opacity.

## Optional deliverable

- [ ] Screen recording under 1 minute, stored in the repository.
