// Rube Goldberg Machine Game
// Noor-Eddin Mohamed
// January 19 2026

// matter.js aliases
const { Engine, Runner, Bodies, Composite, Query, Vector } = Matter;

// matter.js variables
let engine;
let world;
let runner;

// 2d array variables
let theGrid;
const GRID_COLS = 16;
const GRID_ROWS = 9;
let cellSize;
let rows;
let cols;
let gridOffsetX;
let gridOffsetY;

let goal;
let lastPlaced;

let wallArray = [];
let ballArray = [];
let contrArray = [];

let setting = "block";

// level data
const LEVEL_1 = {
  "walls": [
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
      "col": 9,
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
      "type": "ramp",
      "col": 6,
      "row": 7,
      "angleIndex": 1
    }
  ],
  "goal": {
    "col": 2,
    "row": 7
  }
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  cellSize = Math.floor(
    Math.min(width / GRID_COLS, height / GRID_ROWS)
  );

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

  loadLevel(LEVEL_1);
}

function exportLevel() {
  const level = {
    walls: [],
    goal: null
  };

  // save walls
  for (let w of wallArray) {
    if (w instanceof Block) {
      level.walls.push({
        type: "block",
        col: w.col,
        row: w.row,
        angle: 0
      });
    }
    else if (w instanceof Ramp) {
      level.walls.push({
        type: "ramp",
        col: w.col,
        row: w.row,
        angleIndex: w.angleIndex
      });
    }
  }

  // save goal
  if (goal) {
    level.goal = {
      col: goal.col,
      row: goal.row
    };
  }

  console.log(JSON.stringify(level, null, 2));
}

function clearWorld() {
  for (let b of Composite.allBodies(engine.world)) {
    Composite.remove(engine.world, b);
  }

  wallArray = [];
  contrArray = [];
  ballArray = [];
  goal = null;
}

function loadLevel(level) {
  clearWorld();

  for (let w of level.walls) {
    if (w.type === "block") {
      wallArray.push(new Block(w.col, w.row, 0));
    }
    else if (w.type === "ramp") {
      wallArray.push(new Ramp(w.col, w.row, w.angleIndex));
    }
  }

  if (level.goal) {
    goal = new Goal(level.goal.col, level.goal.row, cellSize);
  }
}

function draw() {
  background("white");
  deleteOutOfBounds();
  showGrid();

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
      for (let ball of ballArray) {
        someContr.applyAirflow(ball);
      }
    }
    if (someContr instanceof Conveyor) {
      someContr.applyConveyorForce();
    }
  }
  if (goal) {
    goal.display();
  }
}

function rotateOffset(dx, dy, angle) {
  // for finding which cells a body owns
  const step = Math.PI / 4;
  const snapped = Math.round(angle / step) * step;

  const cos = Math.round(Math.cos(snapped));
  const sin = Math.round(Math.sin(snapped));

  return {
    dx: dx * cos - dy * sin,
    dy: dx * sin + dy * cos
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
  for (let i = ballArray.length - 1; i >= 0; i--) {
    if (ballArray[i].body === ballBody) {
      Composite.remove(engine.world, ballBody);
      ballArray.splice(i, 1);
      break;
    }
  }
}

function mousePressed() {
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
  if (key === "b") {
    setting = "block";
  }
  else if (key === "r") {
    setting = "ramp";
  }
  else if (key === "a") {
    setting = "ball";
  }
  else if (key === "t") {
    setting = "trampoline";
  }
  else if (key === "f") {
    setting = "fan";
  }
  else if (key === "c") {
    setting = "conveyor";
  }
  else if (key === "g") {
    setting = "goal"; 
  }
  else if (key === "e") {
    exportLevel();
  }
  else if (key === "l") {
    clearWorld();
  }
  else if (key === "1") {
    loadLevel(LEVEL_1);
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
  const bounds = body.bounds;

  // buffer to prevent spillover into other cell bugs
  const OFFSET = cellSize * 0.001;

  const minX = bounds.min.x + OFFSET;
  const maxX = bounds.max.x - OFFSET;
  const minY = bounds.min.y + OFFSET;
  const maxY = bounds.max.y - OFFSET;

  const occupied = [];

  const startCol = Math.floor((minX - gridOffsetX) / cellSize);
  const endCol   = Math.floor((maxX - gridOffsetX) / cellSize);
  const startRow = Math.floor((minY - gridOffsetY) / cellSize);
  const endRow   = Math.floor((maxY - gridOffsetY) / cellSize);

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

  if (goal && goal.col === col && goal.row === row) {
    return true;
  }

  return false;
}

function toggleCell(col, row) {
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
    let theContr = new Trampoline(col, row, 0);
    contrArray.push(theContr);
    lastPlaced = theContr; 
  }
  else if (setting === "fan") {
    let theContr = new Fan(col, row, 0);
    deleteOverlaps(theContr.body);
    contrArray.push(theContr);
    lastPlaced = theContr;
  }
  else if (setting === "conveyor") {
    let theContr = new Conveyor(col, row, 0);
    deleteOverlaps(theContr.body);
    contrArray.push(theContr);
    lastPlaced = theContr;
  }
  else if (setting === "goal") {
    // delete old goal if it exists
    if (goal) {
      Composite.remove(engine.world, goal.body);
      let index = contrArray.indexOf(goal);
      if (index !== -1) {
        contrArray.splice(index, 1);
      }
    }
    goal = new Goal(col, row, cellSize);
  }
}

function deleteCell(col, row) {
  // delete walls
  for (let i = wallArray.length - 1; i >= 0; i--) {
    const w = wallArray[i];
    const cells = getOccupiedCells(w.body);

    for (let cell of cells) {
      if (cell.col === col && cell.row === row) {

        Composite.remove(engine.world, w.body);
        wallArray.splice(i, 1);
        return;
      }
    }
  }

  // delete contraptions
  for (let i = contrArray.length - 1; i >= 0; i--) {
    const c = contrArray[i];

    for (let cell of c.getFootprint()) {
      if (cell.col === col && cell.row === row) {
        Composite.remove(engine.world, c.body);
        contrArray.splice(i, 1);
        return;
      }
    }
  }
  
  // delete goal
  if (goal) {
    const cells = getOccupiedCells(goal.body);
    for (let cell of cells) {
      if (cell.col === col && cell.row === row) {

        Composite.remove(engine.world, goal.body);
        goal = null;
        return;
      }
    }
  }
}

function deleteOverlaps(body) {
  const cells = getOccupiedCells(body);
  for (let cell of cells) {
    deleteCell(cell.col, cell.row);
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
}

function canRotate(body, allBodies) {
  // prevents rotation into other objects
  const collisions = Query.collides(body, allBodies);
  return collisions.length === 0;
}

function applyRampAssist(ball) {
  // prevents jitter caused by many collisions of chaining ramps (aphysical)
  for (let w of wallArray) {
    if (!(w instanceof Ramp)) {
      continue;
    }

    const collisions = Matter.Query.collides(ball.body, [w.body]);
    if (collisions.length === 0) {
      continue;
    }

    for (let c of collisions) {
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

      const strength = cellSize * 0.0000125;

      Matter.Body.applyForce(ball.body, ball.body.position, {
        x: tangent.x * strength,
        y: tangent.y * strength
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
    const angle = this.angleIndex * Math.PI / 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    let rotated = vertices.map(v => ({
      x: v.x * cos - v.y * sin,
      y: v.x * sin + v.y * cos
    }));

    // Compute triangle centroid
    const centroid = {
      x: (rotated[0].x + rotated[1].x + rotated[2].x) / 3,
      y: (rotated[0].y + rotated[1].y + rotated[2].y) / 3
    };

    // Shift vertices so centroid = (0,0)
    let shiftedVertices = rotated.map(v => ({
      x: v.x - centroid.x,
      y: v.y - centroid.y
    }));

    // Remove old body if exists
    if (this.body) {
      Composite.remove(engine.world, this.body);
    }

    // Create new body
    this.body = Bodies.fromVertices(0, 0, shiftedVertices, this.options);
    
    // Compute diagonal midpoint (bottom-left to top-right)
    const diagMid = {
      x: (rotated[0].x + rotated[2].x) / 2 - centroid.x,
      y: (rotated[0].y + rotated[2].y) / 2 - centroid.y
    };

    // Place the body so diagonal midpoint is at cell center
    Matter.Body.setPosition(this.body, {
      x: this.cellCenter.x + (cellSize / 2 - diagMid.x - cellSize / 2),
      y: this.cellCenter.y + (cellSize / 2 - diagMid.y - cellSize / 2)
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
  constructor(col, row, width) {
    this.col = col;
    this.row = row;
    this.width = width;
    this.color = "red"; 
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

  getFootprint() {
    return [{ col: this.col, row: this.row }];
  }

  rotateLeft() {
    this.tryRotate(-Math.PI / 4);
  }

  rotateRight() {
    this.tryRotate(Math.PI / 4);
  }

  tryRotate(delta) {
    const oldAngle = this.body.angle;
    Matter.Body.setAngle(this.body, oldAngle + delta);

    // all other bodies in the world
    const allBodies = Composite.allBodies(engine.world);
    let others = [];

    for (let b of allBodies) {
      if (b !== this.body) {
        others.push(b);
      }
    }

    if (!canRotate(this.body, others)) {
      // undo rotation
      Matter.Body.setAngle(this.body, oldAngle);
    } 
    else {
      this.angle = oldAngle + delta;
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

    Composite.add(engine.world, this.body);
  }

  rotate() {
    super.rotate();
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

class Fan extends Contraption {
  constructor(col, row, angle) {
    super(col, row, angle);
    this.color = "grey";
    this.width = cellSize * 2 - 2 * cellSize / 5;
    this.height = cellSize / 5;
    this.strength = cellSize * 0.0005;
    let options = { isStatic: true};
    const { x, y } = cellToPixel(col, row);
    this.body = Bodies.rectangle(x, y, this.width, this.height, options);
    Matter.Body.setAngle(this.body, this.angle);

    Composite.add(engine.world, this.body);
  }

  getFootprint() {
    const cells = [{ col: this.col, row: this.row }];
    const off = rotateOffset(1, 0, this.body.angle);

    cells.push({
      col: this.col + off.dx,
      row: this.row + off.dy
    });

    return cells;
  }


  rotate() {
    super.rotate();
    Matter.Body.setAngle(this.body, this.angle);
  }

  applyAirflow(ball) {
    const fanPos = this.body.position;
    const angle = this.body.angle;

    // Fan endpoints in world space (stackoverflow helped with the vector math here)
    const left = Matter.Vector.add(fanPos, Matter.Vector.rotate({ x: -this.width/2, y: 0 }, angle));
    const right = Matter.Vector.add(fanPos, Matter.Vector.rotate({ x: this.width/2, y: 0 }, angle));

    // Vector along the fan (width)
    const fanVec = Matter.Vector.sub(right, left);
    const fanLen = Matter.Vector.magnitude(fanVec);
    const fanDir = Matter.Vector.normalise(fanVec);

    // Vector from left end to ball
    const ballVec = Matter.Vector.sub(ball.body.position, left);

    // Project ball onto fan width 
    const proj = Matter.Vector.dot(ballVec, fanDir);

    // Check if ball is within fan width
    if (proj < 0 || proj > fanLen) {
      return;
    }

    // Perpendicular distance to fan line 
    const perp = ballVec.x * fanDir.y - ballVec.y * fanDir.x;

    // Only apply force if ball is on the active side (perp > 0)
    if (perp <= 0) {
      return;
    }

    // raycasting to detect if other bodies are in the way (thanks stackoverflow!)
    const fanForward = { x: fanDir.y, y: -fanDir.x };
    const rayEnd = {
      x: fanPos.x + fanForward.x * Math.abs(perp),
      y: fanPos.y + fanForward.y * Math.abs(perp)
    };

    const blockers = Matter.Query.ray(
      Matter.Composite.allBodies(engine.world),
      fanPos,
      rayEnd
    );

    for (let hit of blockers) {
      if (hit.bodyA !== this.body && hit.bodyA !== ball.body) {
        return; // airflow blocked
      }
    }

    // Strength falls off with distance from fan
    const distance = Math.abs(perp);
    const strength = this.strength / (distance / cellSize * 7.5);

    // Force vector along fan’s forward direction (perpendicular to fan width)
    const force = {
      x: fanDir.y * strength,
      y: -fanDir.x * strength
    };

    Matter.Body.applyForce(ball.body, ball.body.position, force);
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

    Composite.add(engine.world, this.body);
  }
  
  getFootprint() {
    const cells = [{ col: this.col, row: this.row }];

    const off1 = rotateOffset(1, 0, this.body.angle);
    const off2 = rotateOffset(-1, 0, this.body.angle);

    cells.push(
      { col: this.col + off1.dx, row: this.row + off1.dy },
      { col: this.col + off2.dx, row: this.row + off2.dy }
    );

    return cells;
  }


  rotate() {
    super.rotate();
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
    const angle = this.body.angle;
    const forceVector = { 
      x: Math.cos(angle) * this.sideForce, 
      y: Math.sin(angle) * this.sideForce 
    };

    for (let b of ballArray) {
      const collisions = Matter.Query.collides(this.body, [b.body]);

      if (collisions.length > 0) {
        Matter.Body.applyForce(b.body, b.body.position, forceVector);
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