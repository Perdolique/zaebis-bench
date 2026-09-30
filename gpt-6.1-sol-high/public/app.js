const canvas = document.querySelector('#effects');
const context = canvas.getContext('2d');
const button = document.querySelector('#make-good');
const countLabel = document.querySelector('#count');
const comboLabel = document.querySelector('#combo');
const levelLabel = document.querySelector('#level-name');
const levelNumber = document.querySelector('#level-number');
const intensityLabel = document.querySelector('#intensity');
const meter = document.querySelector('#meter-fill');
const universeLabel = document.querySelector('#universe');
const stateDot = document.querySelector('#state-dot');
const nextLabel = document.querySelector('#next-level');
const announcement = document.querySelector('#announcement');
const popups = document.querySelector('#popups');
const ambient = document.querySelector('.ambient');
const soundButton = document.querySelector('#sound');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');

const colors = ['#c4f55b', '#ba93ff', '#ff6eb4', '#56e9ed', '#ffcf64', '#f5f5ee'];
const stages = [
  { at: 0, name: 'Пока спокойно', state: 'В ожидании чуда' },
  { at: 1, name: 'Уже заебись', state: 'Стало заметно лучше' },
  { at: 5, name: 'Охуенно хорошо', state: 'Пошла жара' },
  { at: 12, name: 'Заебись в квадрате', state: 'Реальность поплыла' },
  { at: 25, name: 'Тотальный разнос', state: 'Законы физики отменены' },
  { at: 45, name: 'Космически заебись', state: 'Вселенная танцует' },
  { at: 75, name: 'Неприлично заебись', state: 'Абсурд вышел из чата' },
  { at: 120, name: 'Заебись за гранью ∞', state: 'Ты — причина Большого взрыва' },
];
const words = ['ЗАЕБИСЬ!', 'ЕЩЁ ЛУЧШЕ', 'ВОТ ЭТО ДА', 'РАЗНОС', 'ОХУЕННО', 'БОЛЬШЕ ХАОСА', 'КОСМОС ТВОЙ', 'РЕАЛЬНОСТЬ: ПОКА'];
const stickers = ['🪩', '🦄', '🛸', '🍌', '🪐', '🌈', '👽', '🦆', '🔥', '🦐'];
let clicks = 0;
let combo = 0;
let lastClick = -Infinity;
let particles = [];
let rings = [];
let beams = [];
let frame = 0;
let previousTime = 0;
let width = innerWidth;
let height = innerHeight;
let soundEnabled = false;
let audioContext;
let comboTimer;
let announceTimer;
let animations = new Set();

function random(min, max) {
  return min + Math.random() * (max - min);
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function resize() {
  width = innerWidth;
  height = innerHeight;
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  context?.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function updateDashboard() {
  const stageIndex = stages.findLastIndex(stage => clicks >= stage.at);
  const stage = stages[stageIndex];
  const nextStage = stages[stageIndex + 1];
  countLabel.textContent = clicks.toLocaleString('ru-RU');
  levelNumber.textContent = `LVL ${String(Math.floor(clicks / 5)).padStart(2, '0')}`;
  levelLabel.textContent = stage.name;
  universeLabel.textContent = stage.state;
  intensityLabel.textContent = `${(clicks * 4).toLocaleString('ru-RU')}%`;
  meter.style.width = `${Math.min(100, clicks * 4)}%`;
  meter.style.background = stageIndex > 4 ? 'linear-gradient(90deg, #c4f55b, #56e9ed, #ba93ff, #ff6eb4)' : colors[0];
  stateDot.style.background = clicks ? colors[Math.min(stageIndex - 1, 4)] : '';
  nextLabel.textContent = nextStage ? `До следующего уровня: ${nextStage.at - clicks}` : `Заебистность продолжает расти ↗`;
  document.querySelector('#burst-note').style.opacity = clicks ? '0' : '1';
  const glow = Math.min(.2, clicks * .003);
  ambient.style.background = `radial-gradient(ellipse at 50% 60%, hsla(${(clicks * 13 + 85) % 360}, 90%, 55%, ${glow}), transparent 65%)`;
  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => {
    announcement.textContent = `${clicks} нажатий. ${stage.name}. ${stage.state}.`;
  }, 220);
}

function animateElement(element, keyframes, options) {
  const animation = element.animate(keyframes, options);
  animations.add(animation);
  animation.onfinish = () => {
    animations.delete(animation);
    element.remove();
  };
}

function addWord(level, reduced) {
  const word = document.createElement('span');
  word.className = 'effect-word';
  word.textContent = clicks === 1 ? 'ЗАЕБИСЬ!' : pick(words);
  const onLeft = Math.random() > .5;
  word.style.left = `${onLeft ? random(0, 10) : random(60, 78)}%`;
  word.style.top = `${random(20, 80)}%`;
  word.style.fontSize = `${Math.min(width * .14, random(24, 46) + level * 4)}px`;
  word.style.color = pick(colors);
  popups.append(word);
  const angle = random(-25, 25);
  animateElement(word, reduced ? [{ opacity: 0 }, { opacity: .5, offset: .2 }, { opacity: 0 }] : [
    { opacity: 0, transform: `translateY(35px) rotate(${angle}deg) scale(.65)` },
    { opacity: .6, transform: `translateY(0) rotate(${angle}deg) scale(1)`, offset: .2 },
    { opacity: 0, transform: `translateY(-110px) rotate(${angle + 8}deg) scale(1.1)` },
  ], { duration: reduced ? 900 : 2100 + level * 120, easing: 'ease-out' });
}

function addSticker(level) {
  const sticker = document.createElement('span');
  sticker.className = 'effect-sticker';
  sticker.textContent = pick(stickers);
  sticker.style.left = `${random(0, 88)}%`;
  sticker.style.top = `${random(5, 80)}%`;
  popups.append(sticker);
  const angle = random(-35, 35);
  animateElement(sticker, [
    { opacity: 0, transform: `translateY(130px) scale(.2) rotate(${angle}deg)` },
    { opacity: 1, transform: `translateY(0) scale(${1 + level * .055}) rotate(${angle}deg)`, offset: .22 },
    { opacity: 0, transform: `translateY(-${random(180, 400)}px) scale(.8) rotate(${angle + 160}deg)` },
  ], { duration: 3100 + level * 130, easing: 'cubic-bezier(.15,.7,.4,1)' });
}

function limitEffects() {
  if (particles.length > 1600) particles.splice(0, particles.length - 1600);
  if (rings.length > 55) rings.splice(0, rings.length - 55);
  if (beams.length > 22) beams.splice(0, beams.length - 22);
  while (popups.children.length > 45) {
    const oldest = popups.firstElementChild;
    oldest.getAnimations().forEach(animation => {
      animations.delete(animation);
      animation.cancel();
    });
    oldest.remove();
  }
}

function burst(x, y, level) {
  const amount = Math.floor(48 + level * 13 + Math.min(combo, 12) * 4);
  for (let index = 0; index < amount; index++) {
    const angle = random(0, Math.PI * 2);
    const speed = random(150, 350 + level * 38);
    particles.push({
      x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      color: pick(colors), size: random(2, 6 + level * .4),
      life: random(1.5, 3.5 + level * .15), age: 0,
      rotation: angle, spin: random(-7, 7), kind: Math.floor(random(0, 4)),
      gravity: random(35, 130), drag: random(.5, 1.2),
    });
  }
  const ringCount = 1 + Math.floor(level / 3);
  for (let index = 0; index < ringCount; index++) {
    rings.push({ x, y, age: -index * .09, life: 1.3 + level * .06, color: pick(colors), speed: 230 + level * 45, kind: level > 4 && index % 2 ? 'star' : 'circle', rotation: random(0, 3) });
  }
  if (clicks >= 12) {
    for (let index = 0; index < 3 + Math.floor(level); index++) {
      const sideX = Math.random() > .5 ? random(0, width * .2) : random(width * .8, width);
      particles.push({ x: sideX, y: height + 20, vx: random(-140, 140), vy: random(-650, -350), color: pick(colors), size: random(5, 11), life: random(2, 4), age: 0, rotation: 0, spin: 3, kind: 2, gravity: 140, drag: .15 });
    }
  }
  if (clicks >= 25) {
    beams.push({ x, y, age: 0, life: 2.3 + level * .1, rotation: random(0, Math.PI), color: pick(colors), count: 8 + Math.floor(level) });
  }
  if (clicks >= 45) {
    const extraX = random(width * .1, width * .9);
    const extraY = random(height * .1, height * .8);
    rings.push({ x: extraX, y: extraY, age: 0, life: 2.5, color: pick(colors), speed: 110 + level * 12, kind: 'planet', rotation: random(-1, 1) });
  }
  limitEffects();
  startRendering();
}

function drawStar(radius, points, rotation) {
  context.beginPath();
  for (let index = 0; index < points * 2; index++) {
    const angle = index * Math.PI / points + rotation;
    const length = index % 2 ? radius * .34 : radius;
    const x = Math.cos(angle) * length;
    const y = Math.sin(angle) * length;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.closePath();
}

function render(time) {
  frame = 0;
  const delta = Math.min((time - previousTime) / 1000, .035);
  previousTime = time;
  context.clearRect(0, 0, width, height);

  beams = beams.filter(beam => beam.age < beam.life);
  for (const beam of beams) {
    beam.age += delta;
    context.save();
    context.translate(beam.x, beam.y);
    context.rotate(beam.rotation + beam.age * .22);
    context.globalAlpha = Math.sin(Math.PI * Math.min(1, beam.age / beam.life)) * .08;
    context.fillStyle = beam.color;
    for (let index = 0; index < beam.count; index++) {
      context.rotate(Math.PI * 2 / beam.count);
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(width + height, -(width + height) * .07);
      context.lineTo(width + height, (width + height) * .07);
      context.closePath();
      context.fill();
    }
    context.restore();
  }

  rings = rings.filter(ring => ring.age < ring.life);
  for (const ring of rings) {
    ring.age += delta;
    if (ring.age < 0) continue;
    const progress = Math.min(1, ring.age / ring.life);
    const radius = 20 + ring.age * ring.speed;
    context.save();
    context.translate(ring.x, ring.y);
    context.globalAlpha = (1 - progress) * .7;
    context.strokeStyle = ring.color;
    context.lineWidth = (1 - progress) * 3 + .5;
    if (ring.kind === 'star') {
      drawStar(radius, 8, ring.rotation + ring.age * .5);
    } else if (ring.kind === 'planet') {
      context.rotate(ring.rotation + ring.age * .2);
      context.beginPath();
      context.ellipse(0, 0, radius * 1.5, radius * .32, 0, 0, Math.PI * 2);
      context.stroke();
      context.beginPath();
      context.arc(0, 0, radius * .57, 0, Math.PI * 2);
    } else {
      context.beginPath();
      context.arc(0, 0, radius, 0, Math.PI * 2);
    }
    context.stroke();
    context.restore();
  }

  particles = particles.filter(particle => particle.age < particle.life);
  for (const particle of particles) {
    particle.age += delta;
    const oldX = particle.x;
    const oldY = particle.y;
    particle.vx *= Math.exp(-particle.drag * delta);
    particle.vy *= Math.exp(-particle.drag * delta);
    particle.vy += particle.gravity * delta;
    particle.x += particle.vx * delta;
    particle.y += particle.vy * delta;
    particle.rotation += particle.spin * delta;
    const fade = Math.min(1, (particle.life - particle.age) * 1.3);
    context.save();
    context.globalAlpha = Math.max(0, fade);
    context.fillStyle = particle.color;
    context.strokeStyle = particle.color;
    if (particle.kind === 2) {
      context.lineWidth = particle.size * .45;
      context.beginPath();
      context.moveTo(oldX - particle.vx * .04, oldY - particle.vy * .04);
      context.lineTo(particle.x, particle.y);
      context.stroke();
    }
    context.translate(particle.x, particle.y);
    context.rotate(particle.rotation);
    if (particle.kind === 0) {
      context.fillRect(-particle.size / 2, -particle.size, particle.size, particle.size * 2);
    } else if (particle.kind === 1) {
      context.beginPath();
      context.arc(0, 0, particle.size * .65, 0, Math.PI * 2);
      context.fill();
    } else {
      drawStar(particle.size * 1.6, 4, 0);
      context.fill();
    }
    context.restore();
  }
  if (particles.length || rings.length || beams.length) frame = requestAnimationFrame(render);
  else context.clearRect(0, 0, width, height);
}

function startRendering() {
  if (context && !frame && !document.hidden) {
    previousTime = performance.now();
    frame = requestAnimationFrame(render);
  }
}

function playSound(level) {
  if (!soundEnabled || !audioContext) return;
  const now = audioContext.currentTime;
  const chord = [261.63, 329.63, 392, 523.25, 659.25, 783.99];
  const voiceCount = Math.min(3, 1 + Math.floor(level / 4));
  for (let index = 0; index < voiceCount; index++) {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(chord[(clicks + index * 2) % chord.length], now);
    oscillator.frequency.exponentialRampToValueAtTime(chord[(clicks + index * 2) % chord.length] * 1.4, now + .12);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(.04 / voiceCount, now + .01);
    gain.gain.exponentialRampToValueAtTime(.001, now + .28);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + .3);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
}

function makeGood() {
  const now = performance.now();
  combo = now - lastClick < 850 ? combo + 1 : 1;
  lastClick = now;
  clicks++;
  const level = Math.log2(1 + clicks) * 1.25;
  updateDashboard();
  comboLabel.textContent = `КОМБО ×${combo}`;
  comboLabel.classList.toggle('visible', combo > 1);
  clearTimeout(comboTimer);
  comboTimer = setTimeout(() => comboLabel.classList.remove('visible'), 900);
  const bounds = button.getBoundingClientRect();
  if (motionPreference.matches || !context) {
    addWord(level, true);
  } else {
    burst(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, level);
    if (clicks === 1 || clicks % 2 === 0) addWord(level, false);
    if (clicks >= 12) {
      addSticker(level);
      if (clicks >= 75) addSticker(level);
    }
  }
  limitEffects();
  playSound(level);
}

function clearVisuals() {
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  particles = [];
  rings = [];
  beams = [];
  for (const animation of animations) animation.cancel();
  animations.clear();
  popups.replaceChildren();
  context?.clearRect(0, 0, width, height);
}

button.addEventListener('click', makeGood);
document.addEventListener('keydown', event => {
  if (event.key === 'Enter' && document.activeElement === document.body) {
    event.preventDefault();
    button.click();
  }
});
document.querySelector('#reset').addEventListener('click', () => {
  clearVisuals();
  clicks = 0;
  combo = 0;
  lastClick = -Infinity;
  clearTimeout(comboTimer);
  comboLabel.classList.remove('visible');
  updateDashboard();
  button.focus({ preventScroll: true });
});

soundButton.addEventListener('click', async () => {
  try {
    if (!audioContext) audioContext = new AudioContext();
    await audioContext.resume();
    soundEnabled = !soundEnabled;
    soundButton.setAttribute('aria-pressed', String(soundEnabled));
    soundButton.setAttribute('aria-label', soundEnabled ? 'Выключить звук' : 'Включить звук');
    soundButton.title = soundEnabled ? 'Выключить звук' : 'Включить звук';
    if (soundEnabled) playSound(1);
  } catch (error) {
    console.error('Could not enable audio', error);
    announcement.textContent = 'Звук недоступен в этом браузере. Визуальные эффекты продолжают работать.';
  }
});

addEventListener('resize', resize);
motionPreference.addEventListener('change', clearVisuals);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  } else startRendering();
});
resize();
