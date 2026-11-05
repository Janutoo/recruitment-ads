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
- [ ] Fills the visible viewport from 320x568 to 430x932 without distortion or important content cut off.
- [ ] Stays correct when mobile browser toolbars show or hide.

**Start screen**
- [x] Logo bar, headline and tutorial layers match `01-start.png` (Chromium, 360x640, static, no player or obstacles yet).
- [ ] The first tap starts the game.

**Gameplay**
- [ ] Player x is fixed. A tap jumps, gravity pulls down.
- [ ] Gut and obstacles scroll right to left, clipped below y 168.5.
- [ ] 15 obstacles (`bac1-6`, `txt1-9`), each exactly once per run (asserted in debug mode).
- [ ] Touching an obstacle or leaving the playfield at the top or bottom shows the fail endcard.
- [ ] Reaching the end after all obstacles shows the win endcard.
- [ ] No fail without visible contact: hitboxes are tighter than the images and were checked visually.

**Endcards**
- [ ] Fail: sad poo, bacteria, headline, CTA, replay.
- [ ] Replay restarts cleanly: after 5 replays, speed is unchanged and there is one loop of each timer and sound.
- [ ] Win: happy poo, confetti, headline, CTA, applause or cheer.
- [ ] Animated entrance of endcard elements with easing.

**Sound and lifecycle**
- [ ] Music loop in game, crash on hit, fail and win sounds on endcards.
- [ ] Audio starts only after the first interaction.
- [ ] Mute toggle works in every state.
- [ ] Intro animation on the start screen.
- [ ] Hidden tab pauses game and sound, and resumes without a jump in position.

## Variant A: nice to have

- [ ] "Get ready" moment before the first obstacle.
- [ ] Gentle difficulty ramp.
- [ ] `prefers-reduced-motion` for decorative animation.
- [ ] `?debug=1` draws hitboxes.

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
