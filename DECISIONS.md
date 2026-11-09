# Decisions

Each entry gives the problem, the decision, the alternative and the trade-offs. Status is **Tested**, followed by how it was checked, or **Decided**, for a choice with nothing to measure.

## 1. Project structure: one package, two Vite roots

**Status: Tested.** Both variants build, and Variant B loads from a subfolder.

- **Problem:** the variants must stay independent, Variant B needs four entry points, and the weight must be measured on real files.
- **Decision:** one `package.json`, plus a `vite.config.js` per variant, with `base: './'` and `assetsInlineLimit: 0`.
- **Alternative:** npm workspaces, or one config switched by an environment variable.
- **Trade-offs:** two small configs repeat a few lines, in exchange for no workspace layer and no conditionals.

## 2. Variant B background: blend `bg-big.jpg` with the pre-cut files

**Status: Tested** in Chromium at 1680x975.

- **Problem:** neither provided background meets both requirements.

| Measured | Pre-cut `bg.jpg` | `bg-big.jpg` | Blend |
|---|---|---|---|
| Difference from `layout.png`, left / right (lower is better) | 15 / 17 | 23 / 52 | 20 / 21 |
| Top/right seam vs. the same distance inside an image | 64 vs. 39, visibly broken | 41 vs. 48 | 42 vs. 48 |
| Left/top seam vs. the same distance inside an image | 70 vs. 48 | 62 vs. 51 | 61 vs. 49 |
| Right pack width in asset px (`layout.png` scale: 340) | 340 | 383 (+12.6%) | 340 |
| Blue remnant on the left pack | no | yes | no |

- **Decision:** the sides use `bg-big.jpg` above y 385 and the pre-cut file below y 480, with a smooth fade in between. The top is cut from `bg-big.jpg`. Seams only exist in the top 250 CSS px of the sides, because below that they sit next to the website.
- **Alternative:** `bg-big.jpg` alone (wrong product size and an artefact) or the pre-cut files alone (broken seams).
- **Trade-offs:** the JPEGs are recompressed at q85. Between y 480 and y 500, the last 10 CSS px of the seam, the side no longer comes from `bg-big.jpg`. The top banner's moss differs from `layout.png`, so the rock sits further right and continues into the right part.
- **Residual:** the left/top seam stays somewhat above the baseline, as it does in `bg-big.jpg` itself. No break is visible by eye, but the metric does not prove it is perfect.
- **Assumption:** the 4 CSS px gap. It fits both the frame spacing in `layout.png` and the `bg-big.jpg` width (320 + 4 + 1032 + 4 + 320 = 1680), but nothing in the brief states it.

## 3. Variant B layers without alpha

**Status: Tested** in Chromium on the final frame and on four frames captured during the intro, with no black areas. The CTA appears after those frames, so it was checked at rest only. While it pulses it only scales, which keeps its corners rounded.

- **Problem:** `box.png`, `cta.png` and the side `hl.png` have no alpha channel, so their black areas are opaque.
- **Decision:**
  - Panel: `clip-path` to the blue band, plus `opacity: 0.83` (regression against `layout.png` gave 0.82 to 0.84).
  - CTA: `border-radius: 6px`.
  - Copy: `mix-blend-mode: screen`.
- **Alternative:** convert the files to PNG with alpha.
- **Trade-offs:** assets stay untouched, but blending has a repaint cost. If it hurts frame rate over a moving background, convert the copy to alpha.
- **Known differences:** `cta.png` is `#b80000` while `layout.png` shows about `#a82116`. The panel is also more saturated than in `layout.png`. I kept the provided assets, as the brief asks.

## 4. Variant B background motion

**Status: Tested** in desktop Chromium.

- **Problem:** continuous seams need all parts to move as one surface, but scaling around a shared point pushes each side's inner edge away from the seam. With 3% zoom around the centre of the whole fireplace, the left part's inner edge moves about 16 CSS px and exposes an uncovered strip.
- **Decision:** zoom the sides around their inner top corner and keep the top banner still. The intro goes from 1.03 to 1, and the calm state breathes between 1 and 1.015, ending at 1 at the 30 second mark.
- **Alternative:** extra pixels beyond the inner edges of the slices, which `bg-big.jpg` can supply above the seam line but the pre-cut files below it cannot. Or a still background, which is calmer but less impressive.
- **Trade-offs:** the top banner has no zoom. While the sides move, the seam drifts vertically by at most 7.5 CSS px in the intro and 3.75 CSS px afterwards, and only at its bottom end. At rest it lines up exactly, and the end state matches the static layout with no difference.
- **Motion direction:** the brief's example says "zooms in", but the intro ends by settling to scale 1. Ending zoomed in would leave the product and seams misplaced. The zoom-in part is the calm state.

## 5. Conflicts between the brief and the assets

**Status: Decided.** No extra assets were requested, so the task is solved with what was provided.

- **Baked-in product.**
  - **Problem:** the brief's example has the product sliding in, but the pack and flowers are part of the backgrounds.
  - **Decision:** the background starts dimmed, and a masked copy of the same image lands on the pack from 12% larger and 16 px lower, easing to a stop while the background brightens. The copy is always larger than the pack it covers, so the original never shows, and a band of light crosses the pack afterwards.
  - **Alternative:** cut the pack out of the background to move it, which leaves a hole that would have to be redrawn, and the brief forbids redrawing.
  - **Trade-offs:** the pack arrives from nearby rather than from outside the part, but nothing is redrawn and no bytes are added.
- **Top headline.**
  - **Problem:** `top/hl.png` reads "STARK BEI / HUSTENREIZ & / HALSSCHMERZEN.", while `layout.png` reads "NATÜRLICH STARK / BEI HUSTENREIZ & / HALSSCHMERZEN."
  - **Decision:** use the provided asset, and build its three lines one by one.
  - **Alternative:** typeset the layout wording in CSS, which needs a font we don't have and replaces an asset.
  - **Trade-offs:** the wording differs from the layout, in exchange for following "use the provided assets".
- **"tab to run".**
  - **Problem:** `gesture.png` says "tab to run" and the brief says "tap to run".
  - **Decision:** use the asset unchanged and list the typo under known issues.
  - **Alternative:** retouch the text, which the brief forbids.
  - **Trade-offs:** a visible typo stays in the ad.
- **Text obstacles.**
  - **Problem:** the bacteria are arguably more fun than vertical German words.
  - **Decision:** keep the words, because the brief requires them and they carry the campaign's message.
  - **Alternative:** bacteria only, which leaves 6 obstacles instead of 15. Listed under next steps as something worth testing.
  - **Trade-offs:** a slightly less playful game, in exchange for meeting the brief.
- **Endcard assets versus designs.**
  - **Problem:** the provided headlines are about 2.3% wider than in the designs (fail: 611 vs. 597 asset px), and the CTA and replay images are drawn slightly differently.
  - **Decision:** use the assets, positioned from the designs. All other endcard layers match to under 0.3 of 255.
  - **Alternative:** rescale the assets to the design, which breaks "render at 50%".
  - **Trade-offs:** the text doesn't overlay the design pixel for pixel.

## 6. Variant B synchronisation: `postMessage` with a local fallback

**Status: Tested** in desktop Chromium: five fresh loads started within 0.1 ms of each other. Different origins are not tested.

- **Problem:** three separate documents must start together, and in production they may be on different origins and no preview page exists.
- **Decision:** each part posts `ready` to its parent once its images are decoded. The preview sends `start` when all three are ready. A framed part with no `start` after 1.5 s starts by itself, and a part with no parent starts straight away.
- **Alternative:** `BroadcastChannel` (same origin only, so not usable across ad iframes) or a shared timestamp in the URL (needs synchronised clocks and a controlling page anyway).
- **Trade-offs:** in production, a framed part waits 1.5 s before it starts, because it can't know that no `start` is coming. Real ad delivery has no shared start signal, so real parts would start less precisely.

## 7. Variant A rendering: Canvas 2D without an engine

**Status: Tested** in Chromium on desktop, and by hand on a real phone and a real iPad mini.

- **Problem:** the game needs one moving world, custom hitboxes, a debug overlay and a clean restart, with little weight to spare.
- **Decision:** one `<canvas>` for gameplay. Endcards stay in the DOM, which makes the CTA and replay real buttons and suits GSAP.
- **Alternative:** Phaser (measured at 1.376 MB, which with the 2.016 MB of assets exceeds the 3 MB limit unless assets are compressed) or DOM-only with `transform` (simple, but it adds a compositing layer per obstacle and makes the debug overlay harder).
- **Trade-offs:** I write the loop, input and pause myself. It is a small amount of code, but those are also the likely bug sources, so they get explicit replay and pause tests.
- **Time step:** the rules run at a fixed 1/120 s through an accumulator, with long frames clamped. A 60 Hz and a 120 Hz phone play the same game, and the rules run without a DOM, so a bot can test the whole level in Node.
- **Risk:** `gameplay.png` is 5056 px wide, above the 4096 px texture limit of some mobile GPUs. It works on the real phone and iPad mini used for testing. If it fails on another device, the fix is to split the image at load.

## 7a. Variant A collision: masks from the alpha channel

**Status: Tested.** This replaces the original plan of an ellipse plus hand-tuned shapes.

- **Problem:** the player must never die without visibly touching something, and images fill only 38% to 72% of their rectangles.
- **Decision:** at load, build a 1 stage px mask from each image's alpha channel. Erode the player by 2 px and obstacles and folds by 1 px. The folds use the same test, so touching one counts as leaving the playfield.
- **Alternative:** hand-tuned shapes for 15 objects, which are more work and only approximate the drawing.
- **Trade-offs:** `getImageData` needs same-origin images, so the ad will not start from `file://` or from a CDN without CORS. It costs a little at load in exchange for no tuning.
- **Evidence:** in a test across all 15 obstacles, every hit was a real overlap of drawn pixels, and 33.5% of rectangle overlaps did not count as hits.

## 8. Variant A scaling: fit 360x640, extend the background

**Status: Tested** at the four sizes below, plus tablet, landscape and desktop sizes, in Chromium with emulated devices. An iPad mini simulator (iOS 26.5, real Safari) fills the screen when opened in either orientation and after rotating both ways. A real phone fills the screen too. On a real iPad mini, rotating without a reload works in Safari and in Chrome on the current build (checked by hand). See the two Chrome entries below.

- **Problem:** the phones in scope are not all 9:16.

| Viewport | Scale | Free space |
|---|---|---|
| 320x568 | 0.8875 | under 1 px wide |
| 360x640 | 1 | none |
| 390x664 (toolbar visible) | 1.0375 | 16.5 px wide |
| 430x932 | 1.194 | 168 px tall |

- **Decision:** the canvas and the DOM layer get explicit sizes from `innerWidth` and `innerHeight`, re-measured on resize and rotation and again shortly after, because iOS can report the final size late. All layers sit in a container with `overflow: hidden`, because iOS Safari zooms a page out when something sticks out of the screen. `scale = min(width / 360, height / 640)`, and the stage is centred. Its surroundings extend to every edge: white above the logo bar, the fold colour below, and alternating mirrored copies of gut, texture and folds at the sides. The canvas never has more than 2 pixels per stage px, because assets are 2x.
- **Alternative:** `cover` scaling (cuts off the logo or CTA), a taller playfield (changes difficulty between phones, so collision fairness differs), or a portrait column with empty sides on wide screens (tried first, and it looked poor on a tablet).
- **Trade-offs:** tall phones keep plain bands of about 84 px above and below (at 430x932). Wide screens show obstacles much earlier, about 2 s in landscape on an iPad, so the game is easier there. The rules and collisions are the same everywhere.
- **Found by playing:** on a real iPad mini, the first versions left a narrow column between dark bars.
- **Chrome on iPad:** logs sent from the device showed that after a rotation to landscape Chrome sometimes keeps the portrait page width (744 instead of 1133 px) and paints nothing outside it, so a strip of background stays on the right. It happened on every rotation in two sessions. Sizing the canvas to the window width did not help, because Chrome still clips the page. So when the window and the orientation media query disagree for at least 0.5 s, the viewport tag gets the window width, which makes Chrome lay the page out again, and from then on it follows the window width. The delay exists because Chrome on iPhone shows the same mismatch for up to about 0.4 s while it rotates. **Status:** the logic is tested in simulation with values from the device logs. On the real iPad the bug did not come back after the change, so the workaround has not had to run there yet. The simulator only runs Safari, which is why it never showed the strip.
- **Chrome on iPhone in landscape:** Chrome keeps the page out of the notch areas (832 of 926 px), so bars in the page background colour remain at the sides. The game fills the whole page, and a page cannot paint outside it.
- **Evidence:** emulated phones at a pixel ratio of 3 use a 752x1280 canvas at 390x664 and hold 60 fps in desktop Chromium, which says little about a real phone's GPU.

## 9. Variant A audio

**Status: Tested** by inspecting the audio state in Chromium with emulated touch, and by ear on a real phone, where all sounds play. The volume balance has not been tuned.

- **Problem:** autoplay is blocked until the first interaction, and replays must not stack sounds.
- **Decision:** Web Audio API. Files download once the game can be played (see section 14) and decode after the first interaction, with every source tracked and one gain node for mute. A sound that fails to download or decode is skipped and the game goes on. The context also unlocks on `pointerup`, because on touch `pointerdown` doesn't count as an interaction. The loop skips the 72 ms and 140 ms of silence measured at the ends of the file. Audio files stay as provided, because the game weighs 2.111 MB of the 3 MB limit.
- **Alternative:** `<audio>` elements, which are simpler but less precise for looping and overlapping sounds.
- **Trade-offs:** slightly more code. The music is played at 60% as a first guess at the balance.
- **Evidence:** across 6 runs there was 1 source during play, crash plus fail on the endcard, and 0 after each replay.

## 10. Variant A start of a run

**Status: Tested.**

- **Problem:** the design places the player about 25 px under the top fold, and a jump is 44 px, so tapping at that height is an instant crash.
- **Decision:** the run starts on the frame from `01-start.png`. After the first tap, the world moves and the player glides down to y 285 over about 0.6 s, while the first two obstacles pass beneath it. Other taps do nothing until the glide ends.
- **Alternative:** move the player or obstacles (no longer matches the design) or use a weak first jump (still demands a split-second reaction).
- **Trade-offs:** two of the 15 obstacles pose no threat, and early taps are ignored. This doubles as the "get ready" moment.

## 11. Variant A pause: a tap resumes the run

**Status: Tested** with a simulated `visibilitychange`, because headless tabs do not really hide, and by hand on a real phone.

- **Problem:** the brief asks for a clean resume, but a game that restarts on its own can crash the player before they look.
- **Decision:** when the tab hides, the run freezes. On return it waits for a tap, and that first tap only resumes, with no jump.
- **Alternative:** resume automatically, which needs no tap but is unfair.
- **Trade-offs:** one extra tap. The frozen frame is dimmed and shows the provided gesture asset as a hint.

## 12. Variant A bac6 on the start screen

**Status: Tested.**

- **Problem:** the brief says to render at 50%, but `01-start.png` draws `bac6` at about 33.5% (template match: 67% of the 50% size).
- **Decision:** follow the target screen for this one obstacle, because it is on the first frame people see.
- **Alternative:** 50% everywhere, which makes it overlap "Stress" on the start screen.
- **Trade-offs:** one exception to a stated rule, covered by a test that names it.

## 13. Variant A endcards: DOM over the canvas

**Status: Tested** in Chromium.

- **Problem:** CTA and replay must be real buttons, and a replay must leave nothing behind.
- **Decision:** endcards are DOM layers in the same 360x640 coordinates as the canvas, animated with GSAP. Every animation is tracked, and `stopAnimations` is the one cleanup point used by replay.
- **Alternative:** draw them on the canvas, losing native buttons and keyboard access.
- **Trade-offs:** two layers to keep aligned, in exchange for much simpler buttons.
- **Layer order:** the confetti sits over the happy poo, as in `03-win-endcard.png`.

## 14. Variant A loading order and failed downloads

**Status: Tested** on the built game served from a subfolder, in Chromium with an emulated 1.6 Mbit/s connection and blocked requests.

- **Problem:** all 2.1 MB downloaded at once, although the first screen needs about 0.54 MB. On a slow connection the screen stayed empty for 9.3 s, and one image that failed to load left it empty for good.
- **Decision:**
  - The game images download first. The endcard images get their addresses from code once the game can be played, and the sound downloads after them. A first tap starts the sound download at once if it hasn't started yet.
  - A spinner shows while loading, without motion under `prefers-reduced-motion`.
  - A failed image is requested once more. If it still fails, the provided CTA image is shown and opens the click tag, with its alt text if that image is missing too.
- **Alternative:** a loading screen made from assets, which would itself have to download first, or one file with every image inside it, which needs a build step for little gain.
- **Trade-offs:** on a slow connection the music can start a moment after the first tap, and an endcard reached very early could appear before its images. The fallback is a plain button, not an ad.
- **Evidence:** at 1.6 Mbit/s the game is ready after 3.5 s instead of 9.3 s. One failed image is retried and the game starts. A permanently failed image shows the CTA, and a click opens the click tag. With all sounds blocked, the game plays without errors.

## Measured positions

Asset positions found by template matching on the design files, in CSS px.

| Element | x, y | Match |
|---|---|---|
| Player on start screen | 55.5, 258.5 | exact |
| Gesture | 147.5, 452 | close |
| Gut offset on start screen | -2 | close |
| Fail CTA | 37, 482.5 | close |
| Replay | 37, 538.5 | close |
| Win CTA | 27.5, 560 | close |
| Fireplace CTA | 73.75, 838 | from `layout.png`, about 2 px uncertainty from its 0.975 scale |

The playfield clip starts at y 168.5, because `gameplay.png` and `bg_texture.png` reach above the top fold. The fully open corridor between the folds is about y 235 to y 566 (331 CSS px). The longest obstacle is 181 CSS px.
