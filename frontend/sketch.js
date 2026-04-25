// drawing/tracing logic.
// the drawing page selects which stamp to load via the URL:
// - play.html?stamp=stamp1
// - play.html?stamp=stamp2

// default to stamp 1 so play.html with no "?stamp=" still works
// if "?stamp=" exists we overwrite it in preload()

let stampId = "stamp1";
let strokes = [];
let isComplete = false;

let paperImg;

function preload() {
  paperImg = loadImage('bkgd.png');
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
  let cnv = createCanvas(500, 500);
  cnv.parent('canvasWrap');

  for (let i = 0; i < strokes.length; i++) {
    completedStrokes.push(false);
  }

  let sealNameEl = document.getElementById('sealName');
  if (sealNameEl) {
    if (stampId === 'stamp1') {
      sealNameEl.innerText = '古希天子"Gu Xi TianZi"';
    } else if (stampId === 'stamp2') {
      sealNameEl.innerText = '欧阳玄印 "Ouyang Xuan Yin"';
    } else if (stampId === 'stamp3') {
      sealNameEl.innerText = '赵氏子昂 "Zhao Clan Zi\'ang"';
    } else if (stampId === 'stamp4') {
      sealNameEl.innerText = '子京珍秘 "Zi Jing Zhen Mi"';
    } else if (stampId === 'stamp5') {
      sealNameEl.innerText = '石渠宝笈 "Shiqu Baoji"';
    }
  }
}

function draw() {
  background(paperImg);

  // change shape based on stamp
  if (stampId === 'stamp1'){
  push();
  noFill();
  strokeWeight(10);
  stroke(184, 44, 39);
  circle(250, 250, 480);
  pop();
  }else if (stampId === 'stamp2' || stampId === 'stamp3'){
    push();
    noFill();
    strokeWeight(10);
    stroke(184, 44, 39);
    rect(20,20,460,460,50);
    pop();

  }else if (stampId === 'stamp4' || stampId === 'stamp5'){
    push();
    noFill();
    strokeWeight(10);
    stroke(184, 44, 39);
    rect(50,15,400,470,50);
    pop();
  }
  

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
  drawStrokePath(strokeObj, color(242, 247, 168, 100), strokeObj.tolerance * 2, false);
  drawStrokePath(strokeObj, color(184, 44, 39,220), 3, false);

  // start point
  let start = strokeObj.points[0];
  let end = strokeObj.points[strokeObj.points.length - 1];

  push();
  noStroke();

  fill(106, 158, 110);
  circle(start.x, start.y, 16);
  textSize(15);
  fill(0);

  fill(255);
  strokeWeight(3);
  stroke(200,0,0);
  circle(end.x, end.y, 14);
  textSize(15);
  fill(0);
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
  //console.log(`{ x: ${mouseX}, y: ${mouseY} },`);
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
   userStroke.push({ x: mouseX, y: mouseY });
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

//UPDATED TOUCH

function touchStarted() {
  if (currentStrokeIndex >= strokes.length) return;
  if (touches.length === 0) return;

  let touch = touches[0];
  let touchX = touch.x;
  let touchY = touch.y;

  if (touchX < 0 || touchX > width || touchY < 0 || touchY > height) {
    return; 
  }

  let currentStroke = strokes[currentStrokeIndex];
  let start = currentStroke.points[0];

  let d = dist(touchX, touchY, start.x, start.y);

  if (d <= currentStroke.startTolerance) {
    isDrawing = true;
    strokeStartedCorrectly = true;
    userStroke = [{ x: touchX, y: touchY }];
  } else {
    isDrawing = false;
    strokeStartedCorrectly = false;
    userStroke = [];
  }

  return false; 
}

function touchMoved() {
  if (!isDrawing || currentStrokeIndex >= strokes.length) return;
  if (touches.length === 0) return;

  let touch = touches[0];
  let touchX = touch.x;
  let touchY = touch.y;

  if (touchX < 0 || touchX > width || touchY < 0 || touchY > height) {
    return;
  }

  let currentStroke = strokes[currentStrokeIndex];

  if (pointNearStroke(touchX, touchY, currentStroke.points, currentStroke.tolerance)) {
    userStroke.push({ x: touchX, y: touchY });
  }

  return false; 
}

function touchEnded() {
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

  return false; 
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