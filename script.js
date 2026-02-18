const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const TILE = 32;
const VIEW_WIDTH = 15;
const VIEW_HEIGHT = 10;

canvas.width = VIEW_WIDTH * TILE;
canvas.height = VIEW_HEIGHT * TILE;

/* ================= MAP ================= */

const map = [
  "############################",
  "#............T............#",
  "#............T............#",
  "#.........................#",
  "#.....G...................#",
  "#.........................#",
  "#............T............#",
  "#.........................#",
  "#.........................#",
  "############################",
];

const MAP_W = map[0].length;
const MAP_H = map.length;

/*
# = tree (wall)
. = grass
G = minigame tile
T = tree
*/

/* ================= PLAYER ================= */

const player = {
  x: 5,
  y: 5,
  dir: 0, // 0 down,1 left,2 right,3 up
  frame: 0,
  moving: false,
};

const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

const sprite = new Image();
sprite.src = "assets/player/test_player.png";

/* ================= CAMERA ================= */

function getCamera() {
  let camX = player.x - Math.floor(VIEW_WIDTH / 2);
  let camY = player.y - Math.floor(VIEW_HEIGHT / 2);

  camX = Math.max(0, Math.min(MAP_W - VIEW_WIDTH, camX));
  camY = Math.max(0, Math.min(MAP_H - VIEW_HEIGHT, camY));

  return { camX, camY };
}

/* ================= COLLISION ================= */

function isBlocked(x, y) {
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return true;
  return map[y][x] === "#" || map[y][x] === "T";
}

/* ================= UPDATE ================= */

let moveCooldown = 0;

function update() {
  if (moveCooldown > 0) {
    moveCooldown--;
    return;
  }

  let nx = player.x;
  let ny = player.y;

  if (keys["ArrowUp"]) {
    ny--;
    player.dir = 3;
  } else if (keys["ArrowDown"]) {
    ny++;
    player.dir = 0;
  } else if (keys["ArrowLeft"]) {
    nx--;
    player.dir = 1;
  } else if (keys["ArrowRight"]) {
    nx++;
    player.dir = 2;
  } else {
    player.moving = false;
    return;
  }

  if (!isBlocked(nx, ny)) {
    player.x = nx;
    player.y = ny;
    player.moving = true;
    player.frame = (player.frame + 1) % 3;
    moveCooldown = 8;
    checkMinigame();
  }
}

/* ================= MINIGAME ================= */

function checkMinigame() {
  if (map[player.y][player.x] === "G") {
    alert("Minigame triggered!");
  }
}

/* ================= DRAW ================= */

function drawMap(camX, camY) {
  for (let y = 0; y < VIEW_HEIGHT; y++) {
    for (let x = 0; x < VIEW_WIDTH; x++) {

      let mapX = x + camX;
      let mapY = y + camY;

      const tile = map[mapY][mapX];

      if (tile === "#" || tile === "T") {
        ctx.fillStyle = "#2f5d1c"; // tree
      } else if (tile === "G") {
        ctx.fillStyle = "#d4af37"; // special tile
      } else {
        ctx.fillStyle = "#4caf50"; // grass
      }

      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }
  }
}

function drawPlayer(camX, camY) {
  const screenX = (player.x - camX) * TILE;
  const screenY = (player.y - camY) * TILE;

  ctx.drawImage(
    sprite,
    player.frame * 32,
    player.dir * 32,
    32,
    32,
    screenX,
    screenY,
    TILE,
    TILE
  );
}

/* ================= LOOP ================= */

function loop() {
  update();

  const { camX, camY } = getCamera();

  drawMap(camX, camY);
  drawPlayer(camX, camY);

  requestAnimationFrame(loop);
}

sprite.onload = () => loop();
