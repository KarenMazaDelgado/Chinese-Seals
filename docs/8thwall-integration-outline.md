# 8th Wall Integration (Project Outline)


We integrated 8th Wall WebAR by hosting their WebAR runtime scripts alongside our site and configuring a set of trained image targets. When the user opens the scanner page on a phone, 8th Wall handles camera access and recognizes which stamp image is in view. When a stamp target is detected, our redirect component runs and sends the user to a normal webpage that shows the matching stamp’s information and the tracing tool. So 8th Wall is the camera + recognition layer, and everything after the redirect is standard HTML/CSS/JavaScript.


---

## What 8th Wall does in this project (plain language)

- **Shows the camera** in the mobile browser
- **Detects an image target** (a printed seal image) using pre‑trained target data
- **Triggers an event** when that target is found
- **Runs a behavior** (our redirect component) that sends the user to the correct page for that seal

Everything after that redirect (the “learn” page + tracing tool) is just a normal web app.

---

## High‑level architecture

- **`scanner/`**: 8th Wall “scanner” experience (camera + image recognition)
- **`frontend/`**: regular website pages (home roadmap, info pages, p5 tracing tool)

During build, the scanner output is packaged so both live under one deployed site:

- Deployed site root → AR scanner (`/`)
- Deployed `frontend/` pages → regular pages (`/frontend/index.html`, `/frontend/play.html?...`, `/frontend/learn/...`)

---

## Key files (where the integration lives)

### 1) Scanner HTML loads the 8th Wall runtime

- **`scanner/src/index.html`**
  - Includes the runtime scripts:
    - `./external/runtime/runtime.js`
    - `./external/xr/xr.js` (with `data-preload-chunks="slam"` for world/image-target features)
  - Loads the compiled app bundle:
    - `bundle.js`

### 2) Configure image targets

- **`scanner/src/app.js`**
  - Calls `XR8.XrController.configure({ imageTargetData: [...] })`
  - Each entry points to a JSON file under `scanner/image-targets/…`

This is where we tell 8th Wall which images it should try to recognize.

### 3) Scene / behaviors (what happens when a target is found)

- **`scanner/src/.expanse.json`**
  - Defines scene entities and components, including multiple:
    - **“Redirect on Image Target Found”** components
  - For each target name (e.g. `stamp1`), a redirect URL is configured (e.g. `/frontend/play.html?stamp=stamp1`)

- **`scanner/src/museum-stamps/redirect-on-imagefound.ts`**
  - Implements the redirect behavior that runs when the image target is detected

### 4) Build packaging: putting everything in one deployable folder

- **`scanner/config/webpack.config.js`**
  - Builds the scanner into **`scanner/dist/`**
  - Copies these folders into the dist output:
    - `scanner/external/` (8th Wall runtime files used by the page)
    - `scanner/src/assets/`
    - `scanner/image-targets/`
    - `frontend/` → copied into `dist/frontend/`

That copy step is what makes the redirect to `/frontend/...` work on the deployed site.

---

## Creating image targets from the terminal (8th Wall CLI)

Image targets are produced with **8th Wall’s official image-target generator**, which outputs the JSON metadata plus the processed PNGs the offline engine loads at runtime.

### Tool and prerequisites

- **Package:** [`@8thwall/image-target-cli`](https://www.npmjs.com/package/@8thwall/image-target-cli) (open-source; see also the [repo README](https://github.com/8thwall/8thwall/blob/main/apps/image-target-cli/README.md)).
- **Prerequisites:** [Node.js](https://nodejs.org/) (LTS is fine) so you can run `npx`.
- **Input:** one **raster image file** path (for example `.png` or `.jpg`). The CLI must read a **single file**, not a folder. If you paste a directory path, the tool will fail with an unsupported-image (or similar) error.

### Command (interactive)

From any directory:

```bash
npx @8thwall/image-target-cli@latest
```

The CLI walks you through:

1. **Path to the source image** (absolute or relative path to that one file).
2. **Geometry** — for flat prints/stickers/seals, choose **flat** (planar). Cylinder/cone are for wrapped labels.
3. **Crop** — default centered crop or custom offsets/size (see the upstream README diagrams).
4. **Output folder / target name** — this becomes the target’s logical name and folder prefix (in this project we use names like `stamp3` or `stamp3irl`).

On success it writes a **folder** containing at least:

- `<name>.json` — metadata (`name`, `type`, `properties`, `resources`, …)
- `<name>_original.png`, `<name>_cropped.png`, `<name>_thumbnail.png`, `<name>_luminance.png`  
  (plus extra geometry images if you chose non‑planar types.)

### Where to put generated files in this repo

1. Place the **entire output folder** under:

   `scanner/image-targets/<targetName>/`

   Example: `scanner/image-targets/stamp2irl/stamp2irl.json` plus all `stamp2irl_*.png` files **in that same directory**.

2. **Path convention inside `<name>.json`:** the runtime resolves assets relative to the site root (your built `scanner/dist/`). In this project, working targets follow the same pattern as `stamp1`:

   - **`imagePath`:** `image-targets/<name>/<name>_luminance.png`
   - **`resources` values:** `<name>/<name>_original.png`, `<name>/<name>_cropped.png`, etc.

   If the generated JSON uses **flat** paths (for example `image-targets/stamp2irl_luminance.png` without the `stamp2irl/` segment), tracking can silently fail—**edit the JSON** so it matches the nested layout above before you ship.

### Wiring a new target into the scanner

After the folder lives under `scanner/image-targets/` and the JSON paths are correct:

1. **`scanner/src/app.js`** — add a `require('../image-targets/<name>/<name>.json')` entry to the `imageTargetData` array (order only affects load order, not matching).
2. **`scanner/src/.expanse.json`** — add a **“Redirect on Image Target Found”** (or duplicate an existing block) whose **`imageTargetName`** exactly matches the `"name"` field inside that JSON, and set **`redirectUrl`** (e.g. `/frontend/play.html?stamp=stamp2` for both `stamp2` and `stamp2irl` if they should open the same tracing page).
3. **Rebuild:** from `scanner/`, run `npm run build` and deploy **`scanner/dist/`** again.

### Practical requirements for the **source** image and the **print**

These are rules of thumb for reliable recognition (see also [8th Wall image target documentation](https://www.8thwall.com/docs/guides/image-targets)):

- **Sharp, well‑lit source photo or export** — avoid heavy blur, JPEG blocking, or extreme compression on the artwork you feed the CLI.
- **Contrast and detail** — seals with strokes and ink variation usually track better than large flat color fields.
- **Train on what users scan** — the camera compares the live view to the **trained** image. A target trained on a glossy screen photo may track worse on matte paper (and vice versa). When possible, train from a high‑quality crop of the **same** art that will be printed.
- **Physical print quality** — even lighting, no glare, fill the frame reasonably, and avoid extreme skew helps the matcher.

## The end‑to‑end flow (what happens on a phone)

1. User opens the deployed site root (the scanner page).
2. The page loads 8th Wall runtime scripts and our `bundle.js`.
3. Our code configures the image targets via `XR8.XrController.configure(...)`.
4. 8th Wall requests **camera permission** (browser prompt).
5. When the camera sees a seal that matches one of the trained targets:
   - 8th Wall fires an “image found” event for that target name.
   - The “Redirect on Image Target Found” behavior runs.
6. The browser navigates to the matching URL, e.g.:
   - `/frontend/play.html?stamp=stamp3`
7. The tracing page reads the `stamp` query parameter and loads the correct stamp data/content.


