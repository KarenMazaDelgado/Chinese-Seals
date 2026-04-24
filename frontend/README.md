# Frontend (p5.js tracing)

Practice tracing stamp strokes in the browser. For the full project (AR scanner + this page), see **[README in the repository root](../README.md)**.

## How this folder works

- `index.html` — menu with links like `play.html?stamp=stamp1`.
- `play.html` — loads p5.js and `sketch.js`.
- `sketch.js` — reads `?stamp=` and loads `stamps/<stampId>.json` for guides and validation.
- `stamps/*.json` — stroke paths and tolerances for each stamp in the *drawing* app.

**Note:** Having `stamp1.json` … `stamp5.json` here only enables those practice pages. The **AR scanner** must be configured separately (image targets + redirects) for each *physical* stamp you want to recognize. See the root README.
