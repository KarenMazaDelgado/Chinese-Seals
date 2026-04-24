# Painting-Stamp / musesumStudies

Practice tracing stamp strokes in the browser. Pick a stamp from the home page, trace each guided stroke in order, and you’ll be returned to the home page when the stamp is complete.


## How it works

- `index.html` is a simple menu with links:
  - `play.html?stamp=stamp1`
  - `play.html?stamp=stamp2`
- `play.html` loads p5.js and runs `sketch.js`.
- `sketch.js` loads the correct JSON from `stamps/<stamp>.json` based on the `?stamp=` URL parameter and runs the tracing/validation logic:
  - Yellow guide path + green start dot + red end dot
  - Draws your stroke as you drag
  - Validates start/end + coverage + direction
  - When all strokes are completed, shows “Done!” briefly then redirects back to `index.html` (clears the canvas for the next stamp)

## Project structure

```
musesumStudies/
  index.html               # Home/menu (choose stamp)
  play.html                # Drawing page (runs the sketch)
  sketch.js                # p5 sketch + tracing/validation logic
  style.css                # Minimal styling

  stamps/
    stamp1.json            # Stroke data for stamp 1
    stamp2.json            # Stroke data for stamp 2
  stamp2.json              # Legacy copy (source data for stamp 2)
```
