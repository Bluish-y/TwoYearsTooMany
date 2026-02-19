const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const WORLD_WIDTH = 6000;
const GROUND_Y = canvas.height * 0.75;
const GRAVITY = 0.6;

let keys = {};
let score = 0;
let gameOver = false;

document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// Load building sprites
const buildingImages = [];
const buildingLayout = [];
const BUILDING_WIDTH = 90;

function randomColor() {
  const palette = [
    "#B22222",
    "#8B0000",
    "#A52A2A",
    "#D2691E",
    "#CD5C5C",
    "#9C3B3B"
  ];
  return palette[Math.floor(Math.random() * palette.length)];
}

// Generate layout once
for (let x = 0; x < WORLD_WIDTH; x += BUILDING_WIDTH) {
  buildingLayout.push({
    x,
    width: BUILDING_WIDTH,
    height: 180 + Math.random() * 120,
    color: randomColor(),
    roofType: Math.floor(Math.random() * 3)
  });
}



for (let i = 11; i <= 16; i++) {
  const img = new Image();
  img.src = `assets/buildings/building${i}.png`;
  buildingImages.push(img);
}


class Boat {
  constructor() {
    this.x = 200;
    this.y = GROUND_Y - 40;
    this.width = 60;
    this.height = 30;

    this.dx = 0;
    this.dy = 0;

    this.accel = 0.6;
    this.friction = 0.85;

    this.jumpPower = -13;
    this.maxJumps = 2;
    this.jumpsLeft = 2;
  }

  update() {
    // Horizontal movement
    if (keys["ArrowRight"] || keys["KeyD"]) this.dx += this.accel;
    if (keys["ArrowLeft"] || keys["KeyA"]) this.dx -= this.accel;

    this.dx *= this.friction;
    this.x += this.dx;

    // Double jump
    if ((keys["Space"] || keys["ArrowUp"]) && !this.jumpHeld) {
      if (this.jumpsLeft > 0) {
        this.dy = this.jumpPower;
        this.jumpsLeft--;
      }
      this.jumpHeld = true;
    }

    if (!(keys["Space"] || keys["ArrowUp"])) {
      this.jumpHeld = false;
    }

    // Gravity
    this.dy += GRAVITY;
    this.y += this.dy;

    // Ground collision
    if (this.y >= GROUND_Y - this.height) {
      this.y = GROUND_Y - this.height;
      this.dy = 0;
      this.jumpsLeft = this.maxJumps;
    }

    this.x = Math.max(0, Math.min(WORLD_WIDTH - this.width, this.x));
  }

  draw(cameraX) {
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);

    ctx.fillStyle = "#fff";
    ctx.fillRect(this.x - cameraX + 20, this.y - 20, 20, 20);
  }
}

class Bridge {
  constructor(x) {
    this.width = 120;

    // Always jumpable height range
    this.height = 50 + Math.random() * 40; // 50–90px

    this.x = x;
    this.y = GROUND_Y - this.height;
  }

  draw(cameraX) {
    ctx.fillStyle = "#444";

    // Solid lower half
    ctx.fillRect(
      this.x - cameraX,
      this.y + this.height / 2,
      this.width,
      this.height / 2
    );

    // Arch
    ctx.beginPath();
    ctx.arc(
      this.x - cameraX + this.width / 2,
      this.y + this.height / 2,
      this.width / 2,
      Math.PI,
      0
    );
    ctx.fill();
  }

  collides(boat) {
    return (
      boat.x < this.x + this.width &&
      boat.x + boat.width > this.x &&
      boat.y + boat.height > this.y + this.height / 2
    );
  }
}

class Pancake {
  constructor(x) {
    this.size = 20;
    this.x = x;
    this.y = GROUND_Y - 150 - Math.random() * 80;
    this.collected = false;
  }

  draw(cameraX) {
    if (this.collected) return;

    ctx.fillStyle = "#F4A460";
    ctx.beginPath();
    ctx.arc(this.x - cameraX, this.y, this.size/2, 0, Math.PI*2);
    ctx.fill();
  }

  check(boat) {
    if (this.collected) return;

    if (
      boat.x < this.x + this.size &&
      boat.x + boat.width > this.x &&
      boat.y < this.y + this.size &&
      boat.y + boat.height > this.y
    ) {
      this.collected = true;
      score++;
      document.getElementById("score").innerText = "Pancakes: " + score;
    }
  }
}

const boat = new Boat();
let bridges = [];
let pancakes = [];

for (let i = 700; i < WORLD_WIDTH; i += 800) {
  bridges.push(new Bridge(i));
}

for (let i = 500; i < WORLD_WIDTH; i += 600) {
  pancakes.push(new Pancake(i));
}

function drawWater() {
  ctx.fillStyle = "#1E90FF";
  ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height);
}

function drawBuildings(cameraX) {

  buildingLayout.forEach(b => {

    const drawX = b.x - cameraX * 0.5; // parallax

    // Main body
    ctx.fillStyle = b.color;
    ctx.fillRect(drawX, GROUND_Y - b.height, b.width, b.height);

    // Roof styles
    ctx.fillStyle = "#333";

    if (b.roofType === 0) {
      // Triangle gable
      ctx.beginPath();
      ctx.moveTo(drawX, GROUND_Y - b.height);
      ctx.lineTo(drawX + b.width / 2, GROUND_Y - b.height - 40);
      ctx.lineTo(drawX + b.width, GROUND_Y - b.height);
      ctx.fill();
    }

    if (b.roofType === 1) {
      // Step gable
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(
          drawX + i * 10,
          GROUND_Y - b.height - 10 - i * 10,
          b.width - i * 20,
          10
        );
      }
    }

    if (b.roofType === 2) {
      // Bell gable curve
      ctx.beginPath();
      ctx.moveTo(drawX, GROUND_Y - b.height);
      ctx.quadraticCurveTo(
        drawX + b.width / 2,
        GROUND_Y - b.height - 50,
        drawX + b.width,
        GROUND_Y - b.height
      );
      ctx.fill();
    }

    // Windows
    ctx.fillStyle = "#111";

    const rows = Math.floor(b.height / 50);
    for (let r = 0; r < rows; r++) {
      ctx.fillRect(
        drawX + 15,
        GROUND_Y - b.height + 20 + r * 45,
        b.width - 30,
        25
      );
    }

    // Outline
    ctx.strokeStyle = "#000";
    ctx.strokeRect(drawX, GROUND_Y - b.height, b.width, b.height);
  });
}


function update() {
  if (gameOver) return;

  boat.update();

  bridges.forEach(b => {
    if (b.collides(boat)) {
      gameOver = true;
      document.getElementById("gameOver").classList.remove("hidden");
    }
  });

  pancakes.forEach(p => p.check(boat));
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  let cameraX = boat.x - canvas.width/2;
  cameraX = Math.max(0, Math.min(WORLD_WIDTH - canvas.width, cameraX));

  drawWater();
  drawBuildings(cameraX);

  bridges.forEach(b => b.draw(cameraX));
  pancakes.forEach(p => p.draw(cameraX));

  boat.draw(cameraX);
}

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

document.addEventListener("keydown", e=>{
  if(e.code==="KeyR" && gameOver) location.reload();
});

loop();
