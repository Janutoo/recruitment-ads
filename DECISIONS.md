# Decisions

Each entry gives the problem, the decision, the alternative and the trade-offs. Status is either **Tested**, **Proposed** (not built yet) or **Open**.

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

**Status: Tested** statically in Chromium. Not tested while animating.

- **Problem:** `box.png`, `cta.png` and the side `hl.png` have no alpha channel, so their black areas are opaque.
- **Decision:**
  - Panel: `clip-path` to the blue band, plus `opacity: 0.83` (regression against `layout.png` gave 0.82 to 0.84).
  - CTA: `border-radius: 6px`.
  - Copy: `mix-blend-mode: screen`.
- **Alternative:** convert the files to PNG with alpha.
- **Trade-offs:** assets stay untouched, but blending has a repaint cost. If it hurts frame rate over a moving background, convert the copy to alpha.
- **Known differences:** `cta.png` is `#b80000` while `layout.png` shows about `#a82116`. The panel is also more saturated than in `layout.png`. I kept the provided assets, as the brief asks.

## 4. Variant B background motion

**Status: Open.** Decide in stage 2 with a prototype.

- **Problem:** continuous seams need all parts to move as one surface, but scaling around a shared point pushes each side's inner edge away from the seam. With 3% zoom around the centre of the whole fireplace, the left part's inner edge moves about 16 CSS px and exposes an uncovered strip.
- **Options:**
  - Keep extra pixels beyond the inner edges of the slices. `bg-big.jpg` can supply them above the seam line, but the pre-cut files below it cannot.
  - Zoom the sides around their inner top corner and keep the top banner still. The seam then drifts by at most 7.5 CSS px at 3%.
  - Keep the background still after the intro and use light or colour changes instead.
- **Trade-offs:** the brief lists zoom and drift only as examples, so a calm alternative is allowed, but it is less impressive. The first test will be the corner zoom because it adds no pixels.

## 5. Conflicts between the brief and the assets

**Status: Decided.** No extra assets were requested, so the task is solved with what was provided.

- **Baked-in product.**
  - **Problem:** the brief's example has the product sliding in, but the pack and flowers are part of the backgrounds.
  - **Decision:** leave the pack in place and reveal it with a mask or a light effect in the intro.
  - **Alternative:** cut the pack out of the background to move it, which leaves a hole that would have to be redrawn, and the brief forbids redrawing.
  - **Trade-offs:** no slide-in, but the brief lists it only as an example, and nothing is redrawn.
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

## 6. Variant B synchronisation: `postMessage` with a local fallback

**Status: Proposed.**

- **Problem:** three separate documents must start together, and in production they may be on different origins and no preview page exists.
- **Decision:** each part posts `ready` to its parent. The preview sends `start` once all three are ready. A part with no `start` after a short timeout starts by itself.
- **Alternative:** `BroadcastChannel` (same origin only, so not usable across ad iframes) or a shared timestamp in the URL (needs synchronised clocks and a controlling page anyway).
- **Trade-offs:** parts can start a little apart if a part misses the timeout, and the timeout delays a standalone start slightly.

## 7. Variant A rendering: Canvas 2D without an engine

**Status: Proposed.** No game code exists yet.

- **Problem:** the game needs one moving world, custom hitboxes, a debug overlay and a clean restart, with little weight to spare.
- **Decision:** one `<canvas>` for gameplay. Endcards stay in the DOM, which makes the CTA and replay real buttons and suits GSAP.
- **Alternative:** Phaser (measured at 1.376 MB, which with the 2.016 MB of assets exceeds the 3 MB limit unless assets are compressed) or DOM-only with `transform` (simple, but it adds a compositing layer per obstacle and makes the debug overlay harder).
- **Trade-offs:** I write the loop, input and pause myself. It is a small amount of code, but those are also the likely bug sources, so they get explicit replay and pause tests.
- **Time step:** based on `requestAnimationFrame` deltas, with a clamp so that returning from a hidden tab cannot cause a jump.
- **Hitboxes:** images fill only 38% to 72% of their rectangles. The plan is an ellipse for the player and a small hand-tuned shape per obstacle, checked with `?debug=1`.

## 8. Variant A scaling: fit 360x640, extend the background

**Status: Proposed.** Only the 360x640 layout is verified. The numbers below are calculations.

- **Problem:** the phones in scope are not all 9:16.

| Viewport | Scale | Free space |
|---|---|---|
| 320x568 | 0.8875 | under 1 px wide |
| 360x640 | 1 | none |
| 390x664 (toolbar visible) | 1.0375 | 16.5 px wide |
| 430x932 | 1.194 | 168 px tall |

- **Decision:** `scale = min(width / 360, height / 640)` from `visualViewport`, re-measured on resize. Centre the stage and extend the surrounding colours into the free space: white above the logo bar, the fold colour or endcard navy below, navy at the sides. The canvas backing store follows `devicePixelRatio`.
- **Alternative:** `cover` scaling (cuts off the logo or CTA) or a taller playfield (changes difficulty between phones, so collision fairness differs).
- **Trade-offs:** tall phones keep a colour band, in exchange for identical gameplay everywhere.
- **Open:** how the band looks at 430x932. To be reviewed on the real render.

## 9. Variant A audio

**Status: Proposed.**

- **Problem:** autoplay is blocked until the first interaction, and replays must not stack sounds.
- **Decision:** Web Audio API, decoding once after the first tap, with one music source at a time and one gain node for mute. Audio files stay as provided, because the game is forecast at 2.119 MB of the 3 MB limit.
- **Alternative:** `<audio>` elements, which are simpler but less precise for looping and overlapping sounds.
- **Trade-offs:** slightly more code. MP3 encoder padding can leave a small gap in the loop, which has not been tested.

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
