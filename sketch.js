let seaweedArray = [];
let bubbles = [];
const seaweedColors = ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff'];

function setup() {
  // 建立全螢幕畫布
  let canvas = createCanvas(windowWidth, windowHeight);
  // 將畫布固定在最上層，但設定 pointer-events: none 讓滑鼠可以操作下方的網頁
  canvas.style('position', 'fixed');
  canvas.style('top', '0');
  canvas.style('left', '0');
  canvas.style('z-index', '10');
  canvas.style('pointer-events', 'none');

  // 在 p5 畫布後方產生 iframe 並連結至指定網站
  let iframe = createElement('iframe');
  iframe.attribute('src', 'https://www.et.tku.edu.tw');
  iframe.style('position', 'fixed');
  iframe.style('top', '0');
  iframe.style('left', '0');
  iframe.style('width', '100vw');
  iframe.style('height', '100vh');
  iframe.style('border', 'none');
  iframe.style('z-index', '1');

  // 利用陣列初始化 50 根水草的屬性
  for (let i = 0; i < 50; i++) {
    // 均衡分佈在視窗寬度內
    let baseX = (width / 50) * i + (width / 100);
    let c = color(random(seaweedColors));
    c.setAlpha(150); // 設定透明特效

    seaweedArray.push({
      x: baseX + random(-20, 20),
      h: random(height * 0.3, height * 0.66), // 高度不超過視窗 2/3
      w: random(10, 30), // 將粗細調整為 10 到 30 之間，使其更纖細
      color: c,
      noiseOffset: random(1000),
      noiseSpeed: random(0.005, 0.015) // 每根搖晃速度不同
    });
  }
}

function draw() {
  clear(); // 清除畫布以維持透明背景
  // 背景顏色 #caf0f8，透明度設定為 0.2 (255 * 0.2 ≈ 51)
  background(202, 240, 248, 51);

  blendMode(BLEND);

  // 繪製所有水草
  for (let sw of seaweedArray) {
    drawSeaweed(sw);
  }

  // 隨機產生上升的水泡
  if (random(1) < 0.04) {
    bubbles.push(new Bubble());
  }

  // 更新與呈現水泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    if (bubbles[i].isFinished) {
      bubbles.splice(i, 1);
    }
  }
}

function drawSeaweed(sw) {
  noFill();
  stroke(sw.color);
  strokeWeight(sw.w);
  strokeCap(ROUND);

  beginShape();
  // curveVertex 需要起點與終點的控制點來確保圓滑
  curveVertex(sw.x, height + 100);
  curveVertex(sw.x, height);

  let segments = 8;
  for (let j = 1; j <= segments; j++) {
    let y = lerp(height, height - sw.h, j / segments);
    // 利用 noise 與 map 根據每根水草的頻率計算搖晃位移
    let sway = map(noise(sw.noiseOffset + j * 0.1 + frameCount * sw.noiseSpeed), 0, 1, -80, 80);
    curveVertex(sw.x + sway, y);
  }

  // 頂部控制點
  curveVertex(sw.x, height - sw.h - 100);
  endShape();
}

class Bubble {
  constructor() {
    this.x = random(width);
    this.y = height + 50;
    this.size = random(10, 30);
    this.speed = random(1, 4);
    this.popY = random(height * 0.2, height * 0.7); // 設定破掉的高度
    this.isPopping = false;
    this.popTimer = 0;
    this.isFinished = false;
  }

  update() {
    if (!this.isPopping) {
      this.y -= this.speed;
      this.x += sin(frameCount * 0.05 + this.popY) * 0.5; // 輕微水平晃動
      if (this.y < this.popY) this.isPopping = true;
    } else {
      this.popTimer++;
      if (this.popTimer > 15) this.isFinished = true;
    }
  }

  display() {
    if (!this.isPopping) {
      noStroke();
      // 水泡主體：白色，透明度 0.5
      fill(255, 255, 255, 127);
      ellipse(this.x, this.y, this.size);
      // 水泡上方亮點：白色，透明度 0.7
      fill(255, 255, 255, 178);
      ellipse(this.x - this.size * 0.2, this.y - this.size * 0.2, this.size * 0.3);
    } else {
      // 破裂效果：產生向外擴散並淡出的圓圈
      noFill();
      stroke(255, 255, 255, map(this.popTimer, 0, 15, 180, 0));
      strokeWeight(2);
      ellipse(this.x, this.y, this.size + this.popTimer * 4);
    }
  }
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}
