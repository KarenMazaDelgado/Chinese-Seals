# Chinese Stamps (AR + practice page)

## What this project is

- **`scanner/`** — A web AR experience built with **8th Wall**. When the camera recognizes a **trained image target** (a picture of a real stamp you printed), the app can **redirect the browser** to a practice page.
- **`frontend/`** — A small **p5.js** “tracing” app: the user practices drawing each stroke, guided by the JSON data for the chosen stamp.

## How a scan flows end-to-end

1. The user opens the **scanner** in the phone browser (served from your `scanner/dist` build over HTTPS, as 8th Wall requires).
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

**Paths after deploy:** If the site is not at the domain root, you must use the same path prefix in the 8th Wall **redirect** as in your hosting (e.g. `/my-app/frontend/play.html?stamp=stamp1`).

## Adding more stamp *images* in AR (so each physical stamp is recognized)

You need a **separate 8th Wall image target** per distinct printed image. **One JSON file in `app.js` is not enough** if you have five different real stamps: each one needs to be **trained** on a photo and referenced by name.

1. **Create** a new target with the [Image Target CLI](https://github.com/8thwall/8thwall/blob/main/apps/image-target-cli/README.md) (or 8th Wall Studio) from a good photo of that stamp. That produces a JSON (and images) you place under `scanner/image-targets/`, similar to `stamp1.json` and the `guxi_converted_*.png` files used for stamp1.
2. In **`scanner/src/app.js`**, add another line in `imageTargetData`, e.g. `require('../image-targets/stamp2.json')`, for every target the app should track.
3. In **`scanner/src/.expanse.json`**, the scene must have one **“Redirect on Image Target Found”** (or instance of that prefab) **per** target: set **`imageTargetName`** to the **name inside that JSON** (e.g. `stamp2`) and **`redirectUrl`** to e.g. `/frontend/play.html?stamp=stamp2`. Duplicating the existing “Stamp Redirect” instance in the 8th Wall **Studio** editor is the usual way to do this; then pull changes back if you work from disk.

**Why only one stamp “worked” before:** the AR side only had **one** image target (stamp1) wired in the build and a matching redirect. The **frontend** already supports multiple `stamps/stamp1.json` … `stamp5.json` for the drawing exercise, but the **camera** will only open the right page for stamps you actually **trained, registered, and added** as above.

## Tracing data (p5) vs AR targets

- **Tracing (frontend):** add or edit `frontend/stamps/stamp2.json` etc. for how the on-screen practice works.
- **AR (scanner):** add the matching **image target** + redirect so scanning that *physical* print sends `?stamp=stamp2` (or the id you choose).

## Removed demo assets

The default 8th Wall **sample** image targets (elements, bmo, toggle-slam, waves) were removed from `scanner/image-targets/` and from `app.js` because this project only uses the **stamp1** target file set. The scene file (`.expanse.json`) may still list older template objects from the original sample; the active entry experience is the **Magic Photos** space. You can clean unused spaces in **8th Wall Studio** if you want a smaller scene.
