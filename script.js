const scoreDiv = document.getElementById("scoreDiv");
const highScoreDiv = document.getElementById("highScoreDiv");
const statusDiv = document.getElementById("status");
const startBtn = document.getElementById("startBtn");
const canvas = document.getElementById("game-area");
const context = canvas.getContext("2d");
let food = {};
const snake = [];
const snakeStartLength = 5;
const baseInterval = 100;
let snakeDirection = "right";
let keyPress = "";
let highScore = 0;
const hasLocalStorage = storageAvailable('localStorage')
if (hasLocalStorage) {
  try {
    const highScoreString = window.localStorage.getItem('snakeHighScore');
    if (highScoreString != null) {
      console.log('loaded high score from storage:', highScoreString);
      highScore = parseInt(highScoreString)
      highScoreDiv.innerHTML = `High Score: ${highScore}`;
    } else {
      console.log('loaded high score from storage, was NULL');
    }
  } catch (e) {
    console.log('Exception reading storage')
    console.log(e.message)
    console.log(e.stack)
  }
} else {
  console.log('localStorage not supported');
}

// Set the canvas size to 400x400
canvas.width = 400;
canvas.height = 400;

function moveSnake() {
  var head = { x: snake[0].x, y: snake[0].y };

  // Update the head position based on the current direction
  if (snakeDirection == "right") head.x++;
  else if (snakeDirection == "left") head.x--;
  else if (snakeDirection == "up") head.y--;
  else if (snakeDirection == "down") head.y++;

  // Add the new head to the snake
  snake.unshift(head);

  // Check if the snake ate the food
  if (snake[0].x == food.x && snake[0].y == food.y) {
    createFood();
  } else {
    // If the snake didn't eat the food, remove the last unit
    snake.pop();
  }
}

function checkCollision() {
  // Check if the snake hit the edges
  if (
    snake[0].x == -1 ||
    snake[0].x == 40 ||
    snake[0].y == -1 ||
    snake[0].y == 40
  ) {
    return true;
  }

  // Check if the snake hit its own body
  for (var i = 1; i < snake.length; i++) {
    if (snake[0].x == snake[i].x && snake[0].y == snake[i].y) {
      return true;
    }
  }

  // no collision
  return false;
}

function createFood() {
  food = {
    x: Math.floor(Math.random() * 40),
    y: Math.floor(Math.random() * 40),
  };

  // Check if the food spawned on the snake
  for (var i = 0; i < snake.length; i++) {
    if (food.x == snake[i].x && food.y == snake[i].y) {
      return createFood();
    }
  }
}

function drawSnake() {
  for (var i = 0; i < snake.length; i++) {
    context.fillStyle = `hsl(${(180 + i * 13) % 360}deg 100% 50%)`;
    context.fillRect(snake[i].x * 10, snake[i].y * 10, 10, 10);
  }
}

function drawFood() {
  context.fillStyle = "LimeGreen";
  context.fillRect(food.x * 10, food.y * 10, 10, 10);
}

// Handle arrow key presses to change the direction of the snake
function keydownHandler(event) {
  switch (event.key) {
    case "ArrowLeft":
    case "ArrowRight":
    case "ArrowUp":
    case "ArrowDown":
      keyPress = event.key;
      // It was an arrow key meant for our game, don't let it move the window
      event.preventDefault();
  }
}

function updateSnakeDirection() {
  if (keyPress == "ArrowLeft" && snakeDirection != "right")
    snakeDirection = "left";
  else if (keyPress == "ArrowUp" && snakeDirection != "down")
    snakeDirection = "up";
  else if (keyPress == "ArrowRight" && snakeDirection != "left")
    snakeDirection = "right";
  else if (keyPress == "ArrowDown" && snakeDirection != "up")
    snakeDirection = "down";

  // we read the last keyPress, now clear it so we don't read it again
  keyPress = "";
}

function gameLoop() {
  // Read the last key pressed and update the direction accordingly
  updateSnakeDirection();
  // Move the snake in the current direction
  moveSnake();

  // Check if the snake hit the edges or its own body
  let collision = checkCollision();
  if (collision) {
    statusDiv.innerHTML = "Game Over!";
    startBtn.disabled = false;
    // stop listening for keydown events
    document.removeEventListener("keydown", keydownHandler);
  } else {
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the snake and food on the canvas
    drawSnake();
    drawFood();
    updateScore();

    setTimeout(gameLoop, baseInterval);
  }
}

function updateScore() {
  let score = snake.length - snakeStartLength;
  if (score > highScore) {
    highScore = score;
    if (hasLocalStorage) {
      try {
        console.log('saving high score');
        window.localStorage.setItem('snakeHighScore', highScore.toString())
      } catch (e) {
        console.error('Exception setting storage');
        console.error(e);
      }
    }
  }
  highScoreDiv.innerHTML = `High Score: ${highScore}`;
  scoreDiv.innerHTML = `Score: ${score}`;
}

function start() {
  startBtn.disabled = true;
  statusDiv.innerHTML = "";
  // Create/reset the initial snake
  snake.length = 0;
  snakeDirection = "right";
  for (let i = snakeStartLength - 1; i >= 0; i--) {
    snake.push({ x: i + 1, y: 1 });
  }

  // Create the initial food
  createFood();

  // start listening for keydown events
  document.addEventListener("keydown", keydownHandler);

  // Set the game loop to run every 100ms
  setTimeout(gameLoop, baseInterval);
}

function storageAvailable(type) {
  let storage;
  try {
    storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
}