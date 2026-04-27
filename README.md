# Chinese Stamps (AR + practice page)

## What this project is

- **`scanner/`** — A web AR experience built with **8th Wall**. When the camera recognizes a **trained image target** (a picture of the seal), the app can **redirect the browser** to a practice page.
- **`frontend/`** — A **p5.js** “tracing” app. The user practices drawing each stroke, guided by the JSON data for the chosen stamp.

## How a scan flows end-to-end

1. The user opens the **scanner** in the phone browser 
2. 8th Wall looks for the images described in `scanner/src/app.js` under `imageTargetData` (each entry is a JSON file in `scanner/image-targets/`, e.g. `stamp1.json`).
3. When the right paper stamp is in view, the **“Redirect on Image Target Found”** behavior in the 8th Wall scene runs. It sends the user to the URL in `scanner/src/.expanse.json` for that target — e.g. `/frontend/play.html?stamp=stamp1` (served as static files next to the scanner build; webpack copies `frontend/` into `dist/frontend/`).
4. The **frontend** page reads `?stamp=…` and loads `frontend/stamps/<stampId>.json` to show the right stroke order and guides.

## Build the scanner (local)

```bash
cd scanner
npm install
npm run build
```

The output is in `scanner/dist/`. The tracing UI is included at `dist/frontend/`.
