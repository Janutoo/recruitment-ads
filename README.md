# We The Folks take-home: rich media ads

Both variants of the task: **Gut Run**, a mobile tap-to-jump game, and an animated three-part **Fireplace** desktop skin. Built with plain HTML, CSS and JavaScript, plus GSAP for animation.

## Run locally

```sh
npm install
npm run dev:a    # Game
```

For the fireplace, run `npm run dev:b` and open `/preview.html`.

## Useful URLs

| URL | What it does |
|---|---|
| `/?debug=1` (game) | Shows the hitboxes and game state |
| `/preview.html?overlay=1` (fireplace) | Lays the design over the build at 50% |

## Commands

| Command | Purpose |
|---|---|
| `npm test` | Run the game rules tests, including a bot that plays the whole level |
| `npm run build` | Build both variants into `variant-*/dist` |
| `npm run budget` | Measure each built ad against the 3 MB limit (build first) |
| `npm run assets:report` | Regenerate `docs/ASSETS.md` (needs `ffprobe`) |
| `npm run assets:slices` | Regenerate the fireplace backgrounds |

## Documents

- [DECISIONS.md](DECISIONS.md): decision log
- [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md): acceptance checklist with what was tested
- [docs/ASSETS.md](docs/ASSETS.md): asset inventory
- [docs/BUDGET.md](docs/BUDGET.md): weight budget and compression

## What I would do next with more time

- Test on more phones and measure performance, and test the fireplace in Safari and Firefox.
- Have other people play the game to tune the difficulty and the audio balance.
- A/B test a version of the game with characters only. The bacteria seem more fun than the vertical words.
- Ask for the product as a separate layer, so it could slide in from outside the fireplace.
- Trim the 15-second applause, which is the heaviest single file in the game.

## Known issues and shortcuts

- **Browsers:** the game was tested in Chromium and WebKit, on an iPad mini simulator, and by hand on a real phone and a real iPad mini in Safari and Chrome, including sound. The fireplace, a desktop format, was tested in Chromium. Details are in the [acceptance checklist](docs/ACCEPTANCE.md).
- **Provided assets win:** where they differ from the designs, I used the assets: the top headline wording, the CTA colour and "tab to run" on the gesture asset. See DECISIONS.md, section 5.
- **Fireplace:** the product is baked into the backgrounds, so it arrives from nearby rather than from outside the part. The 4 px gap between the parts comes from `layout.png` and the width of `bg-big.jpg`, because the brief doesn't state it.
- **Game:** it needs a local server, because it reads image alpha for collisions and uses ES modules. The brief allows this.
- **Game:** on wide screens the player sees obstacles earlier, so the game is easier there.
- **Game in Chrome on iOS:** in landscape on a phone with a notch, Chrome leaves the notch areas outside the page, so bars stay at the sides. On iPad, the game works around Chrome keeping the portrait width after a rotation (DECISIONS.md, section 8).
- **Mute toggle:** no asset was provided for it, so it is a small inline SVG.

## AI note

I used Claude Code to measure the assets, write the code and tests, and drive Playwright for visual checks.

One example where the output was wrong: the first scaling code was only tested at phone sizes. When I opened the game on a wide screen, I noticed that the folds stopped short, the gut was missing on one side and obstacles were visible far ahead. The canvas had also grown to 6982x3928 px under browser zoom, which dropped the frame rate. We fixed it by extending the world to every screen edge with mirrored copies and capping the canvas resolution. Playing on a real iPad mini then showed that a first fix, a portrait column with empty sides, wasn't good enough, so the game now extends to every screen edge in both orientations.
