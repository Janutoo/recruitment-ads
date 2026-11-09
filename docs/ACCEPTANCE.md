# Acceptance checklist

Source: the task README. `[x]` means verified by running it, in desktop Chromium unless stated. Open points are listed at the end.

## Both variants: required

- [x] Plain HTML, CSS and ES6+. No UI framework. GSAP is the only runtime library.
- [x] 2x assets render at 50%, positions come from measurements. One named exception: `bac6` on the start screen.
- [x] Every CTA opens `window.clickTag || 'https://example.com/landing'` in a new window (including a `clickTag` set by the page).
- [x] `npm run budget` passes on the final build, with each complete ad under 3 MB.
- [x] New public repository, not a fork, with a readable commit history.
- [x] README: run commands, next steps, known issues, AI note with one corrected example.
- [x] DECISIONS.md complete and matching the final code.

## Variant A: required

**Format**
- [x] Fills the viewport at 320x568, 360x640, 390x664, 390x844 and 430x932 without distortion or cropping (emulated phones at pixel ratio 2 and 3).
- [x] Tablets, landscape and desktop also fill the screen: 768x1024, 768x954, 744x1133, 1024x768, 1133x744, 844x390, 1920x1080 and 2560x1080 (emulated). Rotating during a run keeps it going.
- [x] iPad mini simulator with real Safari: opening in either orientation and rotating both ways fills the screen.
- [x] Real iPad mini in Safari: rotating without a reload works on the final build (checked by hand).
- [x] Real iPad mini in Chrome: rotating without a reload fills the screen (checked by hand). Chrome sometimes keeps the portrait width after a rotation. The workaround for that is tested in simulation, because the bug did not come back on the device after the change.
- [x] Real phone in Chrome, landscape: the game fills the page. Chrome leaves the notch areas at the sides outside the page.
- [x] Real phone: the game was played and works, including sound (checked by hand).

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
- [x] Music loop in game, crash on hit, fail and win sounds on endcards (audio state inspected, and heard on a real phone).
- [x] Audio starts only after the first interaction: no audio context exists before it.
- [x] Mute toggle works.
- [x] Intro animation on the start screen.
- [x] Game images load first, then endcard images, then sound. At an emulated 1.6 Mbit/s the game is ready after 3.5 s instead of 9.3 s, with a spinner meanwhile.
- [x] A failed image is retried once. If it keeps failing, a CTA that opens the click tag replaces the empty screen. Blocked sounds do not stop the game.
- [x] Hidden tab pauses game and sound, and resumes without a jump in position (simulated `visibilitychange`, then checked by hand on a real phone).

## Variant A: nice to have

- [x] "Get ready" moment before the first obstacle.
- [x] Gentle difficulty ramp from 120 to 160 px/s. Only the author has played it so far.
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

- Real devices were checked by hand on a phone and an iPad mini only, with no measured performance.
- The fireplace in Safari and Firefox, including `mix-blend-mode`, and the game in Firefox.
- Other players judging the difficulty and the audio balance.
- Fireplace parts on different origins.
- The Chrome on iPad width workaround actually running on a device.
