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
}

function mousePressed() {
  let x = Math.floor(mouseX/CELL_SIZE);
  let y = Math.floor(mouseY/CELL_SIZE);

  let theWall = new Wall(mouseX, mouseY);
  wallArray.push(theWall);
}

function showGrid() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      fill("white");
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
    this.diameter = 50;
    this.color = "red";
    this.dx = dx;
    this.dy = dy;
  }
  
  update() {
    this.x += this.dx;
    this.y += this.dy;
  }

  display() {

  }
}

class Wall {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = CELL_SIZE;
    let options = { isStatic: true };
    this.body = Bodies.rectangle(this.x, this.y, this.w, this.w, options);

    Composite.add(engine.world, this.body);
  }

  display() {    
    rectMode(CENTER);
    fill("black");
    square(this.x, this.y, this.w);
  }
}