const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const background = new Image();
background.src = "assets/concert.jpg";

const waldoImg = new Image();
waldoImg.src = "assets/waldo.png";

let waldoX, waldoY;
let waldoSize = 50;

let startTime;
let timerInterval;
let found = false;

background.onload = () => {
  canvas.width = background.width;
  canvas.height = background.height;

  placeWaldo();
  drawScene();
  startTimer();
};

function placeWaldo() {
  waldoX = Math.random() * (canvas.width - waldoSize);
  waldoY = Math.random() * (canvas.height - waldoSize);
}

function drawScene() {
  ctx.drawImage(background, 0, 0);
  ctx.drawImage(waldoImg, waldoX, waldoY, waldoSize, waldoSize);
}

canvas.addEventListener("click", (e) => {
  if (found) return;

  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left);
  const y = (e.clientY - rect.top);

  if (
    x >= waldoX &&
    x <= waldoX + waldoSize &&
    y >= waldoY &&
    y <= waldoY + waldoSize
  ) {
    found = true;
    document.getElementById("message").innerText = "You found Waldo!";
    clearInterval(timerInterval);

    ctx.strokeStyle = "red";
    ctx.lineWidth = 5;
    ctx.strokeRect(waldoX, waldoY, waldoSize, waldoSize);
  }
});

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById("timer").innerText = "Time: " + elapsed;
  }, 1000);
}

document.getElementById("restart").addEventListener("click", () => {
  found = false;
  document.getElementById("message").innerText = "";
  placeWaldo();
  drawScene();
  startTimer();
});
