# Weight budget

The limit is 3 MB per complete ad: the game on its own, and the whole three-part fireplace on its own.

All values are bytes on disk with no gzip, using 1 MB = 1,000,000 B. Run `npm run build` and `npm run budget` to reproduce them. The command fails if an ad goes over the limit.

## Final build

| Ad | Weight | Margin to 3 MB |
|---|---|---|
| **Game** | **2.107 MB** | 0.893 MB |
| Fireplace `top.html` | 0.616 MB | |
| Fireplace `left.html` | 0.425 MB | |
| Fireplace `right.html` | 0.445 MB | |
| **Fireplace, whole ad** | **1.486 MB** | 1.514 MB |

The bundled GSAP code counts three times in the fireplace, because each part is delivered as its own package.

## What was compressed

- **Fireplace backgrounds:** recompressed to q85 while they were cut and blended (see DECISIONS.md). `top` 346 KB, `left` 329 KB, `right` 350 KB.
- **Everything else:** unchanged, because the margin doesn't require compression.

## Reserve

In a test outside the repository, cutting the applause to 6 s saved 0.565 MB. It isn't in use, and nobody has judged how it sounds.

## Not shipped

`bg-big.jpg`, the pre-cut `bg.jpg` files, `design/` and `preview.html`. The preview is a review tool, not an ad.
