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

- Test on real phones and in Safari, especially audio, toolbars and the very wide `gameplay.png`.
- Listen to the audio and balance the levels, and have people play it to tune the difficulty.
- A/B test a version of the game with characters only. The bacteria seem more fun than the vertical words.
- Ask for the product as a separate layer, so it could slide in from outside the fireplace.
- Trim the 15-second applause, which is the heaviest single file in the game.

## Known issues and shortcuts

- **Tested mostly in Chromium**, on desktop and with emulated phones. The game was also checked in WebKit, on an iPad mini simulator and briefly on real devices. See the end of the [acceptance checklist](docs/ACCEPTANCE.md).- **Nobody has listened to the audio.** It was checked by inspecting the audio state, so the balance and the loop point are unverified.
- **Fireplace:** the top headline wording differs from `layout.png`, because I used the provided asset. The top banner's moss also differs, because it has to line up with the sides.
- **Fireplace:** the product is baked into the backgrounds, so it arrives from nearby rather than from outside the part.
- **Fireplace:** the 4 px gap between the parts is an assumption from `layout.png` and the width of `bg-big.jpg`.
- **Game:** the provided gesture asset says "tab to run" instead of "tap to run".
- **Game:** it needs a server, because it reads image alpha for collisions and uses ES modules. It won't start from `file://`.
- **Game:** on wide screens the player sees obstacles much earlier, so the game is easier there.
- **Mute toggle:** there is no provided asset for it, so it is a small inline SVG.

## AI note

I used Claude Code to measure the assets, write the code and tests, and drive Playwright for visual checks.

One example where the output was wrong: the first scaling code was only tested at phone sizes. When I opened the game on a wide screen, I noticed that the folds stopped short, the gut was missing on one side and obstacles were visible far ahead. The canvas had also grown to 6982x3928 px under browser zoom, which dropped the frame rate. We fixed it by extending the world to every screen edge with mirrored copies and capping the canvas resolution. Playing on a real iPad mini then showed that a first fix, a portrait column with empty sides, wasn't good enough, so the game now extends to every screen edge in both orientations.
