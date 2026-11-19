/**
 * Layer 1: Accumulating background spectacle canvas.
 * Layers stack progressively from subtle obsidian spotlight to full cosmic rave cathedral.
 */

export class BackgroundCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.time = 0;
    this.pulse = 0;
    this.hueShift = 0;
    this.glitchBurst = 0;
    this.stars = [];
    this.bokeh = [];
    this.initPools();
  }

  initPools() {
    this.stars = Array.from({ length: 170 }, () => this.makeStar(true));
    this.bokeh = Array.from({ length: 34 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 20 + Math.random() * 75,
      vx: (Math.random() - 0.5) * 0.035,
      vy: -0.015 - Math.random() * 0.03,
      hue: Math.random() * 360,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  makeStar(randomZ = false) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 0.08 + Math.random() * 0.92;
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      z: randomZ ? Math.random() : 1,
      hue: Math.random() * 360,
    };
  }

  resize(width, height) {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = width;
    this.height = height;
    this.canvas.width = Math.max(1, Math.floor(width * this.dpr));
    this.canvas.height = Math.max(1, Math.floor(height * this.dpr));
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  triggerPulse(strength = 1, glitch = false) {
    this.pulse = Math.min(2.2, this.pulse + strength);
    if (glitch) {
      this.glitchBurst = Math.min(1.4, this.glitchBurst + 0.85);
    }
  }

  reset() {
    this.pulse = 0;
    this.glitchBurst = 0;
    this.hueShift = 0;
  }

  render(dt, state) {
    const { level, clicks, combo, softMode, centerX, centerY } = state;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    if (!w || !h) return;

    const motionScale = softMode ? 0.35 : 1;
    const speedBoost = 1 + Math.min(combo, 24) * 0.06 + Math.max(0, level - 5) * 0.14;
    this.time += dt * speedBoost * motionScale;
    this.pulse = Math.max(0, this.pulse - dt * 2.8);
    this.glitchBurst = Math.max(0, this.glitchBurst - dt * 4.5);

    if (level >= 1) {
      this.hueShift = (this.hueShift + dt * (14 + level * 11) * motionScale) % 360;
    }

    const cx = centerX || w * 0.5;
    const cy = centerY || h * 0.5;
    const maxR = Math.hypot(w, h) * 0.72;

    // 0. Base dark backdrop with escalating luminous aura
    this.drawBackdrop(ctx, w, h, cx, cy, maxR, level, clicks);

    if (level === 0) return;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // 1. Floating luminous bokeh orbs (Level 1+)
    this.drawBokeh(ctx, w, h, dt * motionScale, level);

    // 2. Rotating golden / prismatic sunbeams (Level 2+)
    if (level >= 2) {
      this.drawSunbeams(ctx, cx, cy, maxR, level, combo);
    }

    // 3. Synthwave perspective horizon grid (Level 5+)
    if (level >= 5) {
      this.drawSynthGrid(ctx, w, h, level);
    }

    // 4. Hyperspace warp starfield (Level 5+)
    if (level >= 5) {
      this.drawStarfield(ctx, w, h, cx, cy, dt * motionScale, level, combo);
    }

    // 5. Dimensional rainbow vortex spiral (Level 7+)
    if (level >= 7) {
      this.drawVortex(ctx, cx, cy, maxR, level);
    }

    // 6. Kaleidoscopic prismatic rings & mandala (Level 4+, richer at 6+ and 8+)
    if (level >= 4) {
      this.drawSacredMandala(ctx, cx, cy, Math.min(w, h), level);
    }

    // 7. Stadium concert laser beams (Level 3+)
    if (level >= 3) {
      this.drawLasers(ctx, w, h, level, combo);
    }

    // 8. Twin orbiting plasma suns (Level 8+)
    if (level >= 8) {
      this.drawOrbitingSuns(ctx, cx, cy, Math.min(w, h), level);
    }

    // 9. Reality glitch scanline bands (Level 8+, reduced in softMode)
    if (level >= 8 && !softMode && (this.glitchBurst > 0.08 || level >= 9)) {
      this.drawRealityGlitches(ctx, w, h, level);
    }

    ctx.restore();
  }

  drawBackdrop(ctx, w, h, cx, cy, maxR, level, clicks) {
    if (level === 0) {
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, maxR);
      grad.addColorStop(0, '#181426');
      grad.addColorStop(0.45, '#0d0c14');
      grad.addColorStop(1, '#07070b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      return;
    }

    const baseHue = (320 + this.hueShift) % 360;
    const altHue = (baseHue + 70 + level * 14) % 360;
    const thirdHue = (baseHue + 185) % 360;
    const pulseBoost = Math.min(18, this.pulse * 8);
    const lightnessCore = Math.min(34, 11 + level * 2.1 + pulseBoost * 0.45);
    const lightnessMid = Math.min(20, 6 + level * 1.3);

    const grad = ctx.createRadialGradient(cx, cy, 12, cx, cy, maxR);
    grad.addColorStop(0, `hsl(${baseHue}, ${Math.min(100, 65 + level * 4)}%, ${lightnessCore}%)`);
    grad.addColorStop(0.48, `hsl(${altHue}, ${Math.min(95, 55 + level * 4)}%, ${lightnessMid}%)`);
    grad.addColorStop(1, `hsl(${thirdHue}, ${Math.min(85, 40 + level * 4)}%, ${Math.min(11, 4 + level * 0.65)}%)`);

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Extra click-reactive warm radial wash
    if (this.pulse > 0.02) {
      const wash = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * (0.55 + this.pulse * 0.25));
      const alpha = Math.min(0.28, this.pulse * 0.14 * (0.5 + Math.min(clicks, 60) / 100));
      wash.addColorStop(0, `hsla(${(baseHue + 45) % 360}, 100%, 70%, ${alpha})`);
      wash.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, w, h);
    }
  }

  drawBokeh(ctx, w, h, dt, level) {
    const count = Math.min(this.bokeh.length, 6 + level * 3);
    for (let i = 0; i < count; i += 1) {
      const b = this.bokeh[i];
      b.x += b.vx * dt * (1 + level * 0.2);
      b.y += b.vy * dt * (1 + level * 0.2);
      if (b.y < -0.15) {
        b.y = 1.15;
        b.x = Math.random();
      }
      if (b.x < -0.15) b.x = 1.15;
      if (b.x > 1.15) b.x = -0.15;

      const px = b.x * w;
      const py = b.y * h;
      const radius = b.r * (0.7 + 0.35 * Math.sin(this.time * 1.8 + b.phase)) * (1 + this.pulse * 0.12);
      const hue = (b.hue + this.hueShift) % 360;
      const alpha = Math.min(0.22, 0.06 + level * 0.015);

      const g = ctx.createRadialGradient(px, py, 0, px, py, radius);
      g.addColorStop(0, `hsla(${hue}, 100%, 70%, ${alpha})`);
      g.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawSunbeams(ctx, cx, cy, maxR, level, combo) {
    const rays = Math.min(28, 8 + level * 2);
    const angleStep = (Math.PI * 2) / rays;
    const baseRot = this.time * (0.22 + level * 0.045);
    const alpha = Math.min(0.22, 0.055 + level * 0.016 + this.pulse * 0.04);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(baseRot);

    for (let i = 0; i < rays; i += 1) {
      const a0 = i * angleStep;
      const spread = angleStep * (0.28 + Math.min(combo, 12) * 0.01);
      const hue = (this.hueShift + (i * 360) / rays) % 360;

      const grad = ctx.createRadialGradient(0, 0, 20, 0, 0, maxR);
      grad.addColorStop(0, `hsla(${hue}, 100%, 70%, ${alpha})`);
      grad.addColorStop(0.6, `hsla(${(hue + 30) % 360}, 100%, 55%, ${alpha * 0.45})`);
      grad.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, maxR, a0, a0 + spread);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  drawLasers(ctx, w, h, level, combo) {
    const pairCount = level >= 9 ? 7 : level >= 7 ? 5 : level >= 5 ? 4 : 2;
    const alpha = Math.min(0.42, 0.14 + (level - 2) * 0.035 + this.pulse * 0.08);
    const length = Math.hypot(w, h) * 1.15;

    const origins = [
      { x: 0, y: h, baseAngle: -Math.PI * 0.25 },
      { x: w, y: h, baseAngle: -Math.PI * 0.75 },
    ];
    if (level >= 6) {
      origins.push({ x: w * 0.15, y: 0, baseAngle: Math.PI * 0.42 });
      origins.push({ x: w * 0.85, y: 0, baseAngle: Math.PI * 0.58 });
    }

    origins.forEach((origin, oIdx) => {
      for (let i = 0; i < pairCount; i += 1) {
        const freq = 0.85 + i * 0.31 + oIdx * 0.19;
        const sweep = Math.sin(this.time * freq + i * 1.7 + oIdx) * 0.62;
        const angle = origin.baseAngle + sweep;
        const hue = (this.hueShift * 1.4 + i * 52 + oIdx * 110) % 360;
        const beamWidth = 4 + (level >= 7 ? 4 : 2) + Math.min(combo, 15) * 0.25;

        const ex = origin.x + Math.cos(angle) * length;
        const ey = origin.y + Math.sin(angle) * length;

        const grad = ctx.createLinearGradient(origin.x, origin.y, ex, ey);
        grad.addColorStop(0, `hsla(${hue}, 100%, 75%, ${alpha * 1.3})`);
        grad.addColorStop(0.55, `hsla(${hue}, 100%, 60%, ${alpha * 0.6})`);
        grad.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = beamWidth;
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        // Crisp hot inner laser core
        ctx.strokeStyle = `hsla(${hue}, 100%, 92%, ${alpha * 0.9})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });
  }

  drawSynthGrid(ctx, w, h, level) {
    const horizonY = h * 0.54;
    const gridHeight = h - horizonY;
    const hue = (295 + this.hueShift * 0.8) % 360;
    const alpha = Math.min(0.45, 0.16 + (level - 4) * 0.05 + this.pulse * 0.08);

    ctx.save();
    ctx.strokeStyle = `hsla(${hue}, 100%, 62%, ${alpha})`;
    ctx.lineWidth = 1.3;

    // Horizontal perspective lines rushing toward viewer
    const rows = 14;
    const scroll = (this.time * 1.4) % 1;
    for (let i = 0; i < rows; i += 1) {
      const t = (i + scroll) / rows;
      const y = horizonY + Math.pow(t, 2.2) * gridHeight;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Converging vertical perspective lines
    const cols = 18;
    const vanishX = w * 0.5;
    for (let i = -cols; i <= cols; i += 1) {
      const bottomX = vanishX + (i / cols) * w * 2.1;
      ctx.beginPath();
      ctx.moveTo(vanishX, horizonY);
      ctx.lineTo(bottomX, h);
      ctx.stroke();
    }

    // Glowing horizon bar
    const hGrad = ctx.createLinearGradient(0, horizonY - 24, 0, horizonY + 24);
    hGrad.addColorStop(0, 'hsla(0,0%,0%,0)');
    hGrad.addColorStop(0.5, `hsla(${(hue + 50) % 360}, 100%, 65%, ${alpha * 0.85})`);
    hGrad.addColorStop(1, 'hsla(0,0%,0%,0)');
    ctx.fillStyle = hGrad;
    ctx.fillRect(0, horizonY - 24, w, 48);

    ctx.restore();
  }

  drawStarfield(ctx, w, h, cx, cy, dt, level, combo) {
    const speed = (0.38 + (level - 4) * 0.18 + Math.min(combo, 18) * 0.035) * dt;
    const activeCount = Math.min(this.stars.length, 65 + (level - 4) * 20);
    const scale = Math.max(w, h) * 0.65;

    ctx.lineCap = 'round';
    for (let i = 0; i < activeCount; i += 1) {
      const s = this.stars[i];
      const prevZ = s.z;
      s.z -= speed;
      if (s.z <= 0.03) {
        Object.assign(s, this.makeStar(false));
        continue;
      }

      const x1 = cx + (s.x / prevZ) * scale;
      const y1 = cy + (s.y / prevZ) * scale;
      const x2 = cx + (s.x / s.z) * scale;
      const y2 = cy + (s.y / s.z) * scale;

      const alpha = Math.min(0.95, (1 - s.z) * 1.15);
      const hue = (s.hue + this.hueShift) % 360;
      ctx.strokeStyle = `hsla(${hue}, 100%, 82%, ${alpha})`;
      ctx.lineWidth = Math.max(1, (1 - s.z) * 3.2);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  drawSacredMandala(ctx, cx, cy, minDim, level) {
    const ringCount = Math.min(5, Math.floor((level - 2) / 1.6));
    const pulseScale = 1 + this.pulse * 0.08;

    ctx.save();
    ctx.translate(cx, cy);

    for (let r = 0; r < ringCount; r += 1) {
      const radius = minDim * (0.21 + r * 0.085) * pulseScale;
      const sides = 6 + r * 2;
      const dir = r % 2 === 0 ? 1 : -1;
      const rot = this.time * (0.35 + r * 0.14) * dir;
      const hue = (this.hueShift + r * 65) % 360;
      const alpha = Math.min(0.45, 0.14 + (level - 3) * 0.04);

      ctx.save();
      ctx.rotate(rot);
      ctx.strokeStyle = `hsla(${hue}, 100%, 68%, ${alpha})`;
      ctx.lineWidth = r === 0 ? 2.4 : 1.6;

      // Polygon ring
      ctx.beginPath();
      for (let i = 0; i <= sides; i += 1) {
        const a = (i / sides) * Math.PI * 2;
        const px = Math.cos(a) * radius;
        const py = Math.sin(a) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Star-connected vertices at level 6+
      if (level >= 6) {
        ctx.strokeStyle = `hsla(${(hue + 140) % 360}, 100%, 72%, ${alpha * 0.6})`;
        ctx.beginPath();
        for (let i = 0; i < sides; i += 1) {
          const a1 = (i / sides) * Math.PI * 2;
          const a2 = ((i + 2) / sides) * Math.PI * 2;
          ctx.moveTo(Math.cos(a1) * radius, Math.sin(a1) * radius);
          ctx.lineTo(Math.cos(a2) * radius, Math.sin(a2) * radius);
        }
        ctx.stroke();
      }

      // Dashed outer halo
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.07, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    }

    ctx.restore();
  }

  drawVortex(ctx, cx, cy, maxR, level) {
    const arms = level >= 9 ? 10 : 7;
    const steps = 28;
    const alpha = Math.min(0.32, 0.1 + (level - 6) * 0.05);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.time * 0.55);

    for (let arm = 0; arm < arms; arm += 1) {
      const baseAngle = (arm / arms) * Math.PI * 2;
      const hue = (this.hueShift + arm * (360 / arms)) % 360;
      ctx.strokeStyle = `hsla(${hue}, 100%, 66%, ${alpha})`;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      for (let s = 1; s <= steps; s += 1) {
        const t = s / steps;
        const r = t * maxR * 0.92;
        const a = baseAngle + t * 4.4;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (s === 1) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  drawOrbitingSuns(ctx, cx, cy, minDim, level) {
    const count = level >= 10 ? 4 : 2;
    const orbitR = minDim * 0.34;
    for (let i = 0; i < count; i += 1) {
      const angle = this.time * 1.25 + (i * Math.PI * 2) / count;
      const sx = cx + Math.cos(angle) * orbitR * 1.28;
      const sy = cy + Math.sin(angle) * orbitR * 0.72;
      const r = 24 + this.pulse * 12;
      const hue = (this.hueShift + i * 90 + 40) % 360;

      const grad = ctx.createRadialGradient(sx, sy, 2, sx, sy, r * 2.4);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, `hsla(${hue}, 100%, 68%, 0.9)`);
      grad.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sx, sy, r * 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawRealityGlitches(ctx, w, h, level) {
    const slices = level >= 10 ? 7 : 4;
    const strength = Math.max(this.glitchBurst, level >= 9 ? 0.35 : 0);
    for (let i = 0; i < slices; i += 1) {
      if (Math.random() > 0.55) continue;
      const y = Math.random() * h;
      const bandH = 2 + Math.random() * 14;
      const hue = (this.hueShift + Math.random() * 180) % 360;
      ctx.fillStyle = `hsla(${hue}, 100%, 68%, ${0.09 * strength})`;
      ctx.fillRect(0, y, w, bandH);
    }
  }
}
