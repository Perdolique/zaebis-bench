const button = document.querySelector('#make-good');
const canvas = document.querySelector('#confetti');
const ctx = canvas.getContext('2d');
const effects = document.querySelector('#effects');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const colors = ['#ff6baf', '#d5ff45', '#9d7bff', '#ffb547', '#65e4d1', '#ffffff'];
const phrases = ['ЗАЕБИСЬ!', 'ЕЩЁ!', 'ВОТ ЭТО ДА!', 'КРАСОТА!', 'МОЩНО!', 'ОФИГЕТЬ!', 'КОСМОС!', 'ДААА!'];
let count = 0;
let particles = [];
let frame = 0;
function resize() { canvas.width = innerWidth * devicePixelRatio; canvas.height = innerHeight * devicePixelRatio; ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); }
addEventListener('resize', resize); resize();
function random(min, max) { return Math.random() * (max - min) + min; }
function animate() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  particles = particles.filter(p => p.life > 0);
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy; p.vy += .12; p.vx *= .995; p.rotation += p.spin; p.life--;
    ctx.save(); ctx.globalAlpha = Math.min(1, p.life / 25); ctx.translate(p.x, p.y); ctx.rotate(p.rotation); ctx.fillStyle = p.color;
    if (p.star) { ctx.font = `${p.size * 2}px sans-serif`; ctx.fillText('✦', -p.size, p.size); }
    else ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * .55);
    ctx.restore();
  }
  if (particles.length) frame = requestAnimationFrame(animate); else { frame = 0; ctx.clearRect(0, 0, innerWidth, innerHeight); }
}
function element(className, x, y, color, text = '') {
  const el = document.createElement('div'); el.className = className; el.style.left = `${x}px`; el.style.top = `${y}px`; el.style.setProperty('--c', color); el.style.setProperty('--r', `${random(-18, 18)}deg`); el.textContent = text; effects.append(el); el.addEventListener('animationend', () => el.remove(), { once: true });
}
button.addEventListener('click', () => {
  count++;
  const level = count < 3 ? 'УЖЕ ХОРОШО' : count < 7 ? 'ОЧЕНЬ ЗАЕБИСЬ' : count < 15 ? 'ПРОСТО КОСМОС' : count < 30 ? 'НЕПРИЛИЧНО ХОРОШО' : 'ЗА ПРЕДЕЛАМИ ЗАЕБИСИ';
  document.querySelector('#count').textContent = String(count).padStart(3, '0');
  document.querySelector('#level').textContent = level;
  document.querySelector('#percent').textContent = `${count * 17}%`;
  document.querySelector('#fill').style.width = `${Math.min(100, count * 7)}%`;
  document.querySelector('#announcement').textContent = `Нажатий: ${count}. ${level}.`;
  if (reducedMotion.matches) return;
  const rect = button.getBoundingClientRect(); const x = rect.left + rect.width / 2; const y = rect.top + rect.height / 2;
  const amount = Math.min(120, 35 + count * 4);
  for (let i = 0; i < amount; i++) { const angle = random(0, Math.PI * 2); const speed = random(2, Math.min(16, 7 + count * .3)); particles.push({x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 3, life: random(45, 110), size: random(4, 12), rotation: random(0, 6), spin: random(-.15, .15), color: colors[Math.floor(random(0, colors.length))], star: Math.random() < .2}); }
  if (particles.length > 1200) particles.splice(0, particles.length - 1200);
  if (!frame) frame = requestAnimationFrame(animate);
  element('burst-ring', x, y, colors[count % colors.length]);
  const stickerCount = Math.min(6, 1 + Math.floor(count / 3));
  for (let i = 0; i < stickerCount; i++) element('sticker', random(innerWidth * .1, innerWidth * .9), random(innerHeight * .15, innerHeight * .8), colors[Math.floor(random(0, colors.length))], phrases[Math.floor(random(0, phrases.length))]);
  if (count > 5) element('flash', 0, 0, colors[count % colors.length]);
});
