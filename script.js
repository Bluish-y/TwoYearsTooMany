const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const TILE_SIZE = 32;
const MAP_WIDTH = 20;
const MAP_HEIGHT = 15;

canvas.width = MAP_WIDTH * TILE_SIZE;
canvas.height = MAP_HEIGHT * TILE_SIZE;

const player = {
  x: 5,
  y: 5,
  speed: 1
};

const keys = {};

const minigameZones = [
  { x: 10, y: 7 },
  { x: 3, y: 12 }
];

const playerImg = new Image();
playerImg.src = "assets/player.png";

window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

function update() {
  if (document.getElementById("minigameUI").classList.contains("hidden")) {
    if (keys["ArrowUp"]) player.y -= player.speed;
    if (keys["ArrowDown"]) player.y += player.speed;
    if (keys["ArrowLeft"]) player.x -= player.speed;
    if (keys["ArrowRight"]) player.x += player.speed;

    player.x = Math.max(0, Math.min(MAP_WIDTH - 1, player.x));
    player.y = Math.max(0, Math.min(MAP_HEIGHT - 1, player.y));

    checkMinigameTrigger();
  }
}

function checkMinigameTrigger() {
  for (let zone of minigameZones) {
    if (player.x === zone.x && player.y === zone.y) {
      openMinigame();
    }
  }
}

function openMinigame() {
  document.getElementById("minigameUI").classList.remove("hidden");
}

function closeMinigame() {
  document.getElementById("minigameUI").classList.add("hidden");
}

function drawGrid() {
  ctx.fillStyle = "#3a9d23";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#2e7d1a";
  for (let x = 0; x < MAP_WIDTH; x++) {
    for (let y = 0; y < MAP_HEIGHT; y++) {
      ctx.strokeRect(
        x * TILE_SIZE,
        y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      );
    }
  }

  ctx.fillStyle = "red";
  for (let zone of minigameZones) {
    ctx.fillRect(
      zone.x * TILE_SIZE,
      zone.y * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE
    );
  }
}

function drawPlayer() {
  ctx.drawImage(
    playerImg,
    player.x * TILE_SIZE,
    player.y * TILE_SIZE,
    TILE_SIZE,
    TILE_SIZE
  );
}

function loop() {
  update();
  drawGrid();
  drawPlayer();
  requestAnimationFrame(loop);
}

playerImg.onload = () => {
  loop();
};
