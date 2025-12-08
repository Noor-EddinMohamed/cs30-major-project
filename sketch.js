// Rube Goldberg Machine Game
// Noor-Eddin Mohamed
// January 19 2026

// matter.js aliases
let Engine = Matter.Engine,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite;

let engine;
let world;
let runner;

let theGrid;
const CELL_SIZE = 100;
let rows;
let cols;

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
  background(220);
  Engine.update(engine);
  showGrid();
}

function showGrid() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (theGrid[y][x] === 1) {
        fill("black");
      }
      else if (theGrid[y][x] === 0) {
        fill("white");
      }
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
    this.size = CELL_SIZE;
    this.color = "black";
  }
}
