// Rube Goldberg Machine Game
// Noor-Eddin Mohamed
// January 19 2026

// matter.js aliases
const { Engine, Runner, Bodies, Composite, Query, Vector } = Matter;

// matter.js variables
let engine;
let world;
let runner;

// state variables
const MODE_EDITOR = "editor";
const MODE_LEVEL  = "level";
const MODE_MENU = "menu";
let gameMode = MODE_MENU;
let currentLevel = null;        // holds the JSON of the level being played
let currentLevelRules;
let simulationRunning = false; 

let contraptionCounts = {};


// 2d array variables
let theGrid;
const GRID_COLS = 16;
const GRID_ROWS = 9;
let cellSize;
let rows;
let cols;
let gridOffsetX;
let gridOffsetY;
let lastPlaced;

let wallArray = [];
let ballArray = [];
let contrArray = [];
let goalArray = [];

let setting = "block";

let sTramp;
let sConveyor;
let sFan;
let sGoal;
let anyConveyorTouching = false;

// level data
const LEVEL_1 = {
  ballSpawns: [
    { 
      col: 1, 
      row: 0 
    }
  ],
  walls: [
    {
      "type": "ramp",
      "col": 1,
      "row": 1,
      "angleIndex": 1
    },
    {
      "type": "ramp",
      "col": 2,
      "row": 2,
      "angleIndex": 1
    },
    {
      "type": "block",
      "col": 3,
      "row": 3,
      "angle": 0
    },
    {
      "type": "block",
      "col": 4,
      "row": 3,
      "angle": 0
    },
    {
      "type": "block",
      "col": 5,
      "row": 3,
      "angle": 0
    },
    {
      "type": "ramp",
      "col": 6,
      "row": 3,
      "angleIndex": 1
    },
    {
      "type": "ramp",
      "col": 7,
      "row": 4,
      "angleIndex": 1
    },
    {
      "type": "block",
      "col": 8,
      "row": 5,
      "angle": 0
    },
    {
      "type": "block",
      "col": 9,
      "row": 5,
      "angle": 0
    },
    {
      "type": "ramp",
      "col": 10,
      "row": 5,
      "angleIndex": 1
    },
    {
      "type": "block",
      "col": 7,
      "row": 5,
      "angle": 0
    },
    {
      "type": "block",
      "col": 6,
      "row": 5,
      "angle": 0
    },
    {
      "type": "block",
      "col": 6,
      "row": 4,
      "angle": 0
    },
    {
      "type": "block",
      "col": 5,
      "row": 4,
      "angle": 0
    },
    {
      "type": "block",
      "col": 5,
      "row": 5,
      "angle": 0
    },
    {
      "type": "block",
      "col": 4,
      "row": 5,
      "angle": 0
    },
    {
      "type": "block",
      "col": 4,
      "row": 4,
      "angle": 0
    },
    {
      "type": "block",
      "col": 3,
      "row": 4,
      "angle": 0
    },
    {
      "type": "block",
      "col": 3,
      "row": 5,
      "angle": 0
    },
    {
      "type": "block",
      "col": 2,
      "row": 5,
      "angle": 0
    },
    {
      "type": "block",
      "col": 2,
      "row": 4,
      "angle": 0
    },
    {
      "type": "block",
      "col": 1,
      "row": 4,
      "angle": 0
    },
    {
      "type": "block",
      "col": 1,
      "row": 5,
      "angle": 0
    },
    {
      "type": "block",
      "col": 1,
      "row": 3,
      "angle": 0
    },
    {
      "type": "block",
      "col": 1,
      "row": 2,
      "angle": 0
    },
    {
      "type": "block",
      "col": 2,
      "row": 3,
      "angle": 0
    },
    {
      "type": "block",
      "col": 6,
      "row": 8,
      "angle": 0
    },
    {
      "type": "block",
      "col": 7,
      "row": 8,
      "angle": 0
    },
    {
      "type": "block",
      "col": 8,
      "row": 8,
      "angle": 0
    },
    {
      "type": "block",
      "col": 5,
      "row": 8,
      "angle": 0
    },
    {
      "type": "block",
      "col": 9,
      "row": 8,
      "angle": 0
    },
    {
      "type": "block",
      "col": 4,
      "row": 8,
      "angle": 0
    },
    {
      "type": "ramp",
      "col": 7,
      "row": 7,
      "angleIndex": 1
    },
    {
      "type": "ramp",
      "col": 6,
      "row": 7,
      "angleIndex": 0
    }
  ],
  goals: [
    {
      "type": "goal",
      "col": 1,
      "row": 7
    }
  ],
  allowedContraptions: {
    trampoline: 2,
    fan: 0,
    conveyor: 0
  }
  
};

const LEVEL_2 = {
  ballSpawns: [
    { 
      col: 3, 
      row: 5 
    }
  ],
  walls: [
    {
      "type": "block",
      "col": 3,
      "row": 7,
      "angle": 0
    },
    {
      "type": "block",
      "col": 5,
      "row": 7,
      "angle": 0
    },
    {
      "type": "block",
      "col": 4,
      "row": 7,
      "angle": 0
    },
    {
      "type": "block",
      "col": 6,
      "row": 7,
      "angle": 0
    },
    {
      "type": "block",
      "col": 13,
      "row": 7,
      "angle": 0
    },
    {
      "type": "block",
      "col": 8,
      "row": 7,
      "angle": 0
    },
    {
      "type": "block",
      "col": 7,
      "row": 7,
      "angle": 0
    },
    {
      "type": "block",
      "col": 13,
      "row": 1,
      "angle": 0
    },
    {
      "type": "block",
      "col": 12,
      "row": 1,
      "angle": 0
    },
    {
      "type": "block",
      "col": 11,
      "row": 1,
      "angle": 0
    },
    {
      "type": "block",
      "col": 10,
      "row": 1,
      "angle": 0
    },
    {
      "type": "block",
      "col": 8,
      "row": 1,
      "angle": 0
    },
    {
      "type": "block",
      "col": 9,
      "row": 1,
      "angle": 0
    },
    {
      "type": "block",
      "col": 7,
      "row": 1,
      "angle": 0
    },
    {
      "type": "block",
      "col": 6,
      "row": 1,
      "angle": 0
    },
    {
      "type": "block",
      "col": 4,
      "row": 1,
      "angle": 0
    },
    {
      "type": "block",
      "col": 5,
      "row": 1,
      "angle": 0
    },
    {
      "type": "block",
      "col": 3,
      "row": 1,
      "angle": 0
    },
    {
      "type": "block",
      "col": 12,
      "row": 7,
      "angle": 0
    },
    {
      "type": "block",
      "col": 11,
      "row": 7,
      "angle": 0
    },
    {
      "type": "block",
      "col": 5,
      "row": 4,
      "angle": 0
    },
    {
      "type": "block",
      "col": 6,
      "row": 4,
      "angle": 0
    },
    {
      "type": "block",
      "col": 7,
      "row": 4,
      "angle": 0
    },
    {
      "type": "block",
      "col": 8,
      "row": 4,
      "angle": 0
    },
    {
      "type": "block",
      "col": 4,
      "row": 4,
      "angle": 0
    },
    {
      "type": "block",
      "col": 9,
      "row": 4,
      "angle": 0
    },
    {
      "type": "block",
      "col": 10,
      "row": 4,
      "angle": 0
    },
    {
      "type": "block",
      "col": 9,
      "row": 7,
      "angle": 0
    },
    {
      "type": "block",
      "col": 10,
      "row": 7,
      "angle": 0
    },
    {
      "type": "ramp",
      "col": 13,
      "row": 2,
      "angleIndex": 3
    },
    {
      "type": "block",
      "col": 14,
      "row": 1,
      "angle": 0
    },
    {
      "type": "block",
      "col": 14,
      "row": 2,
      "angle": 0
    },
    {
      "type": "block",
      "col": 14,
      "row": 3,
      "angle": 0
    },
    {
      "type": "block",
      "col": 14,
      "row": 4,
      "angle": 0
    },
    {
      "type": "block",
      "col": 14,
      "row": 6,
      "angle": 0
    },
    {
      "type": "block",
      "col": 14,
      "row": 5,
      "angle": 0
    },
    {
      "type": "block",
      "col": 14,
      "row": 7,
      "angle": 0
    },
    {
      "type": "ramp",
      "col": 13,
      "row": 6,
      "angleIndex": 0
    },
    {
      "type": "block",
      "col": 11,
      "row": 4,
      "angle": 0
    },
    {
      "type": "block",
      "col": 3,
      "row": 4,
      "angle": 0
    },
    {
      "type": "block",
      "col": 2,
      "row": 7,
      "angle": 0
    },
    {
      "type": "block",
      "col": 2,
      "row": 6,
      "angle": 0
    },
    {
      "type": "block",
      "col": 2,
      "row": 5,
      "angle": 0
    },
    {
      "type": "block",
      "col": 2,
      "row": 4,
      "angle": 0
    },
    {
      "type": "block",
      "col": 2,
      "row": 1,
      "angle": 0
    }
  ],
  "goals": [ 
    {
      "type": "goal",
      "col": 2,
      "row": 3
    },
    {
      "type": "goal",
      "col": 2,
      "row": 2
    }
  ],
  allowedContraptions: {
    trampoline: 2,
    fan: 0,
    conveyor: 6
  }

}

const LEVEL_3 = {
    ballSpawns: [
    { 
      col: 2, 
      row: 1 
    }
  ],
    walls: [
    {
      "type": "block",
      "col": 11,
      "row": 7,
      "angle": 0
    },
    {
      "type": "block",
      "col": 11,
      "row": 6,
      "angle": 0
    },
    {
      "type": "block",
      "col": 11,
      "row": 5,
      "angle": 0
    },
    {
      "type": "block",
      "col": 11,
      "row": 4,
      "angle": 0
    },
    {
      "type": "block",
      "col": 11,
      "row": 3,
      "angle": 0
    },
    {
      "type": "block",
      "col": 11,
      "row": 2,
      "angle": 0
    },
    {
      "type": "block",
      "col": 11,
      "row": 8,
      "angle": 0
    },
    {
      "type": "block",
      "col": 11,
      "row": 0,
      "angle": 0
    },
    {
      "type": "ramp",
      "col": 7,
      "row": 7,
      "angleIndex": 1
    },
    {
      "type": "block",
      "col": 8,
      "row": 8,
      "angle": 0
    },
    {
      "type": "ramp",
      "col": 6,
      "row": 6,
      "angleIndex": 1
    },
    {
      "type": "ramp",
      "col": 5,
      "row": 5,
      "angleIndex": 1
    },
    {
      "type": "ramp",
      "col": 4,
      "row": 4,
      "angleIndex": 1
    },
    {
      "type": "block",
      "col": 7,
      "row": 8,
      "angle": 0
    },
    {
      "type": "block",
      "col": 6,
      "row": 8,
      "angle": 0
    },
    {
      "type": "block",
      "col": 6,
      "row": 7,
      "angle": 0
    },
    {
      "type": "block",
      "col": 5,
      "row": 7,
      "angle": 0
    },
    {
      "type": "block",
      "col": 5,
      "row": 6,
      "angle": 0
    },
    {
      "type": "block",
      "col": 5,
      "row": 8,
      "angle": 0
    },
    {
      "type": "block",
      "col": 4,
      "row": 8,
      "angle": 0
    },
    {
      "type": "block",
      "col": 4,
      "row": 7,
      "angle": 0
    },
    {
      "type": "block",
      "col": 4,
      "row": 6,
      "angle": 0
    },
    {
      "type": "block",
      "col": 4,
      "row": 5,
      "angle": 0
    },
    {
      "type": "block",
      "col": 3,
      "row": 4,
      "angle": 0
    },
    {
      "type": "block",
      "col": 3,
      "row": 5,
      "angle": 0
    },
    {
      "type": "block",
      "col": 3,
      "row": 6,
      "angle": 0
    },
    {
      "type": "block",
      "col": 3,
      "row": 7,
      "angle": 0
    },
    {
      "type": "block",
      "col": 3,
      "row": 8,
      "angle": 0
    },
    {
      "type": "block",
      "col": 2,
      "row": 8,
      "angle": 0
    },
    {
      "type": "block",
      "col": 2,
      "row": 7,
      "angle": 0
    },
    {
      "type": "block",
      "col": 2,
      "row": 6,
      "angle": 0
    },
    {
      "type": "block",
      "col": 2,
      "row": 5,
      "angle": 0
    },
    {
      "type": "block",
      "col": 2,
      "row": 4,
      "angle": 0
    },
    {
      "type": "ramp",
      "col": 3,
      "row": 3,
      "angleIndex": 1
    },
    {
      "type": "block",
      "col": 2,
      "row": 3,
      "angle": 0
    },
    {
      "type": "ramp",
      "col": 2,
      "row": 2,
      "angleIndex": 1
    },
    {
      "type": "block",
      "col": 10,
      "row": 8,
      "angle": 0
    }
  ],
  "goals": [
    {
      "type": "goal",
      "col": 14,
      "row": 3
    },
    {
      "type": "goal",
      "col": 13,
      "row": 3
    }
  ],
  allowedContraptions: {
    trampoline: 1,
    fan: 3,
    conveyor: 2
  }
};

function drawMenu() {
  background(235);

  // panel
  const panelW = width * 0.6;
  const panelH = height * 0.6;
  const panelX = width / 2;
  const panelY = height / 2;

  push();
  rectMode(CENTER);
  noStroke();
  fill(255);
  rect(panelX, panelY, panelW, panelH, 20);
  pop();

  textAlign(CENTER, CENTER);

  // title
  fill(30);
  textSize(44);
  text("Rube Goldberg Machine", width / 2, panelY - panelH / 2 + 70);

  // subtitle
  textSize(18);
  fill(100);
  text("Select a Level", width / 2, panelY - panelH / 2 + 120);

  // level list
  textSize(22);
  fill(40);

  let startY = panelY - 20;
  let spacing = 45;

  for (let i = 0; i < LEVELS.length; i++) {
    let y = startY + i * spacing;

    // divider
    stroke(220);
    line(panelX - panelW / 4, y + spacing / 2 - 10,
         panelX + panelW / 4, y + spacing / 2 - 10);
    noStroke();

    text(`${LEVELS[i].name}`, width / 2, y);
  }

  // footer hints
  textSize(14);
  fill(120);
  text("Press number key to start", width / 2, panelY + panelH / 2 - 60);
  text("Press D for Editor Mode", width / 2, panelY + panelH / 2 - 35);
}

function drawHUD() {
  push();

  // HUD box
  rectMode(CORNER);
  textAlign(LEFT, TOP);
  textSize(14);
  noStroke();

  let x = 10;
  let y = 10;
  let padding = 10;
  let lineH = 20;

  // Collect lines to draw
  let lines = [];
  lines.push("Press M to return to menu");

  if (gameMode === MODE_LEVEL && currentLevel && currentLevel.allowedContraptions) {
    const rules = currentLevel.allowedContraptions;

    if (rules.trampoline !== undefined) {
      lines.push(`T: Place trampoline (max ${rules.trampoline})`);
    }
    if (rules.fan !== undefined) {
      lines.push(`F: Place fan (max ${rules.fan})`);
    }
    if (rules.conveyor !== undefined) {
      lines.push(`C: Place conveyor (max ${rules.conveyor})`);
    }
    if (rules.ball !== undefined) {
      lines.push(`B: Place ball spawn (max ${rules.ball})`);
    }
  }

  if (gameMode === MODE_EDITOR) {
    lines.push("B: Block mode (click to place)");
    lines.push("R: Ramp mode");
    lines.push("A: Ball mode");
    lines.push("G: Goal mode");
    lines.push("T: Trampoline mode");
    lines.push("C: Conveyor mode");
    lines.push("F: Fan mode");
  }

  // background
  let boxW = 260;
  let boxH = padding * 2 + lines.length * lineH;

  fill(0, 150);
  rect(x, y, boxW, boxH, 10);

  // text
  fill(255);
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], x + padding, y + padding + i * lineH);
  }

  pop();
}

const LEVELS = [
  { id: 1, name: "Level 1", data: LEVEL_1 },
  { id: 2, name: "Level 2", data: LEVEL_2 },
  { id: 3, name: "Level 3", data: LEVEL_3 }
];

function preload() {
  sTramp = loadSound("sounds/trampoline.mp3");
  sConveyor = loadSound("sounds/conveyor.mp3");
  sFan = loadSound("sounds/fan.mp3");
  sGoal = loadSound("sounds/goal.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  cellSize = Math.floor(
    Math.min(width / GRID_COLS, height / GRID_ROWS)
  );

  sTramp.setVolume(0.5);
  sConveyor.setVolume(0.25)
  sFan.setVolume(0.25);
  sGoal.setVolume(0.75);

  cols = GRID_COLS;
  rows = GRID_ROWS;

  // matter.js setup
  engine = Engine.create(); // creates engine
  world = engine.world;
  
  runner = Runner.create(); // runs engine
  Runner.run(runner, engine); 

  // 2d array setup
  cols = GRID_COLS;
  rows = GRID_ROWS;

  gridOffsetX = (width  - cols * cellSize) / 2;
  gridOffsetY = (height - rows * cellSize) / 2;

  theGrid = generateEmptyGrid(cols, rows);

  // collision detector
  Matter.Events.on(engine, "collisionStart", (event) => {
    for (let pair of event.pairs) {
      handleCollision(pair);
    }
  });
}

// function exportLevel() {
//   const LEVEL = {
//     walls: [],
//     goals: []
//   };

//   // save walls
//   for (let w of wallArray) {
//     if (w instanceof Block) {
//       LEVEL.walls.push({
//         type: "block",
//         col: w.col,
//         row: w.row,
//         angle: 0
//       });
//     }
//     else if (w instanceof Ramp) {
//       LEVEL.walls.push({
//         type: "ramp",
//         col: w.col,
//         row: w.row,
//         angleIndex: w.angleIndex
//       });
//     }
//   }

//   // goals
//   for (let g of goalArray) {
//     LEVEL.goals.push({
//         type: "goal",
//         col: g.col,
//         row: g.row
//       });
//   }

//   console.log(JSON.stringify(LEVEL, null, 2));
// }

function clearWorld() {
  for (let b of Composite.allBodies(engine.world)) {
    Composite.remove(engine.world, b);
  }

  wallArray = [];
  contrArray = [];
  ballArray = [];
  goalArray = [];
}

function isEditorMode() {
  return gameMode === MODE_EDITOR;
}

function isLevelMode() {
  return gameMode === MODE_LEVEL;
}

function enterEditorMode() {
  gameMode = MODE_EDITOR;
  simulationRunning = false;

  currentLevel = null;
  currentLevelRules = null;
  contraptionCounts = {};

  clearWorld();
}

function enterLevelMode(level) {
  gameMode = MODE_LEVEL;
  currentLevel = level
  simulationRunning = false;
  loadLevel(level);
}

function loadLevel(level) {
  clearWorld();

  currentLevel = level;           // store reference to level JSON
  simulationRunning = false;

  gameMode = MODE_LEVEL;          // level mode
  currentLevelRules = level.allowedContraptions || {};
  contraptionCounts = {};
  for (let key in currentLevelRules) {
    contraptionCounts[key] = 0;
  }


  // Spawn walls
  for (let w of level.walls || []) {
    if (w.type === "block") wallArray.push(new Block(w.col, w.row, w.angle || 0));
    else if (w.type === "ramp") wallArray.push(new Ramp(w.col, w.row, w.angleIndex));
  }

  // Spawn goals
  for (let g of level.goals || []) {
    goalArray.push(new Goal(g.col, g.row));
  }

}

function spawnLevelBalls() {
  if (!isLevelMode()) {
    return;
  }
  if (!currentLevel || !currentLevel.ballSpawns) {
    return;
  }
  for (let s of currentLevel.ballSpawns) {
    ballArray.push(new Ball(s.col, s.row));
  }

  simulationRunning = true;
}

function canPlaceSetting(gameSetting) {
  if (isEditorMode()) {
    return true;
  }

  const key = settingToKey(gameSetting);
  if (!key) {
    return false;
  }

  const limit = currentLevelRules[key];
  if (limit === undefined) {
    return false;
  }

  const used = contraptionCounts[key] || 0;
  return used < limit;
}

function canUseContraption(type) {
  if (isEditorMode()) {
    return true;
  }

  if (!currentLevelRules) {
    return false;
  }

  const limit = currentLevelRules[type];
  if (limit === undefined) {
    return false;
  }

  const used = contraptionCounts[type] || 0;
  return used < limit;
}


function draw() {
  anyConveyorTouching = false;
  if (gameMode === MODE_MENU) {
    drawMenu();
    return;
  }
  stroke(0);
  strokeWeight(1);
  fill(255);
  rectMode(CENTER);
  background("white");
  deleteOutOfBounds();
  showGrid();
  drawHUD();

  if (isEditorMode()) {
    simulationRunning = false;
  }
  for (let someBlock of wallArray) {
    someBlock.display();
  }
  for (let someBall of ballArray) {
    someBall.display();
    applyRampAssist(someBall);
  }
  for (let someContr of contrArray) {
    someContr.display();
    if (someContr instanceof Fan) {
      someContr.updateSound();
      for (let ball of ballArray) {
        someContr.applyAirflow(ball);
      }
    }
    if (someContr instanceof Conveyor) {
      someContr.applyConveyorForce();
    }
  }
  for (let someGoal of goalArray) {
    someGoal.display();
  }
  if (sConveyor) {
  sConveyor.setLoop(true);
  if (anyConveyorTouching && !sConveyor.isPlaying()) {
    sConveyor.play();
  }
  if (!anyConveyorTouching && sConveyor.isPlaying()) {
    sConveyor.stop();
  }
}
}

function stopAllSounds() {
  if (sFan && sFan.isPlaying()) {
    sFan.stop();
  }
  if (sConveyor && sConveyor.isPlaying()) {
    sConveyor.stop();
  }
  if (sTramp && sTramp.isPlaying()) {
    sTramp.stop();
  }
  if (sGoal && sGoal.isPlaying()) {
    sGoal.stop();
  }
}


function rotateOffset(dx, dy, angle) {
  // for finding which cells a body owns
  const STEP = Math.PI / 4;
  const SNAPPED = Math.round(angle / STEP) * STEP;

  const COS = Math.round(Math.cos(SNAPPED));
  const SIN = Math.round(Math.sin(SNAPPED));

  return {
    dx: dx * COS - dy * SIN,
    dy: dx * SIN + dy * COS
  };
} 

function handleCollision(pair) {
  let bodyA = pair.bodyA;
  let bodyB = pair.bodyB;

  for (let c of contrArray) {
    if (c.body === bodyA || c.body === bodyB) {
      if (c.onCollision) {
        c.onCollision(pair);
      }
    }
  }

  // conveyors no bounce
  if (bodyA.label === "ball" && bodyB.label === "conveyor" ||
      bodyB.label === "ball" && bodyA.label === "conveyor") {
    pair.restitution = 0;
  }

  // goal collision
  if (bodyA.label === "goal" && bodyB.label === "ball") {
    removeBall(bodyB);
  } 
  else if (bodyB.label === "goal" && bodyA.label === "ball") {
    removeBall(bodyA);
  }
}

function cellToPixel(col, row) {
  return {
    x: gridOffsetX + col * cellSize + cellSize / 2,
    y: gridOffsetY + row * cellSize + cellSize / 2
  };
}

function removeBall(ballBody) {
  if (sGoal) {
    sGoal.play();
  }

  for (let i = ballArray.length - 1; i >= 0; i--) {
    if (ballArray[i].body === ballBody) {
      Composite.remove(engine.world, ballBody);
      ballArray.splice(i, 1);
      break;
    }
  }

  // stop fan sound if no balls left
  if (ballArray.length === 0) {
    if (sFan && sFan.isPlaying()) sFan.stop();
  }

}

function mousePressed() {
  userStartAudio();

  let col = Math.floor((mouseX - gridOffsetX) / cellSize);
  let row = Math.floor((mouseY - gridOffsetY) / cellSize);

  let x = gridOffsetX + col * cellSize + cellSize / 2;
  let y = gridOffsetY + row * cellSize + cellSize / 2;

  if (!isInsideGrid(col, row)) {
    return;
  }

  toggleCell(col, row);
}

function keyPressed() {
  if (gameMode === MODE_MENU) {
    let index = parseInt(key, 10) - 1;
    if (index >= 0 && index < LEVELS.length) {
      enterLevelMode(LEVELS[index].data);
    }
    if (key === "d" || key === "D") {
    enterEditorMode();
    }
    return;
  }
  else if (key === "m" || key === "M") {
    gameMode = MODE_MENU;
    stopAllSounds();
  }
  if (simulationRunning) {
    return;
  }
  if (key === "b" || key === "B") {
    setting = "block";
  }
  else if (key === "r" || key === "R") {
    setting = "ramp";
  }
  else if (key === "a") {
    if (isLevelMode()) {
      spawnLevelBalls();
      return;
    } else if (isEditorMode()) {
      setting = "ball";
      return;
    }
  }
  else if (key === "t" || key === "T") {
    setting = "trampoline";
  }
  else if (key === "f" || key === "F") {
    setting = "fan";
  }
  else if (key === "c" || key === "C") {
    setting = "conveyor";
  }
  else if (key === "g" || key === "G") {
    setting = "goal"; 
  }
  // else if (key === "e") {
  //   exportLevel();
  // }
  else if (key === "l" && gameMode === MODE_EDITOR) {
    clearWorld();
  }
  else if (keyCode === DOWN_ARROW) {
    if (lastPlaced && lastPlaced.rotate180) {
      lastPlaced.rotate180();
    }
  }
  else if (keyCode === UP_ARROW) {
    if (lastPlaced && lastPlaced.rotate90) {
      lastPlaced.rotate90();
    }
  }
  else if (keyCode === LEFT_ARROW) {
    if (lastPlaced && lastPlaced.rotateLeft) {
      lastPlaced.rotateLeft();
    }
  }
  else if (keyCode === RIGHT_ARROW) {
    if (lastPlaced && lastPlaced.rotateRight) {
      lastPlaced.rotateRight();
    }
  }
}

function isInsideGrid(col, row) {
  return col >= 0 && row >= 0 && col < cols && row < rows;
}

function getOccupiedCells(body) {
  // AABB
  const BOUNDS = body.bounds;

  // buffer to prevent spillover into other cell bugs
  const OFFSET = cellSize * 0.001;

  const MIN_X = BOUNDS.min.x + OFFSET;
  const MAX_X = BOUNDS.max.x - OFFSET;
  const MIN_Y = BOUNDS.min.y + OFFSET;
  const MAX_Y = BOUNDS.max.y - OFFSET;

  const occupied = [];

  const startCol = Math.floor((MIN_X - gridOffsetX) / cellSize);
  const endCol   = Math.floor((MAX_X - gridOffsetX) / cellSize);
  const startRow = Math.floor((MIN_Y - gridOffsetY) / cellSize);
  const endRow   = Math.floor((MAX_Y - gridOffsetY) / cellSize);

  for (let col = startCol; col <= endCol; col++) {
    for (let row = startRow; row <= endRow; row++) {
      occupied.push({ col, row });
    }
  }

  return occupied;
}

function isCellOccupied(col, row) {
  for (let w of wallArray) {
    if (w.col === col && w.row === row) {
      return true;
    }
  }

  for (let c of contrArray) {
    for (let cell of c.getFootprint()) {
      if (cell.col === col && cell.row === row) {
        return true;
      }
    }
  }

  for (let g of goalArray) {
    if (g.col === col && g.row === row) {
      return true;
    }
  }

  return false;
}

function toggleCell(col, row) {

  if (simulationRunning) {
    return;
  }
  if (isLevelMode() && (setting === "block" || setting === "ramp")) {
    return;
  }
  if (isLevelMode() && setting === "ball") {
    return;
  }


  if (isCellOccupied(col, row)) { // delete if something already on that cell
    deleteCell(col, row);
    return;
  }
  
  if (setting === "block") {
    let theWall = new Block(col, row, 0);
    wallArray.push(theWall);
  }
  if (setting === "ramp") {
    let theWall = new Ramp(col, row, 0);
    wallArray.push(theWall);
    lastPlaced = theWall;
  }
  else if (setting === "ball") {
    let theBall = new Ball(col, row, 0);
    ballArray.push(theBall);
    lastPlaced = theBall;
  }
  else if (setting === "trampoline") {
    trySpawnContraption(
      Trampoline,
      col,
      row,
      [0, Math.PI / 2]
    );
  }
  else if (setting === "fan") {
    trySpawnContraption(
      Fan,
      col,
      row,
      [0, Math.PI / 2, Math.PI, Math.PI * 3 / 2]
    );
  }
  else if (setting === "conveyor") {
    trySpawnContraption(
      Conveyor,
      col,
      row,
      [0, Math.PI / 2]
    );
  }
  else if (setting === "goal") {
    let theGoal = new Goal(col, row);
    goalArray.push(theGoal);
  }
}

function deleteCell(col, row) {

  if (simulationRunning) {
    return;
  }

  // wall deletion
  if (isEditorMode()) {
    for (let i = wallArray.length - 1; i >= 0; i--) {
      const W = wallArray[i];
      const CELLS = getOccupiedCells(W.body);

      for (let cell of CELLS) {
        if (cell.col === col && cell.row === row) {
          Composite.remove(engine.world, W.body);
          wallArray.splice(i, 1);
          return;
        }
      }
    }
  }

  // contraption deletion
  for (let i = contrArray.length - 1; i >= 0; i--) {
    const C = contrArray[i];

    for (let cell of C.getFootprint()) {
      if (cell.col === col && cell.row === row) {
        Composite.remove(engine.world, C.body);
        contrArray.splice(i, 1);

        if (isLevelMode()) {
          const key = C.constructor.name.toLowerCase();
          if (contraptionCounts[key] !== undefined) {
            contraptionCounts[key]--;
          }
        }

        return;
      }
    }
  }

  // goal deletion
  if (isEditorMode()) {
    for (let i = goalArray.length - 1; i >= 0; i--) {
      const G = goalArray[i];
      const CELLS = getOccupiedCells(G.body);

      for (let cell of CELLS) {
        if (cell.col === col && cell.row === row) {
          Composite.remove(engine.world, G.body);
          goalArray.splice(i, 1);
          return;
        }
      }
    }
  }
}

function deleteOutOfBounds() {
  for (let i = ballArray.length - 1; i >= 0; i--) { // delete if ball goes out of bounds
    let b = ballArray[i];
    let pos = b.body.position;

    if (
      pos.y > rows * cellSize + gridOffsetY || 
      pos.x < gridOffsetX ||
      pos.x > cols * cellSize + gridOffsetX ||
      pos.y < gridOffsetY
    ) {
      Composite.remove(engine.world, b.body);
      ballArray.splice(i, 1);
    }
  }

  if (simulationRunning && ballArray.length === 0) {
    simulationRunning = false;
  }
}

function canPlaceContraption(contr) {
  const CELLS = contr.getFootprint();

  for (let cell of CELLS) {
    if (!isInsideGrid(cell.col, cell.row)) {
      return false;
    }

    if (isCellOccupied(cell.col, cell.row)) {
      return false;
    }
  }

  return true;
}

function trySpawnContraption(ContrClass, col, row, angles) {
  // if can't place at angle 0, tries placing at angle pi/2 (passed in)

  const type = ContrClass.name.toLowerCase();

  // checks if any contraptions left
  if (!canUseContraption(type)) {
    return null;
  }

  for (let angle of angles) {
    let temp = new ContrClass(col, row, angle);

    // uses temporary bodies
    if (canPlaceContraption(temp)) {
      temp.spawn();
      contrArray.push(temp);
      lastPlaced = temp;

      if (isLevelMode()) {
        contraptionCounts[type]++;
      }
      
      return temp;
    }
  }

  return null;
}



function canRotate(body, allBodies) {
  // prevents rotation into other objects
  const COLLISIONS = Query.collides(body, allBodies);
  return COLLISIONS.length === 0;
}

function applyRampAssist(ball) {
  // prevents jitter caused by many collisions of chaining ramps (aphysical)
  for (let w of wallArray) {
    if (!(w instanceof Ramp)) {
      continue;
    }

    const COLLISIONS = Matter.Query.collides(ball.body, [w.body]);
    if (COLLISIONS.length === 0) {
      continue;
    }

    for (let c of COLLISIONS) {
      // collision normal (points out of the ramp)
      const normal = c.normal;

      // tangent direction (along the ramp)
      let tangent = {
        x: normal.y,
        y: -normal.x
      };

      // Make sure tangent points downhill
      if (tangent.y < 0) {
        tangent.x *= -1;
        tangent.y *= -1;
      }

      const STRENGTH = cellSize * 0.00001875;

      Matter.Body.applyForce(ball.body, ball.body.position, {
        x: tangent.x * STRENGTH,
        y: tangent.y * STRENGTH
      });
    }
  }
}


function showGrid() {
  noFill();
  rectMode(CENTER);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let x = gridOffsetX + col * cellSize + cellSize / 2;
      let y = gridOffsetY + row * cellSize + cellSize / 2;
      square(x, y, cellSize);
    }
  }
}

function generateEmptyGrid(cols, rows) {
  let newGrid = [];
  for (let y = 0; y < rows; y++) {
    newGrid.push([]);
    for (let x = 0; x < cols; x++) {
      newGrid[y].push(0);
    }
  }
  return newGrid;
}

class Ball {
  constructor(col, row) {
    this.col = col;
    this.row = row;
    this.radius = cellSize / 2 - cellSize / 5;
    this.color = "red";
    let options = { restitution: 0.5, frictionAir: 0 };
    const { x, y } = cellToPixel(col, row);
    this.body = Bodies.circle(x, y, this.radius, options);
    this.body.label = "ball";

    Composite.add(engine.world, this.body);
  }
  
  display() {
    let position = this.body.position;
    let angle = this.body.angle;
    push();
    translate(position.x, position.y);
    rotate(angle);
    fill(this.color);
    circle(0, 0, this.radius * 2);
    pop();  
  }
}

class Wall {
  constructor(col, row, angle) {
    this.col = col;
    this.row = row;
    this.angle = angle;
    this.color = "black";
    this.options = { isStatic: true,  friction: 0, frictionStatic: 0};
  }
}

class Block extends Wall {
  constructor(col, row, angle) {
    super(col, row, angle);
    this.width = cellSize;
    const { x, y } = cellToPixel(col, row);
    this.body = Bodies.rectangle(x, y, this.width, this.width, this.options);

    Composite.add(engine.world, this.body);
  }

  display() {
    const { x, y } = cellToPixel(this.col, this.row);
    push();
    rectMode(CENTER);
    fill(this.color);
    square(x, y, this.width);
    pop();
  }
}

class Ramp extends Wall {
  constructor(cellX, cellY, angleIndex = 0) {
    // angleIndex: 0 = 0, 1 = 90, 2 = 180, 3 = 270
    super(cellX, cellY, angleIndex * Math.PI / 2);

    const { x, y } = cellToPixel(cellX, cellY);
    this.cellCenter = { x, y };
    this.angleIndex = angleIndex; 

    // Build the body
    this.buildBody();
  }

  buildBody() {
    // creates new triangle for rotation purposes
    let vertices = [
      { x: 0, y: cellSize },       // bottom-left
      { x: cellSize, y: cellSize }, // bottom-right
      { x: cellSize, y: 0 }        // top-right
    ];

    // Rotate vertices by 90° increments
    const ANGLE = this.angleIndex * Math.PI / 2;
    const COS = Math.cos(ANGLE);
    const SIN = Math.sin(ANGLE);
    let rotated = vertices.map(v => ({
      x: v.x * COS - v.y * SIN,
      y: v.x * SIN + v.y * COS
    }));

    // Compute triangle centroid
    const CENTROID = {
      x: (rotated[0].x + rotated[1].x + rotated[2].x) / 3,
      y: (rotated[0].y + rotated[1].y + rotated[2].y) / 3
    };

    // Shift vertices so centroid = (0,0)
    let shiftedVertices = rotated.map(v => ({
      x: v.x - CENTROID.x,
      y: v.y - CENTROID.y
    }));

    // Remove old body if exists
    if (this.body) {
      Composite.remove(engine.world, this.body);
    }

    // Create new body
    this.body = Bodies.fromVertices(0, 0, shiftedVertices, this.options);
    
    // Compute diagonal midpoint (bottom-left to top-right)
    const DIAG_MID = {
      x: (rotated[0].x + rotated[2].x) / 2 - CENTROID.x,
      y: (rotated[0].y + rotated[2].y) / 2 - CENTROID.y
    };

    // Place the body so diagonal midpoint is at cell center
    Matter.Body.setPosition(this.body, {
      x: this.cellCenter.x + (cellSize / 2 - DIAG_MID.x - cellSize / 2),
      y: this.cellCenter.y + (cellSize / 2 - DIAG_MID.y - cellSize / 2)
    });

    Composite.add(engine.world, this.body);
  }

  display() {
    push();
    fill(this.color);
    beginShape();
    for (let v of this.body.vertices) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
    pop();
  }

  rotateLeft() {
    this.angleIndex = (this.angleIndex + 3) % 4; 
    this.buildBody();
  }

  rotateRight() {
    this.angleIndex = (this.angleIndex + 1) % 4; 
    this.buildBody();
  }
}

class Goal {
  constructor(col, row) {
    this.col = col;
    this.row = row;
    this.width = cellSize;
    this.color = "green"; 
    let options = { isStatic: true };
    const { x, y } = cellToPixel(col, row);
    this.body = Bodies.rectangle(x, y, this.width, this.width, options);
    this.body.label = "goal";

    Matter.Composite.add(engine.world, this.body);
  }

  display() {
    const { x, y } = cellToPixel(this.col, this.row);
    push();
    rectMode(CENTER);
    fill(this.color);
    square(x, y, this.width);
    pop();
  }
}

class Contraption {
  constructor(col, row, angle) {
    this.col = col;
    this.row = row;
    this.angle = angle;
  }

  spawn() {
    Composite.add(engine.world, this.body);
  }

  getFootprint() {
    return [{ col: this.col, row: this.row }];
  }

  rotate180() {
    this.tryRotate(Math.PI);
  }

  rotate90() {
    this.tryRotate(Math.PI / 2);
  }

  rotateLeft() {
    this.tryRotate(-Math.PI / 12);
  }

  rotateRight() {
    this.tryRotate(Math.PI / 12);
  }

  tryRotate(delta) {
    const OLD_ANGLE = this.body.angle;
    Matter.Body.setAngle(this.body, OLD_ANGLE + delta);

    // all other bodies in the world
    const ALL_BODIES = Composite.allBodies(engine.world);
    let others = [];

    for (let b of ALL_BODIES) {
      if (b !== this.body) {
        others.push(b);
      }
    }

    if (!canRotate(this.body, others)) {
      // undo rotation
      Matter.Body.setAngle(this.body, OLD_ANGLE);
    } 
    else {
      this.angle = OLD_ANGLE + delta;
    }
  }
}

class Trampoline extends Contraption {
  constructor(col, row, angle) {
    super(col, row, angle);
    this.color = "purple";
    this.width = cellSize - cellSize / 5;
    this.height = cellSize / 5;
    let options = { isStatic: true };
    const { x, y } = cellToPixel(col, row);
    this.body = Bodies.rectangle(x, y, this.width, this.height, options);
    Matter.Body.setAngle(this.body, this.angle);
  }

  rotate() {
    super.tryRotate();
    Matter.Body.setAngle(this.body, this.angle);
  }

  display() {
    let position = this.body.position;
    let angle = this.body.angle;
    push();
    translate(position.x, position.y);
    rotate(angle);
    rectMode(CENTER);
    fill(this.color);
    rect(0, 0, this.width, this.height);
    pop();
  }

  onCollision(pair) {
    let bodyA = pair.bodyA;
    let bodyB = pair.bodyB;

    // Find the ball involved
    let ball;
    for (let b of ballArray) {
      if (b.body === bodyA || b.body === bodyB) {
        ball = b;
        break;
      }
    }
    if (!ball) {
      return;
    }

    // Make sure this trampoline is involved
    if (this.body !== bodyA && this.body !== bodyB) {
      return;
    }

    if (sTramp && !sTramp.isPlaying()) {
      sTramp.play();
    }

    // Collision physics
    let angle = this.body.angle; 
    let incoming = Math.abs(ball.body.velocity.y);
    let baseSpeed = cellSize * 0.125;
    let speed = Math.max(baseSpeed, incoming * 1.25);


    Matter.Body.setVelocity(ball.body, {
      x: Math.sin(angle) * speed,
      y: -Math.cos(angle) * speed
    });
  }
}

function anyBallsExist() {
  return ballArray.length > 0;
}

class Fan extends Contraption {
  constructor(col, row, angle) {
    super(col, row, angle);
    this.color = "grey";
    this.width = cellSize * 2 - 2 * cellSize / 5;
    this.height = cellSize / 5;
    this.strength = cellSize * 0.0005;
    this.sound = sFan;
    this.sound.setLoop(true);
    let options = { isStatic: true};
    const { x, y } = cellToPixel(col, row);
    this.body = Bodies.rectangle(x, y, this.width, this.height, options);
    Matter.Body.setAngle(this.body, this.angle);

  }

  getFootprint() {
    const CELLS = [{ col: this.col, row: this.row }];
    const OFF = rotateOffset(1, 0, this.body.angle);

    CELLS.push({
      col: this.col + OFF.dx,
      row: this.row + OFF.dy
    });

    return CELLS;
  }


  rotate() {
    super.tryRotate();
    Matter.Body.setAngle(this.body, this.angle);
  }

  updateSound() {
    if (!this.sound) return;

    if (anyBallsExist()) {
      if (!this.sound.isPlaying()) {
        this.sound.play();
      }
    } else {
      if (this.sound.isPlaying()) {
        this.sound.stop();
      }
    }
  }

  applyAirflow(ball) {
    const FAN_POS = this.body.position;
    const ANGLE = this.body.angle;

    // Fan endpoints in world space (stackoverflow helped with the vector math here)
    const LEFT = Matter.Vector.add(FAN_POS, Matter.Vector.rotate({ x: -this.width/2, y: 0 }, ANGLE));
    const RIGHT = Matter.Vector.add(FAN_POS, Matter.Vector.rotate({ x: this.width/2, y: 0 }, ANGLE));

    // Vector along the fan (width)
    const FAN_VEC = Matter.Vector.sub(RIGHT, LEFT);
    const FAN_LEN = Matter.Vector.magnitude(FAN_VEC);
    const FAN_DIR = Matter.Vector.normalise(FAN_VEC);

    // Vector from left end to ball
    const BALL_VEC = Matter.Vector.sub(ball.body.position, LEFT);

    // Project ball onto fan width 
    const PROJ = Matter.Vector.dot(BALL_VEC, FAN_DIR);

    // Check if ball is within fan width
    if (PROJ < 0 || PROJ > FAN_LEN) {
      return;
    }

    // Perpendicular distance to fan line 
    const PERP = BALL_VEC.x * FAN_DIR.y - BALL_VEC.y * FAN_DIR.x;

    // Only apply force if ball is on the active side (PERP > 0)
    if (PERP <= 0) {
      return;
    }

    // raycasting to detect if other bodies are in the way (thanks stackoverflow!)
    const fanForward = { x: FAN_DIR.y, y: -FAN_DIR.x };
    const RAY_END = {
      x: FAN_POS.x + fanForward.x * Math.abs(PERP),
      y: FAN_POS.y + fanForward.y * Math.abs(PERP)
    };

    const BLOCKERS = Matter.Query.ray(
      Matter.Composite.allBodies(engine.world),
      FAN_POS,
      RAY_END
    );

    for (let hit of BLOCKERS) {
      if (hit.bodyA !== this.body && hit.bodyA !== ball.body) {
        return; // airflow blocked
      }
    }

    // Strength falls off with distance from fan
    const DISTANCE = Math.abs(PERP);
    const STRENGTH = this.strength / (DISTANCE / cellSize * 7.5);

    // Force vector along fan’s forward direction (perpendicular to fan width)
    const applyForce = {
      x: FAN_DIR.y * STRENGTH,
      y: -FAN_DIR.x * STRENGTH
    };

    Matter.Body.applyForce(ball.body, ball.body.position, applyForce);
  }

  display() {
    let pos = this.body.position;
    let angle = this.body.angle;
    push();
    translate(pos.x, pos.y);
    rotate(angle);
    rectMode(CENTER);
    fill(this.color);
    rect(0, 0, this.width, this.height);

    // airflow arrows
    let numStreams = 6;
    let spacing = this.width / (numStreams - 1);
    let flowLength = cellSize * 3;

    let speed = cellSize * 0.0375;
    let offset = frameCount * speed % (cellSize * 0.5);

    for (let i = 0; i < numStreams; i++) {
      let x = -this.width / 2 + i * spacing;

      for (let y = -this.height/2 - offset; y > -flowLength; y -= cellSize * 0.5) {
        
        // fade based on distance from fan
        let fade = 150 * map(y, -this.height/2, -flowLength, 1, 0);

        stroke(0, 150, 255, fade);

        // shaft
        line(x, y, x, y - cellSize / 5);

        // arrow head
        line(x, y - cellSize / 5, x - cellSize / 12.5, y - cellSize / 12.5);
        line(x, y - cellSize / 5, x + cellSize / 12.5, y - cellSize / 12.5);
      }
    }
    pop();
  }
}

class Conveyor extends Contraption {
  constructor(col, row, angle) {
    super(col, row, angle);
    this.color = "green";
    this.width = cellSize * 3 - 2 * cellSize / 5;
    this.height = cellSize / 5;
    this.sideForce = cellSize * 0.00005;

    let options = { isStatic: true };
    const { x, y } = cellToPixel(col, row);
    this.body = Bodies.rectangle(x, y, this.width, this.height, options);
    this.body.label = "conveyor";
    Matter.Body.setAngle(this.body, this.angle);
  }
  
  getFootprint() {
    const CELLS = [{ col: this.col, row: this.row }];

    const OFF_1 = rotateOffset(1, 0, this.body.angle);
    const OFF_2 = rotateOffset(-1, 0, this.body.angle);

    CELLS.push(
      { col: this.col + OFF_1.dx, row: this.row + OFF_1.dy },
      { col: this.col + OFF_2.dx, row: this.row + OFF_2.dy }
    );

    return CELLS;
  }


  rotate() {
    super.tryRotate();
    Matter.Body.setAngle(this.body, this.angle);
  }

  onCollision(pair) {
    for (let b of ballArray) {
      if (b.body === pair.bodyA || b.body === pair.bodyB) {
        b.conveyorOn = true; 
      }
      else {
        b.conveyorOn = false;
      }
    }
  }

  applyConveyorForce() {
    const ANGLE = this.body.angle;
    const FORCE_VECTOR = { 
      x: Math.cos(ANGLE) * this.sideForce, 
      y: Math.sin(ANGLE) * this.sideForce 
    };

    for (let b of ballArray) {
      const hits = Matter.Query.collides(this.body, [b.body]);
      if (hits.length > 0) {
        anyConveyorTouching = true;
        Matter.Body.applyForce(b.body, b.body.position, FORCE_VECTOR);
      }
    }
  }

  display() {
    let position = this.body.position;
    let angle = this.body.angle;
    push();
    translate(position.x, position.y);
    rotate(angle);
    rectMode(CENTER);
    fill(this.color);
    rect(0, 0, this.width, this.height);

    // drawing segment lines
    let numSegments = this.width / cellSize;
    for (let i = 1; i < numSegments; i++) {
      let x = -this.width / 2 + i * cellSize;
      line(x, -this.height / 2, x, this.height / 2);
    }

    // arrows
    stroke("white");
    fill("white");

    let spacing = cellSize;
    let offset = frameCount * cellSize * 0.025 % spacing;

    for (let x = -this.width/2 + offset; x < this.width/2; x += spacing) {
      line(x - cellSize / 5, 0, x + cellSize / 5, 0);     
      line(x + cellSize / 5, 0, x + cellSize / 12.5, -cellSize / 12.5);    
      line(x + cellSize / 5, 0, x + cellSize / 12.5,  cellSize / 12.5);
    }

    pop();
  }
}