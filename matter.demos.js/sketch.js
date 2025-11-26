// matter.js demo

//aliases
let Engine = Matter.Engine,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Runner = Matter.Runner;

let engine;
let world;
let boxBody;
let runner;

function setup() {
  createCanvas(windowWidth, windowHeight);
  engine = Engine.create();
  world = engine.world;
  boxBody = Bodies.rectangle(400, 200, 80, 80);
  
  runner = Runner.create();
  Runner.run(runner, engine);
  World.add(world, boxBody);
}

function draw() {
  background(220);

  rect(boxBody.position.x, boxBody.position.y, 80, 80);
}