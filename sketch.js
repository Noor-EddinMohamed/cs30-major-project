// Rube Goldberg Machine Game
// Noor-Eddin Mohamed
// January 19 2026

// for matter.js
let Engine = Matter.Engine,
  Runner = Matter.Runner,
  World = Matter.World,
  Composite = Matter.Composite;
let engine;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // matter.js setup
  engine = Matter.Engine.create(); // creates engine 
  world = engine.world; // creates world for engine to run in
  Runner.run(engine); // runs engine
}

function draw() {
  background(220);
}