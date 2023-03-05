document.addEventListener("keydown", keyHandler, false);
const canvas = document.getElementById("game-area");
const statusDiv = document.getElementById("status");
const startBtn = document.getElementById("startBtn");
const highScoreDiv = document.getElementById("highScoreDiv");
const scoreDiv = document.getElementById("scoreDiv");
const context = canvas.getContext("2d");
const gridSize = 40;
const blockWidth = canvas.width / gridSize;
const blockHeight = canvas.height / gridSize;
const snakeStartLength = 5;

let food = {};
let snake = [];
let direction = "right";
let score = 0;
let highScore = 0;

function keyHandler(e) {
  if (e.key === "ArrowRight") {
    direction = "right";
  } else if (e.key === "ArrowLeft") {
    direction = "left";
  } else if (e.key === "ArrowDown" && direction !== "up") {
    direction = "down";
  } else if (e.key === "ArrowUp") {
    direction = "up";
  }
}

function start() {
  startBtn.disabled = true;
  statusDiv.innerHTML = "";
  score = 0;
  scoreDiv.innerHTML = "Score: " + score;
  context.clearRect(0, 0, canvas.width, canvas.height);
  // creating a snake block:
  snake.length = 0;
  for (let i = 0; i < snakeStartLength; i++) {
    snake.push({ x: 10 - i, y: 1 });
  }
  direction = "right";

  createFood();

  drawSnake();
  drawFood();

  setTimeout(tick, 100);
}

function drawBlock(block, color) {
  // block has an x and y coordinate
  context.fillStyle = color;
  context.fillRect(block.x * 10, block.y * 10, 10, 10);
}

function drawSnake() {
  for (let i = 0; i < snake.length; i++) {
    drawBlock(snake[i], "blue");
  }
}

function createFood() {
  // fill out the food variable
  food.x = Math.floor(Math.random() * gridSize);
  food.y = Math.floor(Math.random() * gridSize);
}

function drawFood() {
  drawBlock(food, "green");
}

function moveSnake() {
  let newHead = {};
  if (direction === "right") {
    newHead = { x: snake[0].x + 1, y: snake[0].y };
  } else if (direction === "left") {
    newHead = { x: snake[0].x - 1, y: snake[0].y };
  } else if (direction === "down") {
    newHead = { x: snake[0].x, y: snake[0].y + 1 };
  } else if (direction === "up") {
    newHead = { x: snake[0].x, y: snake[0].y - 1 };
  }

  snake.unshift(newHead);
  // check if newHead is on the food
  if (newHead.x === food.x && newHead.y === food.y) {
    // snake ate food
    createFood();
    score++;
    scoreDiv.innerHTML = "Score: " + score;
    if (score > highScore) {
      highScore = score;
      highScoreDiv.innerHTML = "High Score: " + highScore;
    }
  } else {
    // snake didn't eat food
    snake.pop();
  }
}

function checkCollision() {
  // Check collision with wall
  let head = snake[0];
  if (head.x === -1 || head.x === 40 || head.y === -1 || head.y === 40) {
    return true;
  }
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      return true;
    }
  }
  return false;
}

// main game loop, called every 100 milliseconds
function tick() {
  moveSnake();

  let collision = checkCollision();
  if (collision) {
    statusDiv.innerHTML = "Game over!";
    startBtn.disabled = false;
  } else {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake();
    drawFood();
    setTimeout(tick, 100);
  }
}