// Game Variables
const gameSpeed = 2;
const gameSpeedIncrementor = 0.75;
const maxLives = 2;
let lives = maxLives;
let gameFrames = 0;
let gameOver = false;
let dead = false;
let score = 0;
let animateId;

// Displays
const titleScreen = document.querySelector(".game-intro");
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// Background Vars
const bgImg = new Image();
bgImg.src = "../images/road_new_thx_fabrizio.png";
const bgImg2 = new Image();
bgImg2.src = "../images/road_new_thx_fabrizio.png";
let bg1Y = 0;
let bg2Y = -canvas.height;
let bgSpeed = gameSpeed;

// Player Vars
const playerImg = new Image();
playerImg.src = "../images/car.png";
const playerImgWidth = 80;
const playerImgHeight = 140;
// --- Player Position + Movement
const playerSpeedX = 5;
const playerSpeedY = 2.5;
let playerPosX = 250 - playerImgWidth / 2;
let playerPosY = 700 - playerImgHeight - 10;
let playerMoveLeft = false;
let playerMoveRight = false;
let playerMoveUp = false;
let playerMoveDown = false;

// Obstacles
const obstaclesArray = [];
const minSpawnAfterFrames = 150;
const maxSpawnAfterFrames = 80;
let spawnAfterFrames = minSpawnAfterFrames;
let spawnFrames = 0;

class Obstacle {
  constructor(startX, startY, width, height, color) {
    	this.x = startX;
      this.y = startY;
      this.startWidth = width;
      this.startHeight = height;
      this.startColor = color;
      this.speedX = 0;
      this.speedY = gameSpeed;
  }

  updateObstacle() {
    ctx.beginPath()
    ctx.fillStyle = "black";
    ctx.fillRect(this.x - 5, this.y - 5, this.startWidth + 10, this.startHeight + 10, this.startColor);
    ctx.fillStyle = this.startColor;
    ctx.fillRect(this.x, this.y, this.startWidth, this.startHeight, this.startColor);
    ctx.closePath();
  }

  collisionCheck() {
    
  }
}

window.onload = () => {

}

window.onload = () => {
  document.getElementById('start-button').onclick = () => {
    startGame();
  };
  
  function cacheImages(imgArray) {
    if (!cacheImages.list) {
      cacheImages.list = [];
    }
    let list = cacheImages.list;
    for (let i = 0; i < imgArray.length; i++) {
      let img = new Image();
      img.onload = function() {
        let index = list.indexOf(this);
        if (index !== -1) {
          list.splice(index, 1);
        }
      }
      list.push(img);
      img.src = imgArray[i];
    }
  }
  cacheImages(["../images/car.png"]);

  // Game Animation
  function animate() {
    // Reset
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gameOverButton = document.querySelector(".btn-game-over");
    if (gameOverButton) {
      gameOverButton.parentNode.removeChild(gameOverButton);
    }

    gameFrames++;

    // Background
    ctx.drawImage(bgImg, 0, bg1Y, canvas.width, canvas.height);
    ctx.drawImage(bgImg2, 0, bg2Y, canvas.width, canvas.height);
    bg1Y += bgSpeed;
    bg2Y += bgSpeed;
    if (bg1Y >= canvas.height) bg1Y = bg2Y + -canvas.height;
    if (bg2Y >= canvas.height) bg2Y = bg1Y + -canvas.height;

    // Player
    ctx.drawImage(playerImg, playerPosX, playerPosY, playerImgWidth, playerImgHeight)
    // --- Player Movement
    if (playerMoveRight && playerPosX < canvas.width - playerImgWidth) {
      playerPosX += playerSpeedX;
    }
    if (playerMoveLeft && playerPosX > 0) {
      playerPosX -= playerSpeedX;
    }
    if (playerMoveDown && playerPosY < canvas.height - playerImgHeight) {
      playerPosY += playerSpeedY;
    }
    if (playerMoveUp && playerPosY > 0) {
      playerPosY -= playerSpeedY;
    }

    // UI
    drawUI();
    // Obstacles
    updateObstacles();
    // Collision
    checkCollision();

    // Gameplay loop
    if (!gameOver && !dead) {
      if (gameFrames % 360 === 0) bgSpeed += gameSpeedIncrementor;
      animateId = requestAnimationFrame(animate);
    } else if (!gameOver && dead) {
      cancelAnimationFrame(animateId);
      setTimeout(gameRetry, 1500);
    } else {
      cancelAnimationFrame(animateId);
      setTimeout(gameOverScreen, 3000)
    }
  }

  // Player Inputs
  document.addEventListener("keydown", e => {
    switch (e.key) {
      case "ArrowLeft":
      case "a": 
        playerMoveLeft = true;
        break;
      case "ArrowRight":
      case "d": 
        playerMoveRight = true;
        break;
      case "ArrowUp":
      case "w": 
        playerMoveUp = true;
        break;
      case "ArrowDown":
      case "s": 
        playerMoveDown = true;
        break;
      default:
        break;
    }
  })
  document.addEventListener("keyup", (e) => {
    switch (e.key) {
      case "ArrowLeft":
      case "a": 
        playerMoveLeft = false;
        break;
      case "ArrowRight":
      case "d": 
        playerMoveRight = false;
        break;
      case "ArrowUp":
      case "w": 
        playerMoveUp = false;
        break;
      case "ArrowDown":
      case "s": 
        playerMoveDown = false;
        break;
      default:
        break;
    }
  })

  // Player <-> Obstacle Collision
  function checkCollision() {
    const playerLeft = playerPosX;
    const playerRight = playerPosX + playerImgWidth;
    const playerTop = playerPosY;
    const playerBottom = playerPosY + playerImgHeight;

    for (let i = 0; i < obstaclesArray.length; i++) {
      const oLeft = obstaclesArray[i].x;
      const oRight = obstaclesArray[i].x + obstaclesArray[i].startWidth;
      const oTop = obstaclesArray[i].y;
      const oBottom = obstaclesArray[i].y + obstaclesArray[i].startHeight;
      
      if (playerLeft < oRight && playerRight > oLeft && playerTop < oBottom && playerBottom > oTop) {
        if (lives === 0) {
          gameOver = true;
        } else {
          dead = true;
        }
      }
    }
  }

  // Spawn Obstacles
  function updateObstacles() {
    for (let i = 0; i < obstaclesArray.length; i++) {
      obstaclesArray[i].y += bgSpeed;
      obstaclesArray[i].updateObstacle();

      // remove obstacles from array
      if (obstaclesArray[i].y >= canvas.height) {
        score++;
        obstaclesArray.splice(i, 1);
      }
    }

    spawnFrames++;
    if (spawnFrames >= spawnAfterFrames) {

      const minWidth = 30;
      const minHeight = 20;
      const maxWidth = 200;
      const maxHeight = 30;

      const randomWidth = Math.floor(Math.random() * (maxWidth - minWidth + 1) + minWidth);
      const randomHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
      const randomStartX = Math.random() * (canvas.width - randomWidth);
      const startY = -25;

      obstaclesArray.push(new Obstacle(randomStartX, startY, randomWidth, randomHeight, "red"));
      spawnFrames = 0;

      // Increase difficulty
      if (spawnAfterFrames >= maxSpawnAfterFrames) {
        spawnAfterFrames -= 2;
      }

    }
  }

  function startGame() {
    // Hide title screen
    titleScreen.style.display = "none";
    canvas.style.border = "1px solid";
    animate();
  }

  function gameRetry() {
    // Reduce lives
    lives--;
    dead = false;
    bgSpeed = gameSpeed;
    spawnAfterFrames = minSpawnAfterFrames;

    // Remove obstacles
    obstaclesArray.splice(0, obstaclesArray.length);

    // Reset Player
    playerPosX = canvas.width / 2 - playerImg.width / 4;
    playerPosY = canvas.height - playerImg.height;
    playerMoveLeft = false;
    playerMoveRight = false;
    playerMoveUp = false;
    playerMoveDown = false;
    
    animateId = requestAnimationFrame(animate);
  }
  
  function drawUI() {
    // Score
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.font = "bold 32px serif";
    ctx.fillText(`Score: ${score}`, 25, 50);
    ctx.closePath();

    // Extra Lives
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.font = "bold 32px serif";
    ctx.fillText(`Lives: ${lives}`, canvas.width - 125, 50);
    ctx.closePath();
 
  }
    
  function retryButton() {
    const retryButton = document.createElement("button");
    retryButton.innerHTML = "Retry";
    retryButton.classList.add("btn-game-over");
    retryButton.onclick = () => {
      dead = false;
      gameOver = false;
      lives = maxLives;
      score = 0;
      bgSpeed = gameSpeed;
      spawnAfterFrames = minSpawnAfterFrames;
      // Remove obstacles
      obstaclesArray.splice(0, obstaclesArray.length);
  
      // Reset Player
      playerPosX = canvas.width / 2 - playerImg.width / 4;
      playerPosY = canvas.height - playerImg.height;
      playerMoveLeft = false;
      playerMoveRight = false;
      playerMoveUp = false;
      playerMoveDown = false;

      startGame();
    }
    document.body.appendChild(retryButton);
  }

  function gameOverScreen() {
    ctx.beginPath()
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.font = "bold 48px serif"
    ctx.fillText(`GAME OVER!`, canvas.width / 4 - 45, canvas.height / 2);
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.font = "bold 32px serif"
    ctx.fillText(`Your final score is: ${score}`, canvas.width / 4 - 30, canvas.height / 2 + 50);
    ctx.closePath();

    retryButton();
  }
};