const button = document.querySelector('#make-good');
const canvas = document.querySelector('#effects');
const ctx = canvas.getContext('2d');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const stickers = document.querySelector('#stickers');
const colors = ['#d6fb47', '#ff5c45', '#ecb8f7', '#fff2b0', '#8ee4fc'];
const words = ['ВОТ ЭТО ДА!', 'ЕЩЁ!', 'ЗАЕБИСЬ!', 'ДААА!', 'КОСМОС!', 'МОЩНО!', '🔥', '✳'];
const statuses = ['СТАНОВИТСЯ ЛУЧШЕ', 'УЖЕ ЗАЕБИСЬ', 'ОЧЕНЬ ЗАЕБИСЬ', 'ПРОСТО КОСМОС', 'НЕПРИЛИЧНО ЗАЕБИСЬ'];
let count = 0;
let particles = [];
let rings = [];
let frame = 0;
let width = 0;
let height = 0;
let lastTime = 0;

function resize() {
  width = innerWidth; height = innerHeight;
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = width * ratio; canvas.height = height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}
addEventListener('resize', resize);
resize();

function animate(time) {
  const step = Math.min((time - (lastTime || time)) / 16.67, 2);
  lastTime = time;
  ctx.clearRect(0, 0, width, height);
  particles = particles.filter(p => p.life > 0);
  rings = rings.filter(r => r.life > 0);
  for (const p of particles) {
    p.x += p.vx * step; p.y += p.vy * step; p.vy += .09 * step; p.rotation += p.spin * step; p.life -= step;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation); ctx.globalAlpha = Math.min(1, p.life / 25); ctx.fillStyle = p.color;
    if (p.circle) { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
    else ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    ctx.restore();
  }
  for (const r of rings) {
    r.radius += r.speed * step; r.life -= step;
    ctx.beginPath(); ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2); ctx.strokeStyle = r.color; ctx.globalAlpha = Math.max(0, r.life / 40); ctx.lineWidth = 4; ctx.stroke(); ctx.globalAlpha = 1;
  }
  if (particles.length || rings.length) frame = requestAnimationFrame(animate);
  else { frame = 0; lastTime = 0; }
}

button.addEventListener('click', () => {
  count++;
  const level = count * 100;
  document.querySelector('#count').textContent = String(count).padStart(3, '0');
  document.querySelector('#level').innerHTML = `${level.toLocaleString('ru-RU')}<span>%</span>`;
  document.querySelector('#meter-fill').style.width = `${Math.min(100, count * 10)}%`;
  const status = statuses[Math.min(statuses.length - 1, Math.floor((count - 1) / 3))];
  document.querySelector('#status').textContent = status;
  document.querySelector('#announcement').textContent = `${status}. Нажатий: ${count}.`;
  if (reducedMotion.matches) return;
  const rect = button.getBoundingClientRect();
  const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
  const intensity = Math.min(count, 15);
  for (let i = 0; i < 40 + intensity * 6; i++) {
    const angle = Math.random() * Math.PI * 2, speed = 2 + Math.random() * (5 + intensity * .35);
    particles.push({x, y, vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed - 2, size:5 + Math.random()*11, rotation:Math.random()*6, spin:(Math.random()-.5)*.3, life:55+Math.random()*70, color:colors[Math.floor(Math.random()*colors.length)], circle:Math.random()>.7});
  }
  particles = particles.slice(-1800);
  rings.push({x,y,radius:rect.width/3,speed:5+intensity*.25,life:40,color:colors[count%colors.length]});
  if (!frame) frame = requestAnimationFrame(animate);
  const amount = Math.min(1 + Math.floor(count / 4), 5);
  for (let i = 0; i < amount; i++) {
    const sticker = document.createElement('div');
    sticker.className = 'sticker'; sticker.textContent = words[Math.floor(Math.random()*words.length)];
    sticker.style.left = `${12 + Math.random()*76}%`; sticker.style.top = `${15 + Math.random()*65}%`; sticker.style.setProperty('--angle', `${Math.random()*30-15}deg`);
    stickers.append(sticker); sticker.addEventListener('animationend', () => sticker.remove(), {once:true});
  }
  while (stickers.children.length > 35) stickers.firstElementChild.remove();
});
