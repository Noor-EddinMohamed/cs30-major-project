// Rube Goldberg Machine Game
// Noor-Eddin Mohamed
// January 19 2026

// matter.js aliases
const { Engine, Runner, Bodies, Composite, Query } = Matter;

// matter.js variables
let engine;
let world;
let runner;

// 2d array variables
let theGrid;
const CELL_SIZE = 50;
let rows;
let cols;

let wallArray = [];
let ballArray = [];
let contrArray = [];

let setting = "wall";

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

  // ball-trampoline collision function
  function onCollision(event) {
    for (let pair of event.pairs) {
      onTrampCollision(pair);
    }
  }
  Matter.Events.on(engine, "collisionStart", onCollision);
}

function handleCollision(pair) {
  let bodyA = pair.bodyA;
  let bodyB = pair.bodyB;

  for (let c of contrArray) {
    if (c.body === bodyA || c.body === bodyB) {
      c.onCollision(pair);
    }
  }
}

function draw() {
  background("white");
  Engine.update(engine);
  deleteOutOfBounds();
  showGrid();

  for (let someWall of wallArray) {
    someWall.display();
  }
  for (let someBall of ballArray) {
    someBall.display();
  }
  for (let someContr of contrArray) {
    someContr.display();
    if (someContr instanceof Fan) {
      for (let ball of ballArray) {
        someContr.applyAirflow(ball);
      }
    }
  }
}

function mousePressed() {
  let x = Math.round(mouseX / CELL_SIZE) * CELL_SIZE;
  let y = Math.round(mouseY / CELL_SIZE) * CELL_SIZE;

  if (!isInsideGrid(x, y)) {
    return;
  }

  toggleCell(x, y);
}

function keyPressed() {
  if (key === "w") {
    setting = "wall";
  }
  else if (key === "b") {
    setting = "ball";
  }
  else if (key === "t") {
    setting = "tramp";
  }
  else if (key === "f") {
    setting = "fan";
  }
  else if (keyCode === LEFT_ARROW) {
    if (contrArray.length > 0) {
      contrArray[contrArray.length - 1].rotateLeft();
    }
  }
  else if (keyCode === RIGHT_ARROW) {
    if (contrArray.length > 0) {
      contrArray[contrArray.length - 1].rotateRight();
    }
  }
}

function isInsideGrid(x, y) {
  return (
    x >= 0 &&
    y >= 0 &&
    x < cols * CELL_SIZE &&
    y < rows * CELL_SIZE
  );
}

function getOccupiedCells(body) {
  // can't place stuff outside cells
  let bounds = body.bounds;
  let occupied = [];

  let startCol = Math.floor(bounds.min.x / CELL_SIZE);
  let endCol   = Math.floor(bounds.max.x / CELL_SIZE);
  let startRow = Math.floor(bounds.min.y / CELL_SIZE);
  let endRow   = Math.floor(bounds.max.y / CELL_SIZE);

  for (let i = startCol; i <= endCol; i++) {
    for (let j = startRow; j <= endRow; j++) {
      occupied.push({x: i * CELL_SIZE, y: j * CELL_SIZE});
    }
  }

  return occupied;
}

function isCellOccupied(x, y) {
  for (let w of wallArray) {
    if (w.x === x && w.y === y) {
      return true;
    }
  }
  for (let c of contrArray) {
    if (c.x === x && c.y === y) {
      return true;
    }
  }
  return false;
}

function toggleCell(x, y) {
  if (isCellOccupied(x, y)) { // delete if something already on that cell
    deleteCell(x, y);
    return;
  }
  
  if (setting === "wall") {
    let theWall = new Wall(x, y);
    wallArray.push(theWall);
  }
  else if (setting === "ball") {
    let theBall = new Ball(x, y);
    ballArray.push(theBall);
  }
  else if (setting === "tramp") {
    let theContr = new Trampoline(x, y, 0);
    contrArray.push(theContr);
  }
  else if (setting === "fan") {
    let theContr = new Fan(x, y, 0);
    contrArray.push(theContr);
  }
}

function deleteCell(x, y) {
    for (let i = contrArray.length - 1; i >= 0; i--) {
    if (contrArray[i].x === x && contrArray[i].y === y) {
      Composite.remove(engine.world, contrArray[i].body);
      contrArray.splice(i, 1);
      return; 
    }
  }

  for (let i = wallArray.length - 1; i >= 0; i--) {
    if (wallArray[i].x === x && wallArray[i].y === y) {
      Composite.remove(engine.world, wallArray[i].body);
      wallArray.splice(i, 1);
      return;
    }
  }

  for (let i = ballArray.length - 1; i >= 0; i--) {
    if (ballArray[i].x === x && ballArray[i].y === y) {
      Composite.remove(engine.world, ballArray[i].body);
      ballArray.splice(i, 1);
      return;
    }
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

function showGrid() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      fill("white");
      stroke("black");
      strokeWeight(1);
      rectMode(CENTER);
      square(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE);
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
    this.radius = CELL_SIZE / 2;
    this.color = "red";
    let options = { restitution: 0.5, friction: 0.1 };
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
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = CELL_SIZE;
    this.color = "black";
    let options = { isStatic: true };
    this.body = Bodies.rectangle(this.x, this.y, this.width, this.width, options);

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

function canRotate(body, allBodies) {
  // prevents rotation into other objects
  const collisions = Query.collides(body, allBodies);
  return collisions.length === 0;
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
    } else {
      this.angle = oldAngle + delta;
    }
  }
}

function onTrampCollision(pair) {
  let bodyA = pair.bodyA;
  let bodyB = pair.bodyB;

  // Find the ball involved
  let ball = null;
  for (let b of ballArray) {
    if (b.body === bodyA || b.body === bodyB) {
      ball = b;
    }
  }
  if (!ball) return;

  // Find the trampoline involved
  let tramp = null;
  for (let t of contrArray) {
    if (t instanceof Trampoline && (t.body === bodyA || t.body === bodyB)) {
      tramp = t;
      break;
    }
  }
  if (!tramp) return;

  let angle = tramp.body.angle; 
  let incoming = Math.abs(ball.body.velocity.y);
  let speed = Math.max(15, incoming * 1.2);

  Matter.Body.setVelocity(ball.body, {
    x: Math.sin(angle) * speed,
    y: -Math.cos(angle) * speed
  });
}
  

class Trampoline extends Contraption {
  constructor(x, y, angle) {
    super(x, y, angle)
    this.color = "purple";
    this.stroke = "black";
    this.width = CELL_SIZE;
    this.height = CELL_SIZE / 5;
    let options = { isStatic: true };
    this.body = Bodies.rectangle(this.x, this.y, this.width, this.height, options);
    this.body.label = "trampoline";
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
    stroke(this.stroke);
    rect(0, 0, this.width, this.height);
    pop();
  }
}

class Fan extends Contraption {
  constructor(x, y, angle) {
    super(x, y, angle);
    this.color = "grey";
    this.stroke = "black";
    this.width = CELL_SIZE * 2;
    this.height = CELL_SIZE / 5;
    this.strength = 0.05;
    let options = { isStatic: true};
    this.body = Bodies.rectangle(this.x, this.y, this.width, this.height, options);
    Matter.Body.setAngle(this.body, this.angle);

    Composite.add(engine.world, this.body)
  }

  rotate() {
    super.rotate();
    Matter.Body.setAngle(this.body, this.angle);
  }

  applyAirflow(ball) {
    const fanPos = this.body.position;
    const angle = this.body.angle;

    // Fan endpoints in world space
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
    if (proj < 0 || proj > fanLen) return;

    // Perpendicular distance to fan line (stackoverflow helped with the vector math here)
    const perp = ballVec.x * fanDir.y - ballVec.y * fanDir.x;

    // Only apply force if ball is on the active side (perp > 0)
    if (perp <= 0) return;

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
    stroke(this.stroke);
    fill(this.color);
    rect(0, 0, this.width, this.height);

    // airflow lines
    stroke('rgba(0, 150, 255, 0.3)');

    let numLines = 5; 
    let spacing = this.width / (numLines - 1);

    for (let i = 0; i < numLines; i++) {
      let x = -this.width/2 + i * spacing; 
      let yStart = -this.height / 2;        
      let yEnd = yStart - CELL_SIZE * 1.5; 
      line(x, yStart, x, yEnd);
    }
    pop();
  }
}