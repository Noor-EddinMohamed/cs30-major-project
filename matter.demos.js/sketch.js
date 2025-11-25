// matter.js demo

//aliases
let Engine = Matter.Engine,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Runner = Matter.Runner;

let engine;
let world;
let box1;

function setup() {
  createCanvas(windowWidth, windowHeight);
  engine = Engine.create();
  world = engine.world;
  box1 = Bodies.rectangle(400, 200, 80, 80);
  Runner.run(engine);
  World.add(world, box1);
}

function draw() {
  background(220);

  rect(box1.position.x, box1.position.y, 80, 80);
}
