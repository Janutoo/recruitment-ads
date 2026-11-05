# Weight budget

The brief says: "keep the total ad (all files you ship) under 3 MB". That can be read three ways, and this budget is built to pass the strictest one until the recruiter confirms.

All values are bytes on disk with no gzip, using 1 MB = 1,000,000 B.

## Measured today

`npm run budget` on the current build:

| Creative | Weight | Contents |
|---|---|---|
| `top.html` | 0.484 MB | slice, headline with glow, CSS, HTML |
| `left.html` | 0.287 MB | slice, overlays, CSS, HTML |
| `right.html` | 0.305 MB | slice, overlays, CSS, HTML |
| **Variant B, three separate packages** | **1.076 MB** | no JS yet |
| `index.html` (Variant A) | 0.401 MB | **placeholder only**: no audio, sprites or endcards |

The passing `npm run budget` result does not cover the finished game yet.

## Forecast

| Item | Weight | Status |
|---|---|---|
| GSAP 3.15.1 `gsap.min.js` | 0.073 MB | measured |
| Phaser 4.2.1 `phaser.min.js` | 1.376 MB | measured, not planned for use |
| Variant A source assets, all | 2.016 MB | measured |
| Variant A code | 0.030 MB | **assumption** |
| Variant B code per part | 0.010 MB | **assumption** |

| Variant | Scenario | Total |
|---|---|---|
| A | assets unchanged + GSAP + code | 2.119 MB |
| A | **applause cut to 6 s, mono 48 kbps** | **1.554 MB** |
| A | all audio mono 48 kbps, PNG palette q80 | 0.706 MB |
| B | **current build + 3x GSAP + 3x code** | **1.326 MB** |

GSAP counts three times in Variant B because each part is delivered as its own ad.

## The three readings

| Reading of "3 MB" | A unchanged + B | A with cut applause + B |
|---|---|---|
| Per creative | pass (2.119 max) | pass (1.554 max) |
| Per variant | pass (2.119 max) | pass (1.554 max) |
| Whole submission | **fail (3.445)** | pass (2.880) |

## Budget

| Target | Limit |
|---|---|
| Variant A | 1.60 MB |
| Variant B, three packages | 1.35 MB |
| Total | 2.95 MB |

The cut applause is the only compression needed: it saves 0.565 MB, more than the 0.445 MB overshoot. If the recruiter confirms a per-ad limit, it can go back to full length, and the side and top backgrounds can move from q75 to q85 (+0.17 MB).

## Not shipped

`bg-big.jpg`, the pre-cut `bg.jpg` files, `design/` and `preview.html`. The preview is a review tool, not an ad.

## Not verified yet

- Compressed audio has not been listened to. Sizes were measured on test files outside the repository.
- PNG palette quality has not been compared visually. It is a reserve, not a plan.
- `budget.mjs` follows `src`, `href` and CSS `url()`. It must also count dynamic imports and audio loaded from JS before it can be trusted on the final game.
