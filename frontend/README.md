# Frontend (p5.js tracing)

Practice tracing stamp strokes in the browser. For the full project (AR scanner + this page), see **[README in the repository root](../README.md)**.

## How this folder works

- `index.html` — **home page**: contextual intro + horizontally pannable “scroll roadmap” with clickable seal hotspots linking to tracing pages (see below).
- `play.html` — loads p5.js and `sketch.js`.
- `sketch.js` — reads `?stamp=` and loads `stamps/<stampId>.json` for guides and validation.
- `stamps/*.json` — stroke paths and tolerances for each stamp in the *drawing* app.

**Note:** Having `stamp1.json` … `stamp5.json` here only enables those practice pages. The **AR scanner** must be configured separately (image targets + redirects) for each *physical* stamp you want to recognize. See the root README.

## Home page (`index.html`): how it works

The home page is framed around Zhao Mengfu’s *Autumn Colors on the Que and Hua Mountains* (title block + subtitle). Below that sits a wide **horizontal handscroll roadmap**: `images/scroll.jpg` sits inside a **viewport** (`overflow-x: auto`, `overflow-y: hidden`) so users pan along the painting’s length rather than resizing the whole page.

**Right-to-left reading:** East Asian handscrolls are often read beginning at the **right**. On load (after the image has dimensions), a small script sets `scrollLeft` to the **maximum** value so you start at the **right edge**—you then move left as you drag, swipe on touch, use the scrollbar, or use the overlay controls below.

**Smooth motion:** CSS `scroll-behavior: smooth` applies to programmatic scrolls (and helps some browsers treat scrolls uniformly). Arrow buttons pan with `scrollBy({ behavior: 'smooth' })`; amount is roughly 60% of the viewport width (minimum ~160px).

**Edge hints:** Left and right overlays (`scroll-hint`) show ‹ and › only when there is room to scroll that way (`syncHints()` toggles `hint-left` / `hint-right` on the shell based on `scrollLeft` vs ends). Clicking tap targets calls the same pan logic as keyboard **ArrowLeft** / **ArrowRight** (prevent default so the page doesn’t scroll vertically).

**Hotspots:** Numbered circles are absolutely positioned **`a.stamp-hotspot`** elements with percentages (`--hx`, `--hy`) on the track overlaying the image. Labels (1–5) are cosmetic; **`href`** maps each seal to `play.html?stamp=stamp1` … `stamp5` (IDs need not match the visible number—check `href` in markup).

**Accessibility & layout:** Hotspots support focus-visible outlines; hints use `role="button"`, tabindex, and Enter/Space. The roadmap block uses `clamp()` heights so it scales between phone and desktop; `scrollbar-color` tweaks the scrollbar to match the warm palette.

**Top bar:** “Home”, text size (**A− / A / A+**—shared with other pages via `style.css`), and **Camera** — link **`/`** so the scanner is whatever your host serves at the site root (for local `scanner` dev/build, serve **`scanner/dist`** so `/` loads the XR page).

---

## Presentation script: home page (slide-by-slide)

Use this as spoken notes when demoing **`index.html`**. Timing is approximate; trim to your slot.

**Slide 1 — Topic**  
“Today’s home screen isn’t generic navigation—it’s tied to **Autumn Colors on the Que and Hua Mountains**. We foreground the artwork and invite people to explore it as a spatial journey: left and right scroll, exactly like moving along a physical handscroll.”

**Slide 2 — Goal**  
“The goal was **orientation plus entry points**: viewers see the composition at a glance, understand they’re moving along a long horizontal image, and can jump straight into **hands-on tracing** for each numbered seal.”

**Slide 3 — Layout stack**  
“Structurally we have three layers for the roadmap: an outer **fixed-height frame**, an **scrollable viewport** in the middle, and an inner **track** that’s exactly as wide as the bitmap. The seals aren’t burned into the image—they’re overlay links so targets stay clickable and configurable.”

**Slide 4 — Right-to-left start**  
“Handscroll convention matters: **we anchor the scrollbar at the far right on load.** That mirrors starting at the opening of the scroll from a traditional viewing direction—but implemented with standard `scrollLeft` math so every browser behaves the same: `max = scrollWidth − clientWidth`.”

**Slide 5 — Input & UX**  
“People can drag the bar, swipe on touch, tap the ‹ › fades at the edges, or use arrow keys—all calling the same **`panBy`** step with smooth scrolling. Tiny edge thresholds hide a hint once you’ve reached the end so the UI stays quiet unless there’s somewhere to go.”

**Slide 6 — Hotspots → product**  
“Each glowing number is really a link to **`play.html?stamp=…`**. Placement is percentage-based (`--hx` / `--hy`), so resizing the roadmap keeps seals aligned with the painting. Behind that URL is **p5.js** and stamp-specific JSON—we’ll cover that when we demo the tracer.”

**Slide 7 — Polish & access**  
“We aligned typography with Typekit fonts, reused global **text size** controls from `style.css`, and added keyboard support and focus outlines on hotspots so lecture hall demos and WCAG-ish habits both work. The takeaway: **museum metaphor in the UX, pragmatic web APIs under the hood**—nothing exotic, just scroll position, overlays, and one image.”
