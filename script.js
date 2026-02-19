const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const INTERNAL_WIDTH = 960;
const INTERNAL_HEIGHT = 540;

canvas.width = INTERNAL_WIDTH;
canvas.height = INTERNAL_HEIGHT;
canvas.style.width = "100vw";
canvas.style.height = "100vh";

ctx.imageSmoothingEnabled = false;
canvas.style.imageRendering = "pixelated";

const WORLD_WIDTH = 60000;
const GROUND_Y = canvas.height * 0.75;
const GRAVITY = 0.6;

let keys = {};
let score = 0;
let gameOver = false;
let timeOfDay = 0;

document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);
const bgImage = new Image();
bgImage.src = "assets/bgd8.jpeg";

const boatSprite = new Image();
boatSprite.src = "assets/boat.png";

const playerSprite = new Image();
let playerLoaded = false;

playerSprite.onload = () => {
  playerLoaded = true;
};

playerSprite.src = "assets/shagun.png";

const bridgeSprite = new Image();
let bridgeLoaded = false;

bridgeSprite.onload = () => {
  bridgeLoaded = true;
};

bridgeSprite.src = "assets/bridge.png";




function randomColor() {
  const palette = ["#B22222","#8B0000","#A52A2A","#D2691E","#CD5C5C","#9C3B3B"];
  return palette[Math.floor(Math.random()*palette.length)];
}

const BUILDING_WIDTH = 90;
const buildingLayout = [];

for (let x=0; x<WORLD_WIDTH; x+=BUILDING_WIDTH) {
  buildingLayout.push({
    x,
    width: BUILDING_WIDTH,
    height: 180 + Math.random()*120,
    color: randomColor(),
    roofType: Math.floor(Math.random()*3)
  });
}

class Cloud {
  constructor(x,y,speed){
    this.x=x;
    this.y=y;
    this.speed=speed;
    this.size=25+Math.random()*4;
  }
  update(){
    this.x+=this.speed;
    if(this.x>WORLD_WIDTH+200) this.x=-200;
  }
  draw(cameraX){
    const drawX = this.x - cameraX * 0.3;
    const s = this.size;

    ctx.fillStyle = "#fff";

    // wider base
    ctx.fillRect(drawX, this.y, s*2, s);
    ctx.fillRect(drawX + s, this.y - s, s*2, s);
    ctx.fillRect(drawX + s*3, this.y, s*2, s);
  }
}

let clouds=[];
for(let i=0;i<20;i++){
  clouds.push(new Cloud(Math.random()*WORLD_WIDTH,60+Math.random()*150,0.2+Math.random()*0.3));
}

class Splash {
  constructor(x,y){
    this.x=x;
    this.y=y;
    this.life=20;
  }
  update(){ this.y+=1; this.life--; }
  draw(cameraX){
    ctx.fillStyle="#fff";
    ctx.fillRect(this.x-cameraX,this.y,4,4);
  }
}

let splashes=[];

class Boat {
  constructor(){
    this.x=200;
    this.y=GROUND_Y;
    this.scale = 3;   // adjust size
    this.width = 32 * this.scale;
    this.height = 32 * this.scale;

    this.dx=0;
    this.dy=0;
    this.accel=0.6;
    this.friction=0.85;
    this.jumpPower=-13;
    this.maxJumps=2;
    this.jumpsLeft=2;
  }

  update(){
    if(keys["ArrowRight"]||keys["KeyD"]) this.dx+=this.accel;
    if(keys["ArrowLeft"]||keys["KeyA"]) this.dx-=this.accel;

    this.dx*=this.friction;
    this.x+=this.dx;

    if((keys["Space"]||keys["ArrowUp"])&&!this.jumpHeld){
      if(this.jumpsLeft>0){
        this.dy=this.jumpPower;
        this.jumpsLeft--;
      }
      this.jumpHeld=true;
    }
    if(!(keys["Space"]||keys["ArrowUp"])) this.jumpHeld=false;

    this.dy+=GRAVITY;
    this.y+=this.dy;

    if(this.y>=GROUND_Y-this.height){
      if(this.dy>8){
        for(let i=0;i<6;i++){
          splashes.push(new Splash(this.x+Math.random()*this.width,GROUND_Y));
        }
      }
      this.y=GROUND_Y-this.height;
      this.dy=0;
      this.jumpsLeft=this.maxJumps;
    }

    this.x=Math.max(0,Math.min(WORLD_WIDTH-this.width,this.x));
  }

  draw(cameraX){

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(
    this.x - cameraX + this.width * 0.2,
    GROUND_Y - 5,
    this.width * 0.6,
    6
  );

  // draw boat
  ctx.drawImage(
    boatSprite,
    this.x - cameraX,
    this.y,
    this.width,
    this.height
  );

  // draw player ON boat
  if (playerLoaded) {

    const playerScale = 2.5;   // smaller
    const pW = playerSprite.width * playerScale;
    const pH = playerSprite.height * playerScale;

    // position player so feet sit on boat top
    const playerX = this.x - cameraX + this.width/2 - pW/2;
    const playerY = this.y +0*pH + 5;   // 5px adjustment

    ctx.drawImage(
      playerSprite,
      playerX,
      playerY,
      pW,
      pH
    );
  }
}




}

class Bridge {
  constructor(x){
    this.width=120;
    this.height=50+Math.random()*40;
    this.x=x;
    this.y=GROUND_Y-this.height;
  }

  // draw(cameraX){
  //   const px=6;
  //   const drawX=this.x-cameraX;

  //   ctx.fillStyle="#555";
  //   for(let y=this.y+this.height/2;y<this.y+this.height;y+=px){
  //     for(let x=drawX;x<drawX+this.width;x+=px){
  //       ctx.fillRect(x,y,px,px);
  //     }
  //   }

  //   ctx.fillStyle="#444";
  //   const centerX=drawX+this.width/2;
  //   const radius=this.width/2;
  //   for(let angle=Math.PI;angle<Math.PI*2;angle+=0.1){
  //     const x=centerX+Math.cos(angle)*radius;
  //     const y=this.y+this.height/2+Math.sin(angle)*radius;
  //     ctx.fillRect(Math.floor(x/px)*px,Math.floor(y/px)*px,px,px);
  //   }
  // }
  draw(cameraX){

  const px = 6;
  const drawX = Math.floor(this.x - cameraX);
  const topY = Math.floor(this.y);

  const width = this.width;
  const height = this.height;

  // --- STONE BASE (brick pattern) ---
  for (let y = 0; y < height/2; y += px) {
    for (let x = 0; x < width; x += px) {

      // alternating brick offset
      const offset = ((y/px) % 2) * (px/2);

      ctx.fillStyle = (x/px + y/px) % 2 === 0
        ? "#6E6E6E"
        : "#7C7C7C";

      ctx.fillRect(
        drawX + x + offset,
        topY + height/2 + y,
        px,
        px
      );
    }
  }

  // --- ARCH ---
  const centerX = drawX + width/2;
  const radius = width/2;

  for (let angle = Math.PI; angle < 2*Math.PI; angle += 0.05) {
    const x = centerX + Math.cos(angle) * radius;
    const y = topY + height/2 + Math.sin(angle) * radius;

    ctx.fillStyle = "#5C5C5C";

    ctx.fillRect(
      Math.floor(x/px)*px,
      Math.floor(y/px)*px,
      px,
      px
    );
  }

  // --- ARCH INNER SHADOW ---
  for (let angle = Math.PI; angle < 2*Math.PI; angle += 0.05) {
    const x = centerX + Math.cos(angle) * (radius - px);
    const y = topY + height/2 + Math.sin(angle) * (radius - px);

    ctx.fillStyle = "#3F3F3F";

    ctx.fillRect(
      Math.floor(x/px)*px,
      Math.floor(y/px)*px,
      px,
      px
    );
  }

  // --- TOP RAIL ---
  ctx.fillStyle = "#8A8A8A";
  ctx.fillRect(drawX, topY, width, px*2);

  // --- OUTLINE ---
  ctx.strokeStyle = "#2A2A2A";
  ctx.lineWidth = 2;
  ctx.strokeRect(drawX, topY, width, height);
}


  collides(boat){
    return boat.x<this.x+this.width &&
           boat.x+boat.width>this.x &&
           boat.y+boat.height>this.y+this.height/2;
  }
}

class Pancake {
  constructor(x){
    this.size=20;
    this.x=x;
    this.y=GROUND_Y-150-Math.random()*80;
    this.collected=false;
  }
  draw(cameraX){
  if (this.collected) return;

  const x = Math.floor(this.x - cameraX);
  const baseY = Math.floor(this.y);
  const px = 4; // pixel block size

  // slight float animation
  const float = Math.sin(Date.now() * 0.004) * 3;
  const y = baseY + float;

  // --- BOTTOM PANCAKE (largest) ---
  ctx.fillStyle = "#D89A4A";
  ctx.fillRect(x, y, 8*px, 2*px);

  // rounded edges
  ctx.fillRect(x - px, y + px/2, px, px);
  ctx.fillRect(x + 8*px, y + px/2, px, px);

  // --- MIDDLE PANCAKE ---
  ctx.fillStyle = "#E8B265";
  ctx.fillRect(x + px, y - 2*px, 6*px, 2*px);

  ctx.fillRect(x, y - px, px, px);
  ctx.fillRect(x + 7*px, y - px, px, px);

  // --- TOP PANCAKE ---
  ctx.fillStyle = "#F2C57C";
  ctx.fillRect(x + 2*px, y - 4*px, 4*px, 2*px);

  ctx.fillRect(x + px, y - 3*px, px, px);
  ctx.fillRect(x + 6*px, y - 3*px, px, px);

  // --- BUTTER ---
  ctx.fillStyle = "#FFD700";
  ctx.fillRect(x + 3.5*px, y - 6*px, 2*px, 2*px);

  ctx.fillStyle = "#FFF4A3"; // butter highlight
  ctx.fillRect(x + 3.5*px, y - 6*px, px, px);

  // --- SYRUP ---
  ctx.fillStyle = "#7A3E12";

  // top spread
  ctx.fillRect(x + 2*px, y - 4*px, 4*px, px);

  // drips
  ctx.fillRect(x + 2*px, y - 3*px, px, 2*px);
  ctx.fillRect(x + 5*px, y - 3*px, px, 3*px);

  // --- OUTLINE ---
  ctx.strokeStyle = "#5A2E0F";
  ctx.lineWidth = 2;
  ctx.strokeRect(x - px, y - 6*px, 10*px, 8*px);
}


  check(boat){
    if(this.collected) return;
    if(boat.x<this.x+this.size &&
       boat.x+boat.width>this.x &&
       boat.y<this.y+this.size &&
       boat.y+boat.height>this.y){
      this.collected=true;
      score++;
      document.getElementById("score").innerText="Pancakes: "+score;
    }
  }
}

const boat=new Boat();
let bridges=[];
let pancakes=[];

for(let i=700;i<WORLD_WIDTH;i+=800) bridges.push(new Bridge(i));
for(let i=500;i<WORLD_WIDTH;i+=600) pancakes.push(new Pancake(i));

function drawSky(){
  const day=Math.sin(timeOfDay)*0.5+0.5;
  const top=`rgb(${20+100*day},${40+150*day},${80+170*day})`;
  const bottom=`rgb(${50+150*day},${80+170*day},${120+200*day})`;

  const gradient=ctx.createLinearGradient(0,0,0,GROUND_Y);
  gradient.addColorStop(0,top);
  gradient.addColorStop(1,bottom);
  ctx.fillStyle=gradient;
  ctx.fillRect(0,0,canvas.width,GROUND_Y);
}

function drawWater(){
  const tile=8;
  for(let y=GROUND_Y;y<canvas.height;y+=tile){
    for(let x=0;x<canvas.width;x+=tile){
      const wave=Math.sin((x+Date.now()*0.002)*0.02);
      ctx.fillStyle=(x/tile+y/tile)%2===0 ? "#1C86EE" : (wave>0?"#1874CD":"#104E8B");
      ctx.fillRect(x,y,tile,tile);
    }
  }
}

function drawBuildings(cameraX){
  buildingLayout.forEach(b=>{
    const drawX=b.x-cameraX*0.5;
    ctx.fillStyle=b.color;
    ctx.fillRect(drawX,GROUND_Y-b.height,b.width,b.height);

    const night=Math.sin(timeOfDay)<0;
    const rows=Math.floor(b.height/50);
    for(let r=0;r<rows;r++){
      ctx.fillStyle=night && Math.random()>0.5 ? "#FFD700" : "#111";
      ctx.fillRect(drawX+15,GROUND_Y-b.height+20+r*45,b.width-30,25);
    }

    ctx.strokeStyle="#000";
    ctx.strokeRect(drawX,GROUND_Y-b.height,b.width,b.height);

    ctx.globalAlpha=0.2;
    ctx.fillRect(drawX,GROUND_Y,b.width,b.height*0.3);
    ctx.globalAlpha=1;
  });
}

function drawBackground(cameraX) {
  const parallax = cameraX * 0.2;

  // Stretch factor (increase this to stretch more)
  const stretchFactor = 1.54;  

  const drawHeight = GROUND_Y * stretchFactor;
  const imgWidth = drawHeight * (bgImage.width / bgImage.height);

  const x = -parallax % imgWidth;

  for (let i = -1; i < canvas.width / imgWidth + 2; i++) {
    ctx.drawImage(
      bgImage,
      x + i * imgWidth,
      0,
      imgWidth,
      drawHeight
    );
  }
}


function drawCRT(){
  ctx.fillStyle="rgba(0,0,0,0.1)";
  for(let y=0;y<canvas.height;y+=4){
    ctx.fillRect(0,y,canvas.width,2);
  }
}

function update(){
  if(gameOver) return;

  timeOfDay+=0.002;
  boat.update();
  clouds.forEach(c=>c.update());
  splashes.forEach(s=>s.update());
  splashes=splashes.filter(s=>s.life>0);

  bridges.forEach(b=>{
    if(b.collides(boat)){
      gameOver=true;
      document.getElementById("gameOver").classList.remove("hidden");
    }
  });

  pancakes.forEach(p=>p.check(boat));
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  let cameraX=boat.x-canvas.width/2;
  cameraX=Math.max(0,Math.min(WORLD_WIDTH-canvas.width,cameraX));

  drawSky();

  drawBuildings(cameraX);

  drawBackground(cameraX);   // bgd.jpg (over buildings)

  clouds.forEach(c => c.draw(cameraX));   // clouds ABOVE bg image

  // drawWater();

  bridges.forEach(b => b.draw(cameraX));
  pancakes.forEach(p => p.draw(cameraX));
  splashes.forEach(s => s.draw(cameraX));

  boat.draw(cameraX);

  // drawCRT();
}

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

document.addEventListener("keydown",e=>{
  if(e.code==="KeyR"&&gameOver) location.reload();
});

loop();
