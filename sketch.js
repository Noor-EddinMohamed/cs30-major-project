// Rube Goldberg Machine Game
// Noor-Eddin Mohamed
// Date

let theGrid;
const SQUARE_DIMENSIONS = 4;
let cellSize = 100;

function setup() {
  createCanvas(windowWidth, windowHeight);
  theGrid = generateEmptyGrid(SQUARE_DIMENSIONS, SQUARE_DIMENSIONS);
}

function draw() {
  background(220);
  showGrid();
}

function showGrid() {
  for (let y = 0; y < SQUARE_DIMENSIONS; y++) {
    for (let x = 0; x < SQUARE_DIMENSIONS; x++) {
      if (theGrid[y][x] === 1) {
        fill("black");
      }
      else if (theGrid[y][x] === 0) {
        fill("white");
      }
      square(x * cellSize, y * cellSize, cellSize);
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
