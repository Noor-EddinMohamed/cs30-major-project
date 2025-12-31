// Rube Goldberg Machine Game
// Noor-Eddin Mohamed
// January 19 2026

// matter.js aliases
const { Engine, Runner, Bodies, Composite } = Matter;

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
      handleTrampCollision(pair);
    }
  }
  Matter.Events.on(engine, "collisionStart", onCollision);
}

function handleTrampCollision(pair) {
  let bodyA = pair.bodyA;
  let bodyB = pair.bodyB;

  let ball = null;
  let tramp = null;

  for (let b of ballArray) {
    if (b.body === bodyA || b.body === bodyB) {
      ball = b;
      break;
    }
  }

  for (let c of contrArray) {
    if (c instanceof Trampoline) {
      if (c.body === bodyA || c.body === bodyB) {
        tramp = c;
        break;
      }
    }
  }

  if (!ball || !tramp) return;

  let angle = tramp.body.angle;

  // bounce physics
  let vyBall = ball.body.velocity.y;
  let speed = Math.max(10, Math.abs(vyBall) * 1.2);; 

  let vx = Math.sin(angle) * speed;
  let vy = -Math.cos(angle) * speed;

  Matter.Body.setVelocity(ball.body, { x: vx, y: vy });
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

class Contraption {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  rotateLeft() {
    this.angle = (this.angle - 15) % 360;
    Matter.Body.setAngle(this.body, this.angle * (Math.PI/180));

  }
  rotateRight() {
    this.angle = (this.angle + 15) % 360;
    Matter.Body.setAngle(this.body, this.angle * (Math.PI/180));
  }
}

class Trampoline extends Contraption {
  constructor(x, y, angle) {
    super(x, y, angle)
    this.color = "purple";
    this.width = CELL_SIZE;
    this.height = CELL_SIZE / 5;
    let options = { isStatic: true };
    this.body = Bodies.rectangle(this.x, this.y, this.width, this.height, options);
    this.body.label = "trampoline";
    Matter.Body.setAngle(this.body, this.angle * (Math.PI/180));

    Composite.add(engine.world, this.body);

  }

  rotate() {
    super.rotate();
    Matter.Body.setAngle(this.body, this.angle * (Math.PI / 180));
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
}