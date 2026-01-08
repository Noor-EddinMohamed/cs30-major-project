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
const CELL_SIZE = 50;
let rows;
let cols;

let goal;
let lastPlaced;

let wallArray = [];
let ballArray = [];
let contrArray = [];

let setting = "block";

function setup() {
  createCanvas(windowWidth, windowHeight);

  // matter.js setup
  engine = Engine.create(); // creates engine
  world = engine.world;
  
  runner = Runner.create(); // runs engine
  Runner.run(runner, engine); 

  // 2d array setup
  cols = Math.floor(width / CELL_SIZE);
  rows = Math.floor(height / CELL_SIZE);

  theGrid = generateEmptyGrid(cols, rows);

  // collision detector
  Matter.Events.on(engine, "collisionStart", (event) => {
    for (let pair of event.pairs) {
      handleCollision(pair);
    }
  });
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
  let col = Math.floor(mouseX / CELL_SIZE);
  let row = Math.floor(mouseY / CELL_SIZE);

  let x = col * CELL_SIZE + CELL_SIZE / 2;
  let y = row * CELL_SIZE + CELL_SIZE / 2;

  if (!isInsideGrid(col, row)) {
    return;
  }

  toggleCell(x, y);
}

function keyPressed() {
  if (key === "b") {
    setting = "block";
  }
  if (key === "r") {
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
  const bounds = body.bounds;
  const occupied = [];

  const startCol = Math.floor(bounds.min.x / CELL_SIZE);
  const endCol   = Math.floor((bounds.max.x - 1) / CELL_SIZE);
  const startRow = Math.floor(bounds.min.y / CELL_SIZE);
  const endRow   = Math.floor((bounds.max.y - 1) / CELL_SIZE);

  for (let col = startCol; col <= endCol; col++) {
    for (let row = startRow; row <= endRow; row++) {
      occupied.push({
        x: col * CELL_SIZE + CELL_SIZE / 2,
        y: row * CELL_SIZE + CELL_SIZE / 2
      });
    }
  }

  return occupied;
}

function isCellOccupied(x, y) {
  // check walls
  for (let w of wallArray) {
    const cells = getOccupiedCells(w.body);
    for (let c of cells) {
      if (c.x === x && c.y === y) {
        return true;
      }
    }
  }

  // check contraptions
  for (let c of contrArray) {
    const cells = getOccupiedCells(c.body);
    for (let cell of cells) {
      if (cell.x === x && cell.y === y) {
        return true;
      }
    }
  }

  // check goal
  if (goal) {
    const cells = getOccupiedCells(goal.body);
    for (let cell of cells) {
      if (cell.x === x && cell.y === y) {
        return true;
      }
    }
  }

  return false;
}

function toggleCell(x, y) {
  if (isCellOccupied(x, y)) { // delete if something already on that cell
    deleteCell(x, y);
    return;
  }
  
  if (setting === "block") {
    let theWall = new Block(x, y, 0);
    wallArray.push(theWall);
  }
  if (setting === "ramp") {
    let theWall = new Ramp(x, y, 0);
    wallArray.push(theWall);
    lastPlaced = theWall;
  }
  else if (setting === "ball") {
    let theBall = new Ball(x, y);
    ballArray.push(theBall);
    lastPlaced = theBall;
  }
  else if (setting === "trampoline") {
    let theContr = new Trampoline(x, y, 0);
    contrArray.push(theContr);
    lastPlaced = theContr; 
  }
  else if (setting === "fan") {
    let theContr = new Fan(x, y, 0);
    deleteOverlaps(theContr.body);
    contrArray.push(theContr);
    lastPlaced = theContr;
  }
  else if (setting === "conveyor") {
    let theContr = new Conveyor(x, y, 0);
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
    goal = new Goal(x, y, CELL_SIZE);
  }
}

function deleteCell(x, y) {
  // delete walls
  for (let i = wallArray.length - 1; i >= 0; i--) {
    const w = wallArray[i];
    const cells = getOccupiedCells(w.body);

    for (let cell of cells) {
      if (cell.x === x && cell.y === y) {
        Composite.remove(engine.world, w.body);
        wallArray.splice(i, 1);
        return;
      }
    }
  }

  // delete contraptions
  for (let i = contrArray.length - 1; i >= 0; i--) {
    const c = contrArray[i];
    const cells = getOccupiedCells(c.body);

    for (let cell of cells) {
      if (cell.x === x && cell.y === y) {
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
      if (cell.x === x && cell.y === y) {
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
    deleteCell(cell.x, cell.y);
  }
}

function deleteOutOfBounds() {
  for (let i = ballArray.length - 1; i >= 0; i--) { // delete if ball goes out of bounds
    let b = ballArray[i];
    let pos = b.body.position;

    if (
      pos.y > rows * CELL_SIZE + 200 || 
      pos.x < -200 ||
      pos.x > cols * CELL_SIZE + 200
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
    if (!(w instanceof Ramp)) continue;

    const collisions = Matter.Query.collides(ball.body, [w.body]);
    if (collisions.length === 0) continue;

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

      const strength = 0.0008;

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
      let x = col * CELL_SIZE + CELL_SIZE / 2;
      let y = row * CELL_SIZE + CELL_SIZE / 2;
      square(x, y, CELL_SIZE);
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
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = CELL_SIZE / 2 - CELL_SIZE / 5;
    this.color = "red";
    let options = { restitution: 0.5, frictionAir: 0 };
    this.body = Bodies.circle(this.x, this.y, this.radius, options);
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
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.color = "black";
    this.options = { isStatic: true,  friction: 0, frictionStatic: 0};
  }
}

class Block extends Wall {
  constructor(x, y, angle) {
    super(x, y, angle);
    this.width = CELL_SIZE;
    this.body = Bodies.rectangle(this.x, this.y, this.width, this.width, this.options);

    Composite.add(engine.world, this.body);
  }

  display() {    
    push();
    rectMode(CENTER);
    fill(this.color);
    square(this.x, this.y, this.width);
    pop();
  }
}

class Ramp extends Wall {
  constructor(cellX, cellY, angleIndex = 0) {
    // angleIndex: 0 = 0, 1 = 90, 2 = 180, 3 = 270
    super(cellX, cellY, angleIndex * Math.PI / 2);

    this.cellCenter = { x: cellX, y: cellY };
    this.angleIndex = angleIndex; 

    // Build the body
    this.buildBody();
  }

  buildBody() {
    // creates new triangle for rotation purposes
    let vertices = [
      { x: 0, y: CELL_SIZE },       // bottom-left
      { x: CELL_SIZE, y: CELL_SIZE }, // bottom-right
      { x: CELL_SIZE, y: 0 }        // top-right
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
      x: this.cellCenter.x + (CELL_SIZE / 2 - diagMid.x - CELL_SIZE / 2),
      y: this.cellCenter.y + (CELL_SIZE / 2 - diagMid.y - CELL_SIZE / 2)
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
  constructor(x, y, width) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.color = "red"; 
    let options = { isStatic: true };
    this.body = Matter.Bodies.rectangle(this.x, this.y, this.width, this.width, options);
    this.body.label = "goal";

    Matter.Composite.add(engine.world, this.body);
  }

  display() {
    push();
    rectMode(CENTER);
    fill(this.color);
    square(this.x, this.y, this.width);
    pop();
  }
}

class Contraption {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  rotateLeft() {
    this.tryRotate(-Math.PI / 12);
  }

  rotateRight() {
    this.tryRotate(Math.PI / 12);
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
  constructor(x, y, angle) {
    super(x, y, angle);
    this.color = "purple";
    this.width = CELL_SIZE - CELL_SIZE / 5;
    this.height = CELL_SIZE / 5;
    let options = { isStatic: true };
    this.body = Bodies.rectangle(this.x, this.y, this.width, this.height, options);    

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
    let speed = Math.max(15, incoming * 1.2);

    Matter.Body.setVelocity(ball.body, {
      x: Math.sin(angle) * speed,
      y: -Math.cos(angle) * speed
    });
  }
}

class Fan extends Contraption {
  constructor(x, y, angle) {
    super(x, y, angle);
    this.color = "grey";
    this.width = CELL_SIZE * 2 - 2 * CELL_SIZE / 5;
    this.height = CELL_SIZE / 5;
    this.strength = 0.025;
    let options = { isStatic: true};
    this.body = Bodies.rectangle(this.x, this.y, this.width, this.height, options);
    Matter.Body.setAngle(this.body, this.angle);

    Composite.add(engine.world, this.body);
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
      if (hit.body !== this.body && hit.body !== ball.body) {
        return; // airflow blocked
      }
    }

    // Strength falls off with distance from fan
    const distance = Math.abs(perp);
    const strength = this.strength / (distance * 0.05 + 1);

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
    let flowLength = CELL_SIZE * 3;

    let speed = 2;
    let offset = frameCount * speed % 20;

    for (let i = 0; i < numStreams; i++) {
      let x = -this.width / 2 + i * spacing;

      for (let y = -this.height/2 - offset; y > -flowLength; y -= 20) {
        
        // fade based on distance from fan
        let fade = 150 * map(y, -this.height/2, -flowLength, 1, 0);

        stroke(0, 150, 255, fade);

        // shaft
        line(x, y, x, y - CELL_SIZE / 5);

        // arrow head
        line(x, y - CELL_SIZE / 5, x - CELL_SIZE / 12.5, y - CELL_SIZE / 12.5);
        line(x, y - CELL_SIZE / 5, x + CELL_SIZE / 12.5, y - CELL_SIZE / 12.5);
      }
    }
    pop();
  }
}

class Conveyor extends Contraption {
  constructor(x, y, angle) {
    super(x, y, angle);
    this.color = "green";
    this.width = CELL_SIZE * 3 - 2 * CELL_SIZE / 5;
    this.height = CELL_SIZE / 5;
    this.sideForce = 0.0025;
    let options = { isStatic: true };
    this.body = Bodies.rectangle(this.x, this.y, this.width, this.height, options);
    this.body.label = "conveyor";
    Matter.Body.setAngle(this.body, this.angle);

    Composite.add(engine.world, this.body);
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
    let numSegments = this.width / CELL_SIZE;
    for (let i = 1; i < numSegments; i++) {
      let x = -this.width / 2 + i * CELL_SIZE;
      line(x, -this.height / 2, x, this.height / 2);
    }

    // arrows
    stroke("white");
    fill("white");

    let spacing = CELL_SIZE;
    let offset = frameCount * 1.5 % spacing;

    for (let x = -this.width/2 + offset; x < this.width/2; x += spacing) {
      line(x - CELL_SIZE / 5, 0, x + CELL_SIZE / 5, 0);     
      line(x + CELL_SIZE / 5, 0, x + CELL_SIZE / 12.5, -CELL_SIZE / 12.5);    
      line(x + CELL_SIZE / 5, 0, x + CELL_SIZE / 12.5,  CELL_SIZE / 12.5);
    }

    pop();
  }
}