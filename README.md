# We The Folks take-home: rich media ads

Status: **work in progress.** Variant A has a playable game core, without endcards, sound or animation. Variant B is a static layout.

## Run locally

```sh
npm install
npm run dev:b    # Variant B, then open /preview.html
```

Use `npm run dev:a` for Variant A. Add `?debug=1` to its URL to see the hitboxes.

## Other commands

| Command | Purpose |
|---|---|
| `npm test` | Run the game rules tests, including a bot that plays the whole level |
| `npm run build` | Build both variants into `variant-*/dist` |
| `npm run budget` | Measure each built ad against the 3 MB limit (build first) |
| `npm run assets:report` | Regenerate `docs/ASSETS.md` (needs `ffprobe`) |
| `npm run assets:slices` | Regenerate the Variant B backgrounds |

## Documents

- [DECISIONS.md](DECISIONS.md): decision log
- [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md): acceptance checklist
- [docs/ASSETS.md](docs/ASSETS.md): asset inventory
- [docs/BUDGET.md](docs/BUDGET.md): weight budget

## Known issues

- Variant B: the top headline wording differs from `layout.png`, and the product is baked into the backgrounds, so it can't slide in independently. See [DECISIONS.md](DECISIONS.md).
- Variant A: the provided gesture asset says "tab to run" instead of "tap to run".
- Variant A: the end of a run shows a temporary label until the endcards exist, and a paused game shows no hint that a tap resumes it.
- Variant A needs a server, because it reads image alpha for collisions and uses ES modules. It won't start from `file://`.
- Tested in Chromium on desktop only. Safari, Firefox and real phones are still to do.
