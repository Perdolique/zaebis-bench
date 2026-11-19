/**
 * Layer 2: Foreground high-FPS chaos FX canvas.
 * Handles shockwaves, 3D confetti, multi-stage fireworks, bouncing emojis,
 * Tesla lightning arcs, meteors, and persistent accumulating neon comets.
 */

import { pickEmoji } from './stages.js';

const MAX_PARTICLES = 950;
const MAX_SHOCKWAVES = 40;
const MAX_LIGHTNING = 18;
const MAX_EMOJIS = 80;
const MAX_COMETS = 22;
const MAX_METEORS = 18;

const PALETTE = [
  '#ff2e93',
  '#ffb800',
  '#00f5d4',
  '#7b2cbf',
  '#ff5400',
  '#00bbf9',
  '#fee440',
  '#ff006e',
  '#38b000',
  '#ffffff',
];

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function pickColor() {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)];
}

export class EffectsCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    this.particles = [];
    this.shockwaves = [];
    this.lightnings = [];
    this.emojis = [];
    this.comets = [];
    this.meteors = [];
    this.ambientTimer = 0;
    this.hue = 0;
  }

  resize(width, height) {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = width;
    this.height = height;
    this.canvas.width = Math.max(1, Math.floor(width * this.dpr));
    this.canvas.height = Math.max(1, Math.floor(height * this.dpr));
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  reset() {
    this.particles.length = 0;
    this.shockwaves.length = 0;
    this.lightnings.length = 0;
    this.emojis.length = 0;
    this.comets.length = 0;
    this.meteors.length = 0;
  }

  /**
   * Called on every click of "СДЕЛАТЬ ЗАЕБИСЬ".
   * Spawns escalating, layered bursts around (x, y) and across the viewport.
   */
  burst(x, y, { level, combo, clicks, softMode }) {
    const mult = (softMode ? 0.65 : 1) * (1 + Math.min(combo, 20) * 0.045);

    // 1. Shockwaves (always, double/triple at higher levels)
    this.spawnShockwave(x, y, level, 0);
    if (level >= 3) {
      this.spawnShockwave(x, y, level, 0.14);
    }
    if (level >= 7) {
      this.spawnShockwave(x, y, level, 0.28, true);
    }

    // 2. Confetti & golden sparks explosion
    const confettiCount = Math.round((20 + level * 7) * mult);
    this.spawnConfetti(x, y, confettiCount, level);

    // 3. Spark burst directly from button
    const sparkCount = Math.round((14 + level * 5) * mult);
    this.spawnSparks(x, y, sparkCount, level);

    // 4. Bouncing emoji fountain (Level 1+)
    const emojiCount = Math.max(1, Math.round((1 + level * 0.65) * (softMode ? 0.6 : 1)));
    this.spawnEmojis(x, y, emojiCount, level);

    // 5. Fireworks around the stage (Level 2+)
    if (level >= 2) {
      const fwCount = level >= 8 ? 3 : level >= 5 ? 2 : 1;
      for (let i = 0; i < fwCount; i += 1) {
        const fx = rand(this.width * 0.12, this.width * 0.88);
        const fy = rand(this.height * 0.12, this.height * 0.62);
        this.spawnFireworkBurst(fx, fy, level);
      }
    }

    // 6. Accumulating persistent neon comets (Level 3+)
    if (level >= 3 && this.comets.length < Math.min(MAX_COMETS, (level - 2) * 3)) {
      this.spawnComet(x, y);
    }

    // 7. Tesla lightning arcs (Level 4+)
    if (level >= 4) {
      const bolts = level >= 8 ? 4 : level >= 6 ? 3 : 2;
      for (let i = 0; i < bolts; i += 1) {
        this.spawnLightningFrom(x, y, level);
      }
    }

    // 8. Blazing meteors (Level 7+)
    if (level >= 7) {
      const mCount = level >= 9 ? 3 : 2;
      for (let i = 0; i < mCount; i += 1) {
        this.spawnMeteor();
      }
    }

    // 9. Edge cannon blasts on rapid combos or high clicks
    if (combo >= 4 || (level >= 5 && clicks % 3 === 0)) {
      this.spawnSideCannons(level);
    }
  }

  /**
   * Massive celebratory explosion on tier up or Supernova milestones!
   */
  supernova(cx, cy, level) {
    for (let i = 0; i < 4; i += 1) {
      this.spawnShockwave(cx, cy, Math.max(level, 8), i * 0.09, true);
    }
    this.spawnConfetti(cx, cy, 90, Math.max(level, 7));
    this.spawnSideCannons(Math.max(level, 7));
    this.spawnEmojis(cx, cy, 12, Math.max(level, 8));

    const spots = 6;
    for (let i = 0; i < spots; i += 1) {
      const angle = (i / spots) * Math.PI * 2;
      const dist = Math.min(this.width, this.height) * 0.32;
      this.spawnFireworkBurst(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, Math.max(level, 8));
    }
    for (let i = 0; i < 6; i += 1) {
      this.spawnLightningFrom(cx, cy, 10);
    }
    for (let i = 0; i < 5; i += 1) {
      this.spawnMeteor();
    }
  }

  spawnShockwave(x, y, level, delay = 0, rainbow = false) {
    if (this.shockwaves.length >= MAX_SHOCKWAVES) this.shockwaves.shift();
    this.shockwaves.push({
      x,
      y,
      r: 22,
      maxR: Math.max(this.width, this.height) * (0.42 + Math.min(level, 10) * 0.065),
      speed: 520 + level * 75,
      lineWidth: 4 + level * 0.9,
      hue: (this.hue + rand(-35, 35) + 360) % 360,
      rainbow: rainbow || level >= 6,
      delay,
      alpha: 0.95,
    });
  }

  spawnConfetti(x, y, count, level) {
    for (let i = 0; i < count; i += 1) {
      if (this.particles.length >= MAX_PARTICLES) this.particles.shift();
      const angle = rand(0, Math.PI * 2);
      const speed = rand(180, 620 + level * 55);
      this.particles.push({
        kind: 'confetti',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - rand(60, 220),
        size: rand(6, 13 + level * 0.4),
        color: pickColor(),
        rot: rand(0, Math.PI * 2),
        vRot: rand(-11, 11),
        flipPhase: rand(0, Math.PI * 2),
        flipSpeed: rand(7, 16),
        life: rand(1.1, 2.5),
        maxLife: 2.5,
        gravity: 420,
        drag: 0.975,
      });
    }
  }

  spawnSparks(x, y, count, level) {
    for (let i = 0; i < count; i += 1) {
      if (this.particles.length >= MAX_PARTICLES) this.particles.shift();
      const angle = rand(0, Math.PI * 2);
      const speed = rand(220, 760 + level * 60);
      this.particles.push({
        kind: 'spark',
        x,
        y,
        px: x,
        py: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: rand(2, 4.5),
        color: pickColor(),
        life: rand(0.45, 1.05),
        maxLife: 1.05,
        gravity: 180,
        drag: 0.95,
      });
    }
  }

  spawnFireworkBurst(x, y, level) {
    const baseHue = rand(0, 360);
    const shapeRoll = Math.random();
    const count = 26 + Math.min(level, 10) * 3;
    const isStar = shapeRoll < 0.35;
    const isRing = shapeRoll >= 0.35 && shapeRoll < 0.65;

    for (let i = 0; i < count; i += 1) {
      if (this.particles.length >= MAX_PARTICLES) this.particles.shift();
      const t = (i / count) * Math.PI * 2;
      let speed = rand(140, 390);
      if (isRing) {
        speed = 290 + rand(-18, 18);
      } else if (isStar) {
        const points = 5;
        speed = 220 + Math.abs(Math.cos((t * points) / 2)) * 210;
      }

      const hue = (baseHue + (i % 3) * 32) % 360;
      this.particles.push({
        kind: 'firework',
        x,
        y,
        px: x,
        py: y,
        vx: Math.cos(t) * speed,
        vy: Math.sin(t) * speed,
        size: rand(2.2, 4.6),
        color: `hsl(${hue}, 100%, 68%)`,
        life: rand(0.7, 1.45),
        maxLife: 1.45,
        gravity: 210,
        drag: 0.96,
      });
    }

    // Center flash ring
    this.spawnShockwave(x, y, Math.max(1, level - 3), 0, false);
  }

  spawnSideCannons(level) {
    const perSide = 16 + level * 2;
    const sides = [
      { x: 0, y: this.height * 0.85, minA: -1.25, maxA: -0.35 },
      { x: this.width, y: this.height * 0.85, minA: -2.79, maxA: -1.89 },
    ];
    sides.forEach((side) => {
      for (let i = 0; i < perSide; i += 1) {
        if (this.particles.length >= MAX_PARTICLES) this.particles.shift();
        const a = rand(side.minA, side.maxA);
        const speed = rand(520, 1080);
        this.particles.push({
          kind: 'confetti',
          x: side.x,
          y: side.y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          size: rand(7, 14),
          color: pickColor(),
          rot: rand(0, Math.PI * 2),
          vRot: rand(-13, 13),
          flipPhase: rand(0, Math.PI * 2),
          flipSpeed: rand(8, 18),
          life: rand(1.4, 2.8),
          maxLife: 2.8,
          gravity: 520,
          drag: 0.985,
        });
      }
    });
  }

  spawnEmojis(x, y, count, level) {
    for (let i = 0; i < count; i += 1) {
      if (this.emojis.length >= MAX_EMOJIS) this.emojis.shift();
      const angle = rand(-Math.PI * 0.9, -Math.PI * 0.1);
      const speed = rand(240, 620 + level * 35);
      this.emojis.push({
        char: pickEmoji(level),
        x: x + rand(-30, 30),
        y: y + rand(-20, 20),
        vx: Math.cos(angle) * speed * rand(0.7, 1.35) + rand(-180, 180),
        vy: Math.sin(angle) * speed,
        size: rand(24, 42 + level * 1.8),
        rot: rand(-0.4, 0.4),
        vRot: rand(-6, 6),
        life: rand(1.9, 3.4),
        maxLife: 3.4,
        bounces: 0,
      });
    }
  }

  spawnComet(x, y) {
    if (this.comets.length >= MAX_COMETS) this.comets.shift();
    const angle = rand(0, Math.PI * 2);
    const speed = rand(240, 440);
    this.comets.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      hue: rand(0, 360),
      size: rand(6, 11),
      trail: [],
    });
  }

  spawnLightningFrom(x, y, level) {
    if (this.lightnings.length >= MAX_LIGHTNING) this.lightnings.shift();
    const edge = Math.floor(Math.random() * 4);
    let tx = rand(0, this.width);
    let ty = rand(0, this.height);
    if (edge === 0) ty = 0;
    else if (edge === 1) ty = this.height;
    else if (edge === 2) tx = 0;
    else tx = this.width;

    const segments = 11;
    const points = [{ x, y }];
    for (let i = 1; i < segments; i += 1) {
      const t = i / segments;
      const jitter = 44 + level * 4;
      points.push({
        x: x + (tx - x) * t + rand(-jitter, jitter),
        y: y + (ty - y) * t + rand(-jitter, jitter),
      });
    }
    points.push({ x: tx, y: ty });

    this.lightnings.push({
      points,
      hue: rand(165, 340),
      life: rand(0.16, 0.34),
      maxLife: 0.34,
      width: rand(2.2, 4.5),
    });
  }

  spawnMeteor() {
    if (this.meteors.length >= MAX_METEORS) this.meteors.shift();
    const fromLeft = Math.random() < 0.5;
    this.meteors.push({
      x: fromLeft ? rand(-60, this.width * 0.6) : rand(this.width * 0.4, this.width + 60),
      y: -30,
      vx: (fromLeft ? 1 : -1) * rand(480, 920),
      vy: rand(460, 860),
      hue: rand(0, 360),
      length: rand(90, 210),
      life: 1.4,
    });
  }

  render(dt, state) {
    const { level, softMode, centerX, centerY } = state;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    if (!w || !h) return;

    this.hue = (this.hue + dt * 95) % 360;
    ctx.clearRect(0, 0, w, h);

    // Self-sustaining ambient spectacle once chaos escalates (Level 5+)
    if (level >= 5) {
      this.ambientTimer += dt;
      const interval = Math.max(0.28, 1.35 - (level - 5) * 0.18) * (softMode ? 1.8 : 1);
      if (this.ambientTimer >= interval) {
        this.ambientTimer = 0;
        const fx = rand(w * 0.1, w * 0.9);
        const fy = rand(h * 0.12, h * 0.6);
        this.spawnFireworkBurst(fx, fy, level);
        if (level >= 7) this.spawnMeteor();
        if (level >= 8 && !softMode) {
          this.spawnLightningFrom(centerX || w * 0.5, centerY || h * 0.5, level);
        }
      }
    }

    // 1. Persistent bouncing neon comets
    this.updateAndDrawComets(ctx, dt, w, h, level);

    // 2. Meteors
    this.updateAndDrawMeteors(ctx, dt, w, h);

    // 3. Shockwaves
    this.updateAndDrawShockwaves(ctx, dt);

    // 4. Particles (confetti, sparks, fireworks)
    this.updateAndDrawParticles(ctx, dt);

    // 5. Tesla lightning arcs
    this.updateAndDrawLightning(ctx, dt);

    // 6. Bouncing emoji physics
    this.updateAndDrawEmojis(ctx, dt, w, h);
  }

  updateAndDrawComets(ctx, dt, w, h, level) {
    if (this.comets.length === 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const speedMult = 1 + Math.max(0, level - 3) * 0.08;

    for (let i = 0; i < this.comets.length; i += 1) {
      const c = this.comets[i];
      c.x += c.vx * dt * speedMult;
      c.y += c.vy * dt * speedMult;
      c.hue = (c.hue + dt * 110) % 360;

      if (c.x < c.size) {
        c.x = c.size;
        c.vx = Math.abs(c.vx);
      } else if (c.x > w - c.size) {
        c.x = w - c.size;
        c.vx = -Math.abs(c.vx);
      }
      if (c.y < c.size) {
        c.y = c.size;
        c.vy = Math.abs(c.vy);
      } else if (c.y > h - c.size) {
        c.y = h - c.size;
        c.vy = -Math.abs(c.vy);
      }

      c.trail.push({ x: c.x, y: c.y });
      if (c.trail.length > 16) c.trail.shift();

      // Draw glowing tail
      for (let t = 1; t < c.trail.length; t += 1) {
        const ratio = t / c.trail.length;
        ctx.strokeStyle = `hsla(${(c.hue + t * 8) % 360}, 100%, 65%, ${ratio * 0.65})`;
        ctx.lineWidth = c.size * ratio * 1.25;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(c.trail[t - 1].x, c.trail[t - 1].y);
        ctx.lineTo(c.trail[t].x, c.trail[t].y);
        ctx.stroke();
      }

      // Bright head
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size * 0.58, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  updateAndDrawMeteors(ctx, dt, w, h) {
    if (this.meteors.length === 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';

    for (let i = this.meteors.length - 1; i >= 0; i -= 1) {
      const m = this.meteors[i];
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.life -= dt;

      if (m.life <= 0 || m.y > h + 220 || m.x < -260 || m.x > w + 260) {
        this.meteors.splice(i, 1);
        continue;
      }

      const speed = Math.hypot(m.vx, m.vy) || 1;
      const tailX = m.x - (m.vx / speed) * m.length;
      const tailY = m.y - (m.vy / speed) * m.length;

      const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.25, `hsla(${m.hue}, 100%, 70%, 0.9)`);
      grad.addColorStop(1, `hsla(${(m.hue + 40) % 360}, 100%, 50%, 0)`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
    }

    ctx.restore();
  }

  updateAndDrawShockwaves(ctx, dt) {
    if (this.shockwaves.length === 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (let i = this.shockwaves.length - 1; i >= 0; i -= 1) {
      const sw = this.shockwaves[i];
      if (sw.delay > 0) {
        sw.delay -= dt;
        continue;
      }
      sw.r += sw.speed * dt;
      const progress = sw.r / sw.maxR;
      if (progress >= 1) {
        this.shockwaves.splice(i, 1);
        continue;
      }

      const alpha = (1 - progress) * sw.alpha;
      const hue = sw.rainbow ? (sw.hue + progress * 240) % 360 : sw.hue;

      ctx.strokeStyle = `hsla(${hue}, 100%, 68%, ${alpha})`;
      ctx.lineWidth = Math.max(1, sw.lineWidth * (1 - progress * 0.72));
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
      ctx.stroke();

      if (sw.rainbow) {
        ctx.strokeStyle = `hsla(${(hue + 140) % 360}, 100%, 75%, ${alpha * 0.55})`;
        ctx.lineWidth = Math.max(1, sw.lineWidth * 0.45);
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, Math.max(4, sw.r - 12), 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  updateAndDrawParticles(ctx, dt) {
    if (this.particles.length === 0) return;

    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.px = p.x;
      p.py = p.y;
      const dragPow = Math.pow(p.drag, dt * 60);
      p.vx *= dragPow;
      p.vy = p.vy * dragPow + p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      const alpha = Math.min(1, p.life / (p.maxLife * 0.45));

      if (p.kind === 'confetti') {
        p.rot += p.vRot * dt;
        p.flipPhase += p.flipSpeed * dt;
        const flipScale = Math.cos(p.flipPhase);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, flipScale);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size * 0.5, -p.size * 0.28, p.size, p.size * 0.56);
        ctx.restore();
      } else {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  updateAndDrawLightning(ctx, dt) {
    if (this.lightnings.length === 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = this.lightnings.length - 1; i >= 0; i -= 1) {
      const l = this.lightnings[i];
      l.life -= dt;
      if (l.life <= 0) {
        this.lightnings.splice(i, 1);
        continue;
      }

      const alpha = l.life / l.maxLife;
      // Outer neon glow
      ctx.strokeStyle = `hsla(${l.hue}, 100%, 62%, ${alpha * 0.7})`;
      ctx.lineWidth = l.width * 3.2;
      ctx.beginPath();
      l.points.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      // White hot core
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = l.width * 0.9;
      ctx.stroke();
    }

    ctx.restore();
  }

  updateAndDrawEmojis(ctx, dt, w, h) {
    if (this.emojis.length === 0) return;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = this.emojis.length - 1; i >= 0; i -= 1) {
      const e = this.emojis[i];
      e.life -= dt;
      if (e.life <= 0) {
        this.emojis.splice(i, 1);
        continue;
      }

      e.vy += 680 * dt;
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      e.rot += e.vRot * dt;

      // Elastic bounces off viewport walls & floor
      const pad = e.size * 0.45;
      if (e.x < pad) {
        e.x = pad;
        e.vx = Math.abs(e.vx) * 0.8;
      } else if (e.x > w - pad) {
        e.x = w - pad;
        e.vx = -Math.abs(e.vx) * 0.8;
      }
      if (e.y > h - pad && e.bounces < 2) {
        e.y = h - pad;
        e.vy = -Math.abs(e.vy) * 0.62;
        e.bounces += 1;
      }

      const alpha = Math.min(1, e.life / 0.65);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(e.x, e.y);
      ctx.rotate(e.rot);
      ctx.font = `${Math.round(e.size)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.fillText(e.char, 0, 0);
      ctx.restore();
    }

    ctx.restore();
  }
}
