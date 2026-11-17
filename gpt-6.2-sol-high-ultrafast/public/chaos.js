const phases = [
  { clicks: 0, name: "Ожидание", colors: ["#e1fb48"] },
  { clicks: 1, name: "Искра", colors: ["#e1fb48", "#ffdc73", "#fbfff0"] },
  { clicks: 6, name: "Цепная реакция", colors: ["#64ffae", "#8decff", "#e1fb48", "#fbfff0"] },
  { clicks: 16, name: "Перегрев", colors: ["#ff924f", "#ff51ad", "#ffdb46", "#affb65", "#63eaff"] },
  { clicks: 32, name: "Абсурд", colors: ["#ff79da", "#9afffa", "#a69bff", "#eaff55", "#ffa953", "#ff5269"] },
];

const root = document.documentElement;
const trigger = document.querySelector("#trigger");
const reset = document.querySelector("#reset");
const count = document.querySelector("#count");
const chamberState = document.querySelector("#chamber-state");
const phaseRows = document.querySelectorAll("[data-phase]");
const announcement = document.querySelector("#announcement");
const heatMeter = document.querySelector("#heat-meter");
const heatFill = document.querySelector("#heat-fill");
const heatValue = document.querySelector("#heat-value");
const canvas = document.querySelector("#effects");
const ctx = canvas.getContext("2d");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

const sparks = [];
const waves = [];
const flyers = [];
const absurdities = [
  "🛸", "ФИЗИКА УВОЛИЛАСЬ", "🦆", "УТКА В РЕАКТОРЕ", "🪩",
  "ЕЩЁ ЗАЕБИСТЕЕ", "🐙", "ПОТОЛОК ОТМЕНЁН", "🍌", "ВСЕЛЕННАЯ КАЧАЕТ",
];

const tau = 2 * Math.PI;
const random = (min, max) => min + Math.random() * (max - min);
const choose = (items) => items[Math.floor(Math.random() * items.length)];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

let clicks = 0;
let phase = 0;
let combo = 0;
let lastClick = -Infinity;
let frame = 0;
let width = 0;
let height = 0;

function updateReadout() {
  const nextPhase = phases.findLastIndex((item) => clicks >= item.clicks);
  const heat = Math.min(100, Math.round(100 * (clicks / 38) ** .8));
  const value = `${heat}%`;

  count.value = String(clicks).padStart(3, "0");
  heatMeter.value = heat;
  heatMeter.textContent = value;
  heatFill.style.setProperty("--heat", value);
  heatValue.textContent = value;
  reset.disabled = clicks === 0;

  if (phase !== nextPhase) {
    phaseRows[phase].removeAttribute("aria-current");
    phase = nextPhase;
    phaseRows[phase].setAttribute("aria-current", "step");
    root.dataset.phase = phase;
    chamberState.textContent = phases[phase].name.toUpperCase();
    announcement.textContent = `Стадия — ${phases[phase].name}.`;
  }
}

function burst(now, x, y, radius, power) {
  const colors = phases[phase].colors;
  const amount = Math.round(14 + phase * 9 + power * 2);
  const angleOffset = random(0, tau);

  for (let index = 0; index < amount; index++) {
    const angle = angleOffset + (index * tau) / amount + random(-.16, .16);
    const distance = random(.19, 1) * radius * (.82 + power * .13);
    const speed = random(90, 190) + phase * 65 + power * 30;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    sparks.push({
      start: now,
      life: random(480, 970) + phase * 210 + power * 55,
      x: x + cos * distance,
      y: y + sin * distance,
      vx: cos * speed,
      vy: sin * speed,
      gravity: random(18, 90) * phase,
      size: random(1.7, 4 + phase),
      color: choose(colors),
      shape: phase === 1 ? 0 : index % (phase === 2 ? 2 : 4),
    });
  }

  const waveCount = phase < 3 ? phase : 3;
  for (let index = 0; index < waveCount; index++) {
    waves.push({
      start: now + index * 72,
      life: 680 + phase * 180 + index * 150,
      x, y, radius,
      reach: 135 + phase * 50 + power * 27,
      color: colors[(clicks + index) % colors.length],
      angle: angleOffset + index * .29,
      shape: index === 0 ? 0 : 3 + (clicks + index) % 5,
    });
  }

  if (phase === 4 || (phase === 3 && clicks % 3 === 0)) {
    const text = phase === 4 ? absurdities[(clicks - phases[phase].clicks) % absurdities.length] : "ПЕРЕГРЕВ!";
    const side = clicks % 2 === 0 ? 1 : -1;
    const size = clamp(width * .066, 20, 52);
    const horizontalRoom = width / 2 - radius - 22;
    flyers.push({
      start: now,
      life: phase === 4 ? 2150 : 1600,
      x: horizontalRoom > 160 ? clamp(x + side * radius * random(1.9, 2.9), width * .19, width * .81) : width / 2,
      y: clamp(y + (horizontalRoom > 160 ? random(-1.35, 1.35) : side * 1.4) * radius, 48, height - 36),
      side,
      size,
      color: choose(colors),
      text,
    });
  }
}

function quietBurst(now, x, y, radius) {
  const angle = clicks * 2.4;
  waves.push({
    start: now,
    life: 1200,
    x: x + Math.cos(angle) * radius * 1.32,
    y: y + Math.sin(angle) * radius * 1.32,
    color: choose(phases[phase].colors),
    size: 5 + phase * 2,
  });
}

function drawSpark(spark, progress) {
  const time = (progress * spark.life) / 1000;
  const drag = 1 - Math.exp(-2.3 * time);
  const x = spark.x + spark.vx * drag;
  const y = spark.y + spark.vy * drag + spark.gravity * time * time;
  const fade = (1 - progress) ** 1.45;
  const size = spark.size * (.5 + fade * .5);

  ctx.globalAlpha = fade;
  ctx.fillStyle = ctx.strokeStyle = spark.color;
  ctx.lineWidth = Math.max(1, size * .55);
  ctx.beginPath();

  switch (spark.shape) {
    case 0:
      ctx.moveTo(x, y);
      ctx.lineTo(x - spark.vx * .12 * fade, y - spark.vy * .12 * fade);
      ctx.stroke();
      break;
    case 1:
      ctx.moveTo(x - size, y);
      ctx.lineTo(x, y + size * 1.55);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x, y - size * 1.55);
      ctx.fill();
      break;
    case 2:
      ctx.moveTo(x - size, y);
      ctx.lineTo(x + size, y);
      ctx.moveTo(x, y - size);
      ctx.lineTo(x, y + size);
      ctx.stroke();
      break;
    case 3:
      ctx.arc(x, y, size * .48, 0, tau);
      ctx.fill();
      break;
  }
}

function drawWave(wave, progress) {
  const { x, y, color, angle, shape } = wave;
  if (reducedMotion.matches) {
    ctx.fillStyle = color;
    ctx.globalAlpha = .85;
    ctx.fillRect(x - wave.size / 2, y - wave.size / 2, wave.size, wave.size);
    return;
  }

  const radius = wave.radius * .95 + progress ** .72 * wave.reach;
  const fade = (1 - progress) ** 1.6;
  ctx.globalAlpha = fade * .75;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1 + 3 * fade;
  ctx.beginPath();

  if (shape === 0) {
    ctx.arc(x, y, radius, 0, tau);
  } else {
    for (let index = 0; index < shape; index++) {
      const corner = angle + (index * tau) / shape + progress * .45;
      ctx.lineTo(x + Math.cos(corner) * radius, y + Math.sin(corner) * radius);
    }
    ctx.closePath();
  }
  ctx.stroke();

  ctx.globalAlpha = fade * .35;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, radius * 1.08, angle + progress, angle + progress + Math.PI * 1.16);
  ctx.stroke();
}

function drawFlyer(flyer, progress) {
  const rise = Math.min(1, progress * 9);
  const x = flyer.x + flyer.side * 21 * progress;
  const maxWidth = 2 * Math.min(x, width - x) - 28;
  if (maxWidth <= 0) return;

  ctx.save();
  ctx.translate(x, flyer.y - progress * 57);
  ctx.rotate(flyer.side * (.17 - progress * .4));
  ctx.globalAlpha = rise * (1 - progress ** 3);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${flyer.size * (.72 + rise * .28)}px "Golos Text", system-ui, sans-serif`;
  ctx.lineWidth = 5;
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#131510";
  ctx.fillStyle = flyer.color;
  ctx.strokeText(flyer.text, 0, 0, maxWidth);
  ctx.fillText(flyer.text, 0, 0, maxWidth);
  ctx.restore();
}

function renderBatch(items, draw, now) {
  let alive = 0;

  for (const item of items) {
    const progress = (now - item.start) / item.life;
    if (progress >= 1) continue;
    items[alive++] = item;
    if (progress >= 0) draw(item, progress);
  }

  items.length = alive;
}

function draw(now) {
  ctx.clearRect(0, 0, width, height);
  renderBatch(waves, drawWave, now);
  renderBatch(sparks, drawSpark, now);
  renderBatch(flyers, drawFlyer, now);
  ctx.globalAlpha = 1;
  frame = sparks.length || waves.length || flyers.length ? requestAnimationFrame(draw) : 0;
}

function resetEffects() {
  cancelAnimationFrame(frame);
  frame = 0;
  sparks.length = 0;
  waves.length = 0;
  flyers.length = 0;
  ctx?.clearRect(0, 0, width, height);
}

function resizeCanvas() {
  if (!ctx) return;
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function launch() {
  const now = performance.now();
  const interval = now - lastClick;
  combo = interval < 500 ? Math.min(9, combo + 1) : 0;
  lastClick = now;
  clicks++;
  updateReadout();

  if (!ctx) return;
  const { left, top, width: diameter, height: buttonHeight } = trigger.getBoundingClientRect();
  const x = left + diameter / 2;
  const y = top + buttonHeight / 2;
  const radius = diameter / 2;
  const power = combo * .6 + Math.log2(1 + clicks / 16);
  if (reducedMotion.matches) {
    quietBurst(now, x, y, radius);
  } else {
    burst(now, x, y, radius, power);
  }

  // Limit old effects so long click streaks stay responsive.
  sparks.splice(0, Math.max(0, sparks.length - 1250));
  waves.splice(0, Math.max(0, waves.length - 42));
  flyers.splice(0, Math.max(0, flyers.length - 8));
  if (!frame) frame = requestAnimationFrame(draw);
}

trigger.addEventListener("click", launch);
reset.addEventListener("click", () => {
  clicks = 0;
  combo = 0;
  lastClick = -Infinity;
  if (document.activeElement === reset) trigger.focus({ preventScroll: true });
  resetEffects();
  updateReadout();
});

document.addEventListener("keydown", (event) => {
  if (event.code !== "Space" || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.target !== document.body && event.target !== root) return;
  event.preventDefault();
  if (!event.repeat) trigger.click();
});

addEventListener("resize", resizeCanvas);
reducedMotion.addEventListener("change", resetEffects);
resizeCanvas();
