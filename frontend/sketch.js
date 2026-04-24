// drawing/tracing logic.
// the drawing page selects which stamp to load via the URL:
// - play.html?stamp=stamp1
// - play.html?stamp=stamp2

// default to stamp 1 so play.html with no "?stamp=" still works
// if "?stamp=" exists we overwrite it in preload()
let stampId = "stamp1";
let strokes = [];
let isComplete = false;

function preload() {
  const params = new URLSearchParams(window.location.search);
  stampId = params.get("stamp") || "stamp1";

  // load the stroke list for the chosen stamp
  strokes = loadJSON(`stamps/${stampId}.json`, function(data){
    strokes = data;
  });
}

function finishAndReturnHome() {
  isComplete = true;
  // returning to index.html clears the canvas for the next stamp
  setTimeout(() => {
    window.location.href = "index.html";
  }, 900);
}

let currentStrokeIndex = 0;
let userStroke = [];
let isDrawing = false;
let strokeStartedCorrectly = false;
let completedStrokes = [];


function setup() {
  createCanvas(500, 500);

  for (let i = 0; i < strokes.length; i++) {
    completedStrokes.push(false);
  }
}

function draw() {
  background(245);

  //update later for change shape based on stamp
  // push();
  // noFill();
  // stroke(0);
  // strokeWeight(10);
  // stroke(184, 44, 39);
  // circle(250, 250, 480);
  // pop();

  drawCompletedStrokes();

  if (!isComplete && currentStrokeIndex < strokes.length) {
    drawCurrentGuide(strokes[currentStrokeIndex]);
  }

  drawUserStroke();

  if (isComplete) {
    push();
    noStroke();
    fill(0, 0, 0, 180);
    rect(0, 0, width, height);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(22);
    text("Done! Returning…", width / 2, height / 2);
    pop();
  }
}

function drawCompletedStrokes() {
  for (let i = 0; i < currentStrokeIndex; i++) {
    drawStrokePath(strokes[i], color(184, 44, 39), 12, false);
  }
}


//YELLOW GUIDE + START/END POINTS
function drawCurrentGuide(strokeObj) {
  // guide path
  drawStrokePath(strokeObj, color(255, 204, 0, 180), strokeObj.tolerance * 2, false);
  drawStrokePath(strokeObj, color(184, 44, 39), 3, false);

  // start point
  let start = strokeObj.points[0];
  let end = strokeObj.points[strokeObj.points.length - 1];

  push();
  noStroke();

  fill(0, 200, 0);
  circle(start.x, start.y, 16);
  textSize(15);
  fill(0);
  text('S', start.x -4, start.y - 15);

  fill(200, 0, 0);
  circle(end.x, end.y, 16);
  textSize(15);
  fill(0);
  text('E', end.x - 4, end.y - 15);
  pop();

}

//the ACTUAL line
function drawStrokePath(strokeObj, strokeCol, strokeWeightValue, showPoints = false) {
  push();
  noFill();
  stroke(strokeCol);
  strokeWeight(strokeWeightValue);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  beginShape();
  for (let pt of strokeObj.points) {
    vertex(pt.x, pt.y);
  }
  endShape();

  if (showPoints) {
    fill(0);
    noStroke();
    for (let pt of strokeObj.points) {
      circle(pt.x, pt.y, 6);
    }
  }
  pop();
}

function drawUserStroke() {
  if (userStroke.length < 2) return;

  push();
  noFill();
  stroke(184, 44, 39);
  strokeWeight(8);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  beginShape();
  for (let pt of userStroke) {
    vertex(pt.x, pt.y);
  }
  endShape();
  pop();
}

function mousePressed() {
  if (currentStrokeIndex >= strokes.length) return;

  // coordinate capture helper for finding points to trace for each stroke 
  console.log(`{ x: ${mouseX}, y: ${mouseY} },`);
  push();
  fill(255, 0, 0);
  noStroke();
  circle(mouseX, mouseY, 6);
  pop();

  let currentStroke = strokes[currentStrokeIndex];
  let start = currentStroke.points[0];

  let d = dist(mouseX, mouseY, start.x, start.y);

  if (d <= currentStroke.startTolerance) {
    isDrawing = true;
    strokeStartedCorrectly = true;
    userStroke = [{ x: mouseX, y: mouseY }];
  } else {
    isDrawing = false;
    strokeStartedCorrectly = false;
    userStroke = [];
  }
}

function mouseDragged() {
  if (!isDrawing || currentStrokeIndex >= strokes.length) return;

  let currentStroke = strokes[currentStrokeIndex];

  if (pointNearStroke(mouseX, mouseY, currentStroke.points, currentStroke.tolerance)) {
    userStroke.push({ x: mouseX, y: mouseY });
  } else {
    //feedback here or allow to go outside??
   // userStroke.push({ x: mouseX, y: mouseY });
  }
}

function mouseReleased() {
  if (!isDrawing || currentStrokeIndex >= strokes.length) return;

  isDrawing = false;

  let currentStroke = strokes[currentStrokeIndex];
  let result = validateStroke(userStroke, currentStroke);

  if (result.success) {
    completedStrokes[currentStrokeIndex] = true;
    currentStrokeIndex++;
    userStroke = [];

    if (currentStrokeIndex >= strokes.length) {
      finishAndReturnHome();
    }
  } else {
    userStroke = [];
  }
}

function validateStroke(userPts, strokeObj) {
  if (userPts.length < 2) {
    return {
      success: false,
    };
  }

  let start = strokeObj.points[0];
  let end = strokeObj.points[strokeObj.points.length - 1];
  let userStart = userPts[0];
  let userEnd = userPts[userPts.length - 1];

  let goodStart = dist(userStart.x, userStart.y, start.x, start.y) <= strokeObj.startTolerance;
  let goodEnd = dist(userEnd.x, userEnd.y, end.x, end.y) <= strokeObj.endTolerance;

  let coverageData = getStrokeCoverage(userPts, strokeObj.points, strokeObj.tolerance);
  let coverage = coverageData.coverage;

  let directionGood = checkDirection(userPts, strokeObj.points);

  if (!goodStart) {
    return {
      success: false,
    };
  }

  if (coverage < 0.65) {
    return {
      success: false,
    };
  }

  if (!directionGood) {
    return {
      success: false,
    };
  }

  if (!goodEnd) {
    return {
    };
  }

  return {
    success: true,
  };
}

function pointNearStroke(px, py, strokePoints, tolerance) {
  for (let pt of strokePoints) {
    if (dist(px, py, pt.x, pt.y) <= tolerance) {
      return true;
    }
  }
  return false;
}

function getStrokeCoverage(userPts, targetPts, tolerance) {
  let covered = new Array(targetPts.length).fill(false);

  for (let i = 0; i < targetPts.length; i++) {
    for (let userPt of userPts) {
      if (dist(userPt.x, userPt.y, targetPts[i].x, targetPts[i].y) <= tolerance) {
        covered[i] = true;
        break;
      }
    }
  }

  let coveredCount = covered.filter(Boolean).length;
  return {
    covered,
    coverage: coveredCount / targetPts.length
  };
}

function checkDirection(userPts, targetPts) {
  if (userPts.length < 2 || targetPts.length < 2) return true;

  let userStart = userPts[0];
  let userEnd = userPts[userPts.length - 1];
  let targetStart = targetPts[0];
  let targetEnd = targetPts[targetPts.length - 1];

  let userVec = createVector(userEnd.x - userStart.x, userEnd.y - userStart.y);
  let targetVec = createVector(targetEnd.x - targetStart.x, targetEnd.y - targetStart.y);

  if (userVec.mag() === 0 || targetVec.mag() === 0) return false;

  userVec.normalize();
  targetVec.normalize();

  let dotProduct = userVec.dot(targetVec);

  // closer to 1 = same direction, closer to -1 = opposite direction
  return dotProduct > 0.3;
}


// function keyPressed() {
//   if (key === 'r' || key === 'R') {
//     resetCurrentStroke();
//   }
// }

// function resetCurrentStroke() {
//   userStroke = [];
//   isDrawing = false;
// }