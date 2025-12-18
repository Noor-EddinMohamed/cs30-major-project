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
}

function toggleCell(x, y) {
  if (setting === "wall") {
    let theWall = new Wall(x, y);
    wallArray.push(theWall);
  }
  else if (setting === "ball") {
    let theBall = new Ball(x, y);
    ballArray.push(theBall);
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
    let options = { restitution: 0.9, friction: 0.25 };
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