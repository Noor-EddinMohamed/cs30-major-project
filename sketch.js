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
}

function draw() {
  background("white");
  Engine.update(engine);
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

function getOccupiedCells(body) {
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
  for (let b of ballArray) {
    let occupiedCells = getOccupiedCells(b.body);
    for (let cell of occupiedCells) {
      if (cell.x === x && cell.y === y) {
        return true;
      }
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
  if (isCellOccupied(x, y)) {
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
    let options = { restitution: 1, friction: 0.1, isStatic: true };
    this.body = Bodies.rectangle(this.x, this.y, this.width, this.height, options);
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