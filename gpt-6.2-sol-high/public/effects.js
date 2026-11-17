const TAU = 2 * Math.PI;
const PALETTE = ['#d8ff40', '#6cffe6', '#ff45a8', '#a385ff', '#ff8b46', '#fff37a'];
const STAMPS = ['ПОНЕСЛАСЬ', 'ОТВАЛ БАШКИ', 'ПЕРЕГРУЗ', 'ДИЧЬ', 'ЗАЕБИСЬ!', 'КОСМОС'];
const ODDITIES = ['🪩', '🛸', '🍌', '👁️', '🐸', '🌈'];

function range(min, max) {
  return min + Math.random() * (max - min);
}

export function createEffects(canvas, button) {
  const ctx = canvas.getContext('2d');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const bursts = [];
  const particles = [];
  let width = 0;
  let height = 0;
  let frame = 0;

  function fit() {
    const box = canvas.getBoundingClientRect();
    const scale = Math.min(devicePixelRatio, 2);
    width = box.width;
    height = box.height;
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    ctx?.setTransform(scale, 0, 0, scale, 0, 0);
  }

  function drawBurst(burst, age, still) {
    const { x, y, intensity, phase, color, level } = burst;
    const progress = age / burst.life;
    const fade = 1 - progress;
    const spread = Math.hypot(width, height);
    const wave = still ? .32 : 1 - Math.pow(fade, 2.4);
    const radius = 35 + spread * wave * (.27 + intensity * .28);

    ctx.save();
    ctx.translate(x, y);

    const halo = ctx.createRadialGradient(0, 0, radius * .20, 0, 0, radius);
    halo.addColorStop(0, color + '00');
    halo.addColorStop(.54, color + '60');
    halo.addColorStop(.72, color + '20');
    halo.addColorStop(1, color + '00');
    ctx.globalAlpha = fade * (.65 + intensity * .30);
    ctx.fillStyle = halo;
    ctx.fillRect(-radius, -radius, radius * 2, radius * 2);

    const rings = level >= 3 ? 3 : 2;
    for (let ring = 0; ring < rings; ring++) {
      const size = radius * (1 - ring * .19);
      ctx.beginPath();
      ctx.ellipse(0, 0, size, size * (.88 - ring * .10), phase, 0, TAU);
      ctx.strokeStyle = level >= 4 ? PALETTE[(burst.serial + ring) % PALETTE.length] : color;
      ctx.globalAlpha = fade * (.95 - ring * .21);
      ctx.lineWidth = ring === 0 ? 2.5 + intensity * 5 : 1.5;
      ctx.stroke();
    }

    if (level >= 2) {
      ctx.rotate(phase);
      ctx.globalAlpha = fade * .82;
      ctx.lineWidth = 1.2 + intensity * 2.2;
      const bolts = level >= 4 ? 5 : 2;
      for (let bolt = 0; bolt < bolts; bolt++) {
        ctx.rotate(TAU / bolts);
        ctx.beginPath();
        ctx.moveTo(radius * .35, 0);
        for (let point = 1; point <= 7; point++) {
          const bend = Math.sin(point * 9.3 + phase * 7) * radius * .17;
          ctx.lineTo(radius * (.35 + point * .12), bend);
        }
        ctx.stroke();
      }
    }

    if (level >= 5) drawOrbit(burst, radius, age, fade, still);
    ctx.restore();

    if (level >= 3 && (level < 5 || burst.serial % 3 === 0)) {
      drawStamp(burst, progress, still);
    }
  }

  function drawOrbit(burst, radius, age, fade, still) {
    const petals = burst.level >= 6 ? 13 : 8;
    const spin = still ? 0 : age / 520;
    for (let petal = 0; petal < petals; petal++) {
      const angle = petal * TAU / petals + spin;
      const reach = radius * .67;
      ctx.strokeStyle = PALETTE[(petal + burst.serial) % PALETTE.length];
      ctx.globalAlpha = fade * .58;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(
        Math.cos(angle) * reach,
        Math.sin(angle) * reach,
        reach * .76, reach * .235, angle + spin * .5, 0, TAU,
      );
      ctx.stroke();
    }
  }

  function drawStamp(burst, progress, still) {
    const { serial, level, color } = burst;
    const impact = Math.min(1, progress * 9);
    const alpha = (1 - progress ** 3) * (still ? .83 : impact);
    const scale = still ? 1 : .73 + impact * .34;
    const side = serial % 2 === 0 ? 1 : -1;
    const offsetX = side * width * (.24 + Math.sin(serial * 2.1) * .035);
    const offsetY = height * (.34 + Math.sin(serial * 2.5) * .14);
    const title = STAMPS[serial % STAMPS.length];
    const size = Math.min(width * .056, level >= 5 ? 53 : 34);

    ctx.save();
    ctx.translate(width * .5 + offsetX, offsetY);
    ctx.rotate(side * (.11 + Math.sin(serial * 1.4) * .19));
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;
    ctx.font = `900 ${size}px "Roboto Condensed", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const textWidth = ctx.measureText(title).width;
    ctx.fillStyle = color;
    ctx.fillRect(-textWidth / 2 - 10, -size * .62, textWidth + 20, size * 1.17);
    ctx.fillStyle = '#111507';
    ctx.fillText(title, 0, 1);
    ctx.restore();
  }

  function drawParticle(particle, time, still) {
    const age = (time - particle.start) / 1000;
    const life = 1 - age / particle.life;
    if (life <= 0) return false;

    const elapsed = still ? .42 : (1 - Math.exp(-age * 2.1)) / 2.1;
    const x = particle.x + particle.dx * elapsed;
    const y = particle.y + particle.dy * elapsed + (still ? 0 : age ** 2 * particle.gravity);
    const angle = particle.angle + (still ? 0 : age * particle.spin);
    if (x < -60 || y < -60 || x > width + 60 || y > height + 60) return true;

    const size = particle.size;
    ctx.globalAlpha = Math.min(1, life * 1.9);
    ctx.fillStyle = particle.color;

    if (particle.symbol) {
      ctx.font = `${size * 3.5}px system-ui`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(particle.symbol, x, y);
    } else if (particle.spark) {
      const dx = Math.cos(angle) * size;
      const dy = Math.sin(angle) * size;
      ctx.beginPath();
      ctx.moveTo(x - dx, y - dy);
      ctx.lineTo(x - dy * .32, y + dx * .32);
      ctx.lineTo(x + dx, y + dy);
      ctx.lineTo(x + dy * .32, y - dx * .32);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, size, size);
    }
    return true;
  }

  function paint(time) {
    frame = 0;
    ctx.clearRect(0, 0, width, height);
    const still = motion.matches;

    while (bursts.length && time - bursts[0].start >= bursts[0].life) bursts.shift();
    for (const burst of bursts) {
      const age = Math.max(0, time - burst.start);
      if (age < burst.life) drawBurst(burst, age, still);
    }

    let living = 0;
    for (const particle of particles) {
      if (drawParticle(particle, Math.max(time, particle.start), still)) {
        particles[living++] = particle;
      }
    }
    particles.length = living;
    ctx.globalAlpha = 1;
    if (bursts.length || living) frame = requestAnimationFrame(paint);
  }

  function burst({ level, serial, streak, color }) {
    if (!ctx) return;
    const bounds = button.getBoundingClientRect();
    const viewport = canvas.getBoundingClientRect();
    const x = bounds.left - viewport.left + bounds.width / 2;
    const y = bounds.top - viewport.top + bounds.height / 2;
    const intensity = 1 - Math.exp(-(serial + streak * .85) / 26);
    const start = performance.now();
    const phase = range(0, TAU);
    const life = motion.matches ? 850 : 920 + intensity * 1090;
    const count = Math.ceil((24 + intensity * 96) * (motion.matches ? .45 : 1));
    const travel = Math.hypot(width, height) * (.47 + intensity * 1.2);

    bursts.push({ x, y, start, life, phase, color, level, serial, intensity });
    if (bursts.length > 18) bursts.shift();

    for (let i = 0; i < count; i++) {
      const angle = phase + i * TAU / count + range(-.12, .12);
      const speed = range(.37, 1) * travel;
      const fancy = level >= 5 && i % (level >= 6 ? 12 : 23) === 0;
      particles.push({
        x,
        y,
        start,
        angle,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        life: range(.55, 1.45) + intensity * .8,
        size: fancy ? range(8, 18) : range(2, 6) * (1 + intensity * 1.1),
        gravity: range(32, 145),
        spin: range(-7, 7),
        spark: i % 2 === 0,
        symbol: fancy ? ODDITIES[(serial + i + Math.floor(range(0, 8))) % ODDITIES.length] : '',
        color: level >= 3 ? PALETTE[(serial + i) % PALETTE.length] : i % 4 === 0 ? '#f5ffd6' : color,
      });
    }

    const budget = width < 600 ? 780 : 1450;
    if (particles.length > budget) particles.splice(0, particles.length - budget);
    if (!frame) frame = requestAnimationFrame(paint);
  }

  function clear() {
    particles.length = 0;
    bursts.length = 0;
    cancelAnimationFrame(frame);
    frame = 0;
    ctx?.clearRect(0, 0, width, height);
  }

  new ResizeObserver(fit).observe(canvas);
  motion.addEventListener('change', clear);
  fit();

  return { burst, clear };
}
