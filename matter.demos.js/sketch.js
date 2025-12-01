// matter.js demo

//aliases
let Engine = Matter.Engine,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Runner = Matter.Runner;

let engine;
let world;
let runner;

let boxBodies = [];
let ground;

function setup() {
  createCanvas(windowWidth, windowHeight);
  engine = Engine.create();
  world = engine.world;
  let option = {
    isStatic: true
  };
  ground = Bodies.rectangle(width / 2, height / 2, width, 10, option);
  World.add(world, ground);

  runner = Runner.create();
  Runner.run(runner, engine);
  World.add(world, boxObj);

  boxBody = new boxObj(200, 100, 50, 50);
}

function draw() {
  background("black");
  for (let i = 0; i < boxBodies.length; i++) {
    boxBodies[i].show();
  }
  fill("white");
  strokeWeight(3);
  line(0, height, width, height);
}

function mousePressed() {
  boxBodies.push(new boxObj(mouseX, mouseY, 20, 20));
}