# We The Folks take-home: rich media ads

Status: **stage 1, project setup and validation.** There is no game or animation yet. Variant A is a static placeholder and Variant B is a static layout.

## Run locally

```sh
npm install
npm run dev:b    # Variant B, then open /preview.html
```

Use `npm run dev:a` for Variant A.

## Other commands

| Command | Purpose |
|---|---|
| `npm run build` | Build both variants into `variant-*/dist` |
| `npm run budget` | Measure the built creatives against the 3 MB limit (build first) |
| `npm run assets:report` | Regenerate `docs/ASSETS.md` (needs `ffprobe`) |
| `npm run assets:slices` | Regenerate the Variant B backgrounds |

## Documents

- [DECISIONS.md](DECISIONS.md): decision log
- [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md): acceptance checklist
- [docs/ASSETS.md](docs/ASSETS.md): asset inventory
- [docs/BUDGET.md](docs/BUDGET.md): weight budget

## Known issues

- Variant B top headline wording differs from `layout.png`, and the product is baked into the backgrounds. Both are waiting on an answer from the recruiter.
- Tested in Chromium on desktop only. Safari, Firefox and real phones are still to do.
