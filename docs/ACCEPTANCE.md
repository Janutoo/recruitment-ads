# Acceptance checklist

Source: the task README. `[x]` means verified by running it, in desktop Chromium unless stated. Open points are listed at the end.

## Both variants: required

- [x] Plain HTML, CSS and ES6+. No UI framework. GSAP is the only runtime library.
- [x] 2x assets render at 50%, positions come from measurements. One named exception: `bac6` on the start screen.
- [x] Every CTA opens `window.clickTag || 'https://example.com/landing'` in a new window (including a `clickTag` set by the page).
- [x] `npm run budget` passes on the final build, with each complete ad under 3 MB.
- [ ] New public repository, not a fork, with a readable commit history. The repository exists but the code isn't pushed yet.
- [x] README: run commands, next steps, known issues, AI note with one corrected example.
- [x] DECISIONS.md complete and matching the final code.

## Variant A: required

**Format**
- [x] Fills the viewport at 320x568, 360x640, 390x664, 390x844 and 430x932 without distortion or cropping (emulated phones at pixel ratio 2 and 3).
- [x] Tablets, landscape and desktop also fill the screen: 768x1024, 768x954, 744x1133, 1024x768, 1133x744, 844x390, 1920x1080 and 2560x1080 (emulated). Rotating during a run keeps it going. Not yet confirmed on a real iPad.

**Start screen**
- [x] Logo bar, headline, player, obstacles and tutorial match `01-start.png` (average difference 1.2 of 255).
- [x] The first tap starts the game (mouse, keyboard and emulated touch).

**Gameplay**
- [x] Player x is fixed. A tap jumps, gravity pulls down.
- [x] Gut and obstacles scroll right to left, clipped below y 168.5.
- [x] 15 obstacles (`bac1-6`, `txt1-9`), each exactly once per run (test).
- [x] Touching an obstacle or leaving the playfield at the top or bottom shows the fail endcard.
- [x] Reaching the end after all obstacles shows the win endcard (bot in tests and in Chromium).
- [x] No fail without visible contact: every hit in the test is an overlap of drawn pixels, and a crash was checked visually with `?debug=1`.

**Endcards**
- [x] Fail: sad poo, bacteria, headline, CTA, replay.
- [x] Replay restarts cleanly: over 6 runs the speed stayed at 120-121 px/s, with 1 sound source during play and 0 after each replay.
- [x] Win: happy poo, confetti, headline, CTA, applause and cheer.
- [x] Animated entrance of endcard elements with easing.

**Sound and lifecycle**
- [x] Music loop in game, crash on hit, fail and win sounds on endcards (audio state inspected, **not listened to**).
- [x] Audio starts only after the first interaction: no audio context exists before it.
- [x] Mute toggle works.
- [x] Intro animation on the start screen.
- [x] Hidden tab pauses game and sound, and resumes without a jump in position (simulated `visibilitychange`).

## Variant A: nice to have

- [x] "Get ready" moment before the first obstacle.
- [x] Gentle difficulty ramp from 120 to 160 px/s. No person has judged the feel yet.
- [x] `prefers-reduced-motion` for decorative animation.
- [x] `?debug=1` draws hitboxes.

## Variant B: required

**Format**
- [x] `top.html` (1032x250), `left.html` and `right.html` (320x975) as separate documents.
- [x] `preview.html` places them in iframes with an empty middle area.
- [x] Assets load with relative paths from a subfolder (checked on the static build).

**Layout**
- [x] Logo, product, panel, copy and CTA in the right place and size, compared with `layout.png`. CTA and panel colours differ because the provided assets do.
- [x] Three-line headline on the top banner, from the provided asset. Its wording differs from `layout.png`.
- [x] Seams line up where parts touch, at rest (visual check and pixel metric, 4 px gap assumed).
- [x] Layers without alpha show no black areas.

**Animation**
- [x] Intro of 4.6 seconds, coordinated across the parts, with the CTA last.
- [x] Calm state with a slow zoom and a gentle CTA pulse, stopped by 31 seconds.
- [x] Background motion keeps seams close: at most 7.5 CSS px of drift at the bottom of the seam, 0 at rest.
- [x] Only `transform` and `opacity` are animated. The intro ran at 57 fps on the test machine, with one long frame of 117 ms.
- [x] `prefers-reduced-motion` shows the final state without motion, identical to the end of the intro.

**Clickout**
- [x] Clicking anywhere on a part opens the click tag (left part checked; the same code runs in all three).

## Variant B: nice to have

- [x] Parts start in sync through `postMessage` from the preview (within 0.1 ms over 5 loads).
- [x] Debug overlay shows `layout.png` at 50% with `preview.html?overlay=1`. `layout.png` has uneven spacing, so the right part sits about 3 px off.

## Optional deliverable

- [ ] Screen recording under 1 minute, stored in the repository.

## Still open

- Real phones: touch, browser toolbars, performance, and the 5056 px wide `gameplay.png`.
- Safari and Firefox, including `mix-blend-mode` and Web Audio on iOS.
- Listening to the audio, and a person judging the difficulty.
- A real tab switch, and parts on different origins.
