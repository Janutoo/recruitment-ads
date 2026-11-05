# Weight budget

The limit is 3 MB per complete ad: the game on its own, and the whole three-part fireplace on its own.

All values are bytes on disk with no gzip, using 1 MB = 1,000,000 B.

## Measured today

`npm run budget` on the current build:

| Ad | Weight | Contents |
|---|---|---|
| Fireplace `top.html` | 0.542 MB | background, headline with glow, CSS, HTML |
| Fireplace `left.html` | 0.350 MB | background, overlays, CSS, HTML |
| Fireplace `right.html` | 0.371 MB | background, overlays, CSS, HTML |
| **Fireplace, whole ad** | **1.262 MB** | no JS yet |
| Game `index.html` | 0.402 MB | **placeholder only**: no audio, sprites or endcards |

The passing `npm run budget` result does not cover the finished game yet.

## Forecast

| Item | Weight | Status |
|---|---|---|
| Game source assets, all | 2.016 MB | measured |
| GSAP 3.15.1 `gsap.min.js` | 0.073 MB | measured |
| Game code | 0.030 MB | **assumption** |
| Fireplace code per part | 0.010 MB | **assumption** |

| Ad | Total | Margin to 3 MB |
|---|---|---|
| Game: all assets unchanged + GSAP + code | 2.119 MB | 0.881 MB |
| Fireplace: current build + 3x GSAP + 3x code | 1.511 MB | 1.489 MB |

GSAP counts three times in the fireplace because each part is delivered as its own package.

## Compression

- **Fireplace backgrounds:** q85, because the margin allows it. Recompressing is required anyway to cut and blend them.
- **Game assets:** unchanged, so audio quality stays as provided.
- **Reserve if needed:** in a test outside the repository, cutting the applause to 6 s saved 0.565 MB. Neither its sound nor any other compression was evaluated, as it is not planned.

## Not shipped

`bg-big.jpg`, the pre-cut `bg.jpg` files, `design/` and `preview.html`. The preview is a review tool, not an ad.

## Not verified yet

`budget.mjs` follows `src`, `href` and CSS `url()`. It must also count dynamic imports and audio loaded from JS before it can be trusted on the final game.
