/**
 * КНОПКА «СДЕЛАТЬ ЗАЕБИСЬ»
 * Движок зрелищного хаоса, процедурного звука и наложения визуальных эффектов
 */

(function () {
  'use strict';

  // --- STATE ---
  let clicksCount = 0;
  let zaebisPercent = 0;
  let combo = 0;
  let maxCombo = 0;
  let lastClickTime = 0;
  let recentClicks = [];
  let cps = 0;
  let isSoundEnabled = true;
  let isTurboHolding = false;
  let turboInterval = null;

  // --- DOM ELEMENTS ---
  const zaebisBtn = document.getElementById('zaebis-btn');
  const btnEmoji = document.getElementById('btn-emoji');
  const btnText = document.getElementById('btn-text');
  const btnSubtext = document.getElementById('btn-subtext');
  const buttonAura = document.getElementById('button-aura');
  const shockwaveHolder = document.getElementById('shockwave-holder');
  const percentVal = document.getElementById('percent-val');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const clicksCountEl = document.getElementById('clicks-count');
  const comboMultiplierEl = document.getElementById('combo-multiplier');
  const cpsValEl = document.getElementById('cps-val');
  const statusBadge = document.getElementById('status-badge');
  const comboHypeText = document.getElementById('combo-hype-text');
  const soundBtn = document.getElementById('sound-btn');
  const soundIcon = document.getElementById('sound-icon');
  const soundLabel = document.getElementById('sound-label');
  const resetBtn = document.getElementById('reset-btn');
  const flashOverlay = document.getElementById('flash-overlay');
  const discoBall = document.getElementById('disco-ball-container');
  const memeTextContainer = document.getElementById('meme-text-container');
  const popupContainer = document.getElementById('popup-container');

  // Canvases
  const bgCanvas = document.getElementById('bg-canvas');
  const bgCtx = bgCanvas.getContext('2d');
  const particleCanvas = document.getElementById('particle-canvas');
  const pCtx = particleCanvas.getContext('2d');

  let width = window.innerWidth;
  let height = window.innerHeight;

  function resizeCanvases() {
    width = window.innerWidth;
    height = window.innerHeight;
    bgCanvas.width = width;
    bgCanvas.height = height;
    particleCanvas.width = width;
    particleCanvas.height = height;
  }
  window.addEventListener('resize', resizeCanvases);
  resizeCanvases();

  // --- WEB AUDIO API PROCEDURAL SOUND ENGINE ---
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Play synthesized punchy bass drop & melody chime
  const PENTATONIC = [220, 246.94, 277.18, 329.63, 369.99, 440, 493.88, 554.37, 659.25, 739.99, 880];

  function playSoundClick(currentCombo) {
    if (!isSoundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;

    // 1. Punchy Sub-Bass Thump
    const subOsc = audioCtx.createOscillator();
    const subGain = audioCtx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140 + Math.min(currentCombo * 2, 80), now);
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.18);

    subGain.gain.setValueAtTime(0.45, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    subOsc.connect(subGain);
    subGain.connect(audioCtx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.25);

    // 2. Harmonic Synth Chime (Arpeggios as combo climbs)
    const noteIndex = (currentCombo - 1) % PENTATONIC.length;
    const freq = PENTATONIC[noteIndex] * (1 + Math.floor((currentCombo - 1) / PENTATONIC.length) * 0.5);

    const chimeOsc = audioCtx.createOscillator();
    const chimeGain = audioCtx.createGain();
    chimeOsc.type = (currentCombo > 20) ? 'sawtooth' : 'triangle';
    chimeOsc.frequency.setValueAtTime(freq, now);

    chimeGain.gain.setValueAtTime(0.18, now);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    chimeOsc.connect(chimeGain);
    chimeGain.connect(audioCtx.destination);
    chimeOsc.start(now);
    chimeOsc.stop(now + 0.38);

    // 3. Milestone Fanfare (every 15 clicks or high combos)
    if (currentCombo > 0 && currentCombo % 15 === 0) {
      playMilestoneFanfare();
    }
  }

  function playMilestoneFanfare() {
    if (!isSoundEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C Major epic
    chord.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.12, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + 0.75);
    });
  }

  // Sound toggle button
  soundBtn.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    if (isSoundEnabled) {
      soundIcon.textContent = '🔊';
      soundLabel.textContent = 'Звук: ВКЛ';
      initAudio();
    } else {
      soundIcon.textContent = '🔇';
      soundLabel.textContent = 'Звук: ВЫКЛ';
    }
  });

  // --- SCREEN SHAKE SPRING SIMULATION ---
  let shake = { x: 0, y: 0, r: 0, vx: 0, vy: 0, vr: 0 };

  function addScreenShake(intensity) {
    const angle = Math.random() * Math.PI * 2;
    const force = Math.min(intensity, 30);
    shake.vx += Math.cos(angle) * force;
    shake.vy += Math.sin(angle) * force;
    shake.vr += (Math.random() - 0.5) * force * 0.4;
  }

  function updateScreenShake() {
    const k = 0.22; // spring constant
    const d = 0.74; // damping

    shake.vx += -k * shake.x;
    shake.vy += -k * shake.y;
    shake.vr += -k * shake.r;

    shake.vx *= d;
    shake.vy *= d;
    shake.vr *= d;

    shake.x += shake.vx;
    shake.y += shake.vy;
    shake.r += shake.vr;

    document.body.style.setProperty('--shake-x', `${shake.x.toFixed(2)}px`);
    document.body.style.setProperty('--shake-y', `${shake.y.toFixed(2)}px`);
    document.body.style.setProperty('--shake-r', `${shake.r.toFixed(2)}deg`);
  }

  // --- BACKGROUND CANVAS (HYPERSPACE STARS & LASERS) ---
  const stars = [];
  const numStars = 200;
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: (Math.random() - 0.5) * 1600,
      y: (Math.random() - 0.5) * 1600,
      z: Math.random() * 1000 + 1,
      size: Math.random() * 2 + 1,
      color: ['#ff007f', '#00f2fe', '#00ff87', '#ffb703', '#ffffff'][Math.floor(Math.random() * 5)]
    });
  }

  let laserAngle = 0;

  function renderBackground() {
    bgCtx.clearRect(0, 0, width, height);

    // Deep space dark gradient
    const bgGrad = bgCtx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, Math.max(width, height) / 1.2);
    const auraIntensity = Math.min(zaebisPercent / 100, 10);
    const rVal = Math.min(255, Math.floor(10 + auraIntensity * 12));
    const gVal = Math.min(255, Math.floor(6 + auraIntensity * 5));
    const bVal = Math.min(255, Math.floor(25 + auraIntensity * 15));

    bgGrad.addColorStop(0, `rgb(${rVal}, ${gVal}, ${bVal})`);
    bgGrad.addColorStop(1, '#050308');
    bgCtx.fillStyle = bgGrad;
    bgCtx.fillRect(0, 0, width, height);

    // Warp speed stars
    const speed = 1.5 + Math.min(combo * 1.2, 45);
    const cx = width / 2;
    const cy = height / 2;

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.z -= speed;
      if (s.z <= 0) {
        s.z = 1000;
        s.x = (Math.random() - 0.5) * 1600;
        s.y = (Math.random() - 0.5) * 1600;
      }

      const k = 400 / s.z;
      const px = s.x * k + cx;
      const py = s.y * k + cy;

      if (px >= 0 && px <= width && py >= 0 && py <= height) {
        const prevK = 400 / (s.z + speed * 1.5);
        const prevX = s.x * prevK + cx;
        const prevY = s.y * prevK + cy;

        bgCtx.strokeStyle = s.color;
        bgCtx.lineWidth = Math.min(k * s.size, 5);
        bgCtx.beginPath();
        bgCtx.moveTo(prevX, prevY);
        bgCtx.lineTo(px, py);
        bgCtx.stroke();
      }
    }

    // Laser sweeps at higher combo / zaebis levels
    if (zaebisPercent >= 50 || combo >= 8) {
      laserAngle += 0.02 + Math.min(combo * 0.004, 0.08);
      const laserCount = Math.min(1 + Math.floor(zaebisPercent / 120), 8);
      for (let i = 0; i < laserCount; i++) {
        const offset = (Math.PI * 2 / laserCount) * i;
        const beamAngle = laserAngle + offset;
        const lx = cx + Math.cos(beamAngle) * width * 1.5;
        const ly = cy + Math.sin(beamAngle) * height * 1.5;

        const laserGrad = bgCtx.createLinearGradient(cx, cy, lx, ly);
        const hue = (laserAngle * 50 + i * 45) % 360;
        laserGrad.addColorStop(0, `hsla(${hue}, 100%, 75%, 0.5)`);
        laserGrad.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);

        bgCtx.save();
        bgCtx.strokeStyle = laserGrad;
        bgCtx.lineWidth = 3 + Math.min(combo * 0.4, 12);
        bgCtx.shadowColor = `hsl(${hue}, 100%, 70%)`;
        bgCtx.shadowBlur = 20;
        bgCtx.beginPath();
        bgCtx.moveTo(cx, cy);
        bgCtx.lineTo(lx, ly);
        bgCtx.stroke();
        bgCtx.restore();
      }
    }
  }

  // --- FOREGROUND PARTICLES (CONFETTI, SPARKS, EMOJIS, SMOKE RINGS) ---
  const particles = [];
  const emojisPool = ['💨', '🤙🏼', '🔥', '🚀', '👑', '✨', '💎', '💸', '🦄', '🌈', '⚡', '🥳', '🛸', '🍾', '🕺', '🎆', '🌟'];

  function spawnParticles(originX, originY, count) {
    const isBigBurst = count > 30;
    const colors = ['#ff007f', '#00f2fe', '#ffb703', '#00ff87', '#aa00ff', '#ffffff'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 3 + (isBigBurst ? 6 : 0);
      const type = Math.random();

      if (type < 0.45) {
        // Confetti Ribbon / Quad
        particles.push({
          kind: 'confetti',
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          rot: Math.random() * 360,
          vrot: (Math.random() - 0.5) * 15,
          size: Math.random() * 12 + 8,
          aspect: Math.random() * 0.6 + 0.4,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 1.0,
          decay: Math.random() * 0.015 + 0.008,
          gravity: 0.28
        });
      } else if (type < 0.75) {
        // Glowing Spark
        particles.push({
          kind: 'spark',
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed * 1.5,
          vy: Math.sin(angle) * speed * 1.5,
          size: Math.random() * 4 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 1.0,
          decay: Math.random() * 0.025 + 0.015,
          gravity: 0.15
        });
      } else if (type < 0.90) {
        // Floating Emoji
        particles.push({
          kind: 'emoji',
          char: emojisPool[Math.floor(Math.random() * emojisPool.length)],
          x: originX,
          y: originY,
          vx: Math.cos(angle) * (speed * 0.8),
          vy: Math.sin(angle) * (speed * 0.8) - 3,
          rot: (Math.random() - 0.5) * 30,
          vrot: (Math.random() - 0.5) * 5,
          size: Math.random() * 22 + 20,
          life: 1.0,
          decay: Math.random() * 0.018 + 0.01,
          gravity: 0.12
        });
      } else {
        // Smoke Ring (Кальянное колечко!)
        particles.push({
          kind: 'smoke',
          x: originX,
          y: originY,
          vx: Math.cos(angle) * (speed * 0.4),
          vy: Math.sin(angle) * (speed * 0.4) - 1.5,
          radius: 12,
          maxRadius: Math.random() * 70 + 50,
          growth: Math.random() * 1.8 + 1.2,
          life: 1.0,
          decay: Math.random() * 0.015 + 0.01,
          gravity: -0.05 // gently floats up
        });
      }
    }
  }

  function renderParticles() {
    pCtx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.life -= p.decay;

      if (p.life <= 0 || p.y > height + 100 || p.x < -100 || p.x > width + 100) {
        particles.splice(i, 1);
        continue;
      }

      pCtx.save();
      pCtx.globalAlpha = Math.max(0, p.life);

      if (p.kind === 'confetti') {
        p.rot += p.vrot;
        pCtx.translate(p.x, p.y);
        pCtx.rotate((p.rot * Math.PI) / 180);
        pCtx.fillStyle = p.color;
        const w = p.size;
        const h = p.size * p.aspect;
        pCtx.fillRect(-w / 2, -h / 2, w, h);
      } else if (p.kind === 'spark') {
        pCtx.fillStyle = p.color;
        pCtx.shadowColor = p.color;
        pCtx.shadowBlur = 10;
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        pCtx.fill();
      } else if (p.kind === 'emoji') {
        p.rot += p.vrot;
        pCtx.translate(p.x, p.y);
        pCtx.rotate((p.rot * Math.PI) / 180);
        pCtx.font = `${Math.floor(p.size)}px sans-serif`;
        pCtx.textAlign = 'center';
        pCtx.textBaseline = 'middle';
        pCtx.fillText(p.char, 0, 0);
      } else if (p.kind === 'smoke') {
        p.radius = Math.min(p.radius + p.growth, p.maxRadius);
        pCtx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        pCtx.lineWidth = Math.max(2, 6 * (1 - p.radius / p.maxRadius));
        pCtx.shadowColor = '#00f2fe';
        pCtx.shadowBlur = 15;
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        pCtx.stroke();
      }

      pCtx.restore();
    }
  }

  // --- FLOATING MEME TEXT GENERATOR ---
  const MEME_PHRASES = [
    'ЗАЕБИСЬ! 🚀',
    'ДУША ПОЁТ! ✨',
    'КАЙФАРИКИ! 🤙🏼',
    'ЛЮТЫЙ ДЫМ! 💨',
    'ВОТ ЭТО ДВИЖ! 🔥',
    'УЛЬТРА-МЕГА-ХОРОШ! ⚡',
    'ПОШЁЛ ПАР ПО ТРУБАМ! 💨',
    '1000 ИЗ 10! 💯',
    'ЧИСТОЕ ЗОЛОТО! 👑',
    'УГЛИ НА МАКСИМУМ! 💥',
    'ТУРБО-ЖМЫХ! 🌀',
    'СВЕРХЗВУКОВОЙ КАЙФ! 🛸',
    'РЕАЛЬНОСТЬ РВЁТСЯ! 🤯',
    'БРАТВА В ВОСТОРГЕ! 🤝',
    'ДАВАЙ ЕЩЁ! 🎯',
    'МАКСИМАЛЬНЫЙ РАСКУМАР! 🏖️',
    'ШЕДЕВРАЛЬНО! 🦄',
    'УРОВЕНЬ: БОГ! 🌟'
  ];

  const MEME_COLORS = ['#ff007f', '#00f2fe', '#00ff87', '#ffb703', '#ff0055', '#a855f7'];

  function spawnMemeText(originX, originY) {
    const textEl = document.createElement('div');
    textEl.className = 'meme-text';
    const phrase = MEME_PHRASES[Math.floor(Math.random() * MEME_PHRASES.length)];
    textEl.textContent = phrase;

    const posX = originX || (width * 0.2 + Math.random() * width * 0.6);
    const posY = originY || (height * 0.3 + Math.random() * height * 0.4);
    const rot = (Math.random() - 0.5) * 36;
    const color = MEME_COLORS[Math.floor(Math.random() * MEME_COLORS.length)];

    textEl.style.left = `${posX}px`;
    textEl.style.top = `${posY}px`;
    textEl.style.color = color;
    textEl.style.setProperty('--rot', `${rot}deg`);

    memeTextContainer.appendChild(textEl);

    setTimeout(() => {
      if (textEl.parentNode) {
        textEl.parentNode.removeChild(textEl);
      }
    }, 1200);
  }

  // --- ABSURD RETRO POPUP DIALOGS ---
  const POPUP_MESSAGES = [
    {
      title: '⚠️ КРИТИЧЕСКИЙ ЗАЕБИСЬ',
      body: 'Внимание! Обнаружено превышение допустимых норм душевного кайфа в 500 раз. Продолжить разгон?',
      btn: 'ДА, ЕЩЁ БОЛЬШЕ КАЙФА! 🔥'
    },
    {
      title: '🚨 РОСКАЛЬЯННАДЗОР',
      body: 'Уведомление: Вам присвоена высшая категория мастера раскумара и почётный орден Плотного Дыма.',
      btn: 'ПРИНЯТЬ НАГРАДУ 🤙🏼'
    },
    {
      title: '🌀 СБОЙ МАТРИЦЫ',
      body: 'Физические законы Вселенной временно отключены из-за избытка положительных вибраций.',
      btn: 'РАЗРЫВАТЬ ДАЛЬШЕ 🚀'
    },
    {
      title: '👑 СИНГУЛЯРНОСТЬ ЗАЕБИСЯ',
      body: 'Кнопка перегрелась до температуры термоядерного угля! Рекомендуется не останавливаться ни на секунду!',
      btn: 'ПОГНАЛИ НА ПОЛНУЮ! ⚡'
    }
  ];

  let nextPopupMilestone = 25;

  function spawnAbsurdPopup() {
    const data = POPUP_MESSAGES[Math.floor(Math.random() * POPUP_MESSAGES.length)];
    const popup = document.createElement('div');
    popup.className = 'absurd-popup';

    // Random placement within safe screen bounds
    const rx = Math.max(20, Math.min(width - 330, Math.random() * (width - 330)));
    const ry = Math.max(60, Math.min(height - 240, Math.random() * (height - 240)));
    popup.style.left = `${rx}px`;
    popup.style.top = `${ry}px`;

    popup.innerHTML = `
      <div class="popup-titlebar">
        <span>${data.title}</span>
        <button class="popup-close-btn" type="button">✕</button>
      </div>
      <div class="popup-body">
        <p>${data.body}</p>
        <button class="popup-btn" type="button">${data.btn}</button>
      </div>
    `;

    const closeHandler = () => {
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
    };

    popup.querySelector('.popup-close-btn').addEventListener('click', closeHandler);
    popup.querySelector('.popup-btn').addEventListener('click', () => {
      closeHandler();
      triggerZaebis(rx + 150, ry + 100);
    });

    popupContainer.appendChild(popup);

    setTimeout(() => {
      closeHandler();
    }, 7000);
  }

  // --- SHOCKWAVE RING EFFECT ---
  function spawnShockwave() {
    const ring = document.createElement('div');
    ring.className = 'shockwave-ring';
    shockwaveHolder.appendChild(ring);
    setTimeout(() => {
      if (ring.parentNode) {
        ring.parentNode.removeChild(ring);
      }
    }, 800);
  }

  // --- STATUS BADGES & TITLES ---
  function getStatusInfo(percent) {
    if (percent === 0) return { title: '0% — Серая обыденность 🥱', emoji: '✨', btn: 'СДЕЛАТЬ ЗАЕБИСЬ' };
    if (percent < 25) return { title: 'Первые искорки кайфа 💫', emoji: '✨', btn: 'ЕЩЁ ЗАЕБИСТЕЕ!' };
    if (percent < 60) return { title: 'Сочный раскумар по красоте 💨🤙🏼', emoji: '🤙🏼', btn: 'ДАВИ ДО УПОРА!' };
    if (percent < 100) return { title: 'Ультра-заебись разгоняется! 🚀🔥', emoji: '🔥', btn: 'ТУРБО-ЗАЕБИСЬ!' };
    if (percent < 180) return { title: 'ОФИЦИАЛЬНО: ЗАЕБИСЬ НА 100%! 💥🎉', emoji: '💥', btn: 'УЖЕ ЛЮТО ЗАЕБИСЬ!' };
    if (percent < 350) return { title: 'СВЕРХЗВУКОВОЙ ТУРБО-УГАР 🕺⚡', emoji: '⚡', btn: 'РЕАЛЬНОСТЬ ТРЕЩИТ!' };
    if (percent < 700) return { title: 'МЕЖГАЛАКТИЧЕСКИЙ ЖМЫХ И ВЕЛИКИЙ КАЙФ 🌌👑', emoji: '👑', btn: 'АННИГИЛЯЦИЯ ТОСКИ!' };
    if (percent < 1200) return { title: 'СВЕРХРАЗУМНЫЙ КАЛИК-ПАНК: РЕАЛЬНОСТЬ РАССЛОИЛАСЬ 🌀🚨', emoji: '🌀', btn: 'НЕ ОСТАНАВЛИВАЙСЯ!' };
    return { title: 'НЕПРИЛИЧНО-АБСУРДНЫЙ АБСОЛЮТНЫЙ ЗАЕБИСЕЦ 🦄🌈♾️', emoji: '🦄', btn: 'СИНГУЛЯРНОСТЬ ЗАЕБИСЯ!' };
  }

  // Flash screen effect
  function flashScreen() {
    flashOverlay.style.opacity = '0.7';
    setTimeout(() => {
      flashOverlay.style.opacity = '0';
    }, 120);
  }

  // --- CORE CLICK / INTERACTION LOGIC ---
  function triggerZaebis(clientX, clientY) {
    const now = performance.now();
    clicksCount++;

    // Track clicks for CPS calculation
    recentClicks.push(now);
    recentClicks = recentClicks.filter(t => now - t < 1000);
    cps = recentClicks.length;

    // Combo system
    if (now - lastClickTime < 900) {
      combo++;
    } else {
      combo = 1;
    }
    lastClickTime = now;
    if (combo > maxCombo) maxCombo = combo;

    // Escalating percentage: base increment + combo multiplier
    const comboBoost = 1 + Math.floor(combo / 4) * 0.5;
    const increment = Math.round((2.5 + Math.random() * 2) * comboBoost);
    zaebisPercent += increment;

    // Center coordinates fallback
    const rect = zaebisBtn.getBoundingClientRect();
    const originX = clientX !== undefined ? clientX : rect.left + rect.width / 2;
    const originY = clientY !== undefined ? clientY : rect.top + rect.height / 2;

    // Visual: Screen shake
    const shakeIntensity = 4 + Math.min(combo * 1.2, 28);
    addScreenShake(shakeIntensity);

    // Visual: Shockwave
    spawnShockwave();

    // Visual: Canvas Particles
    const particleCount = 45 + Math.min(combo * 4, 150);
    spawnParticles(originX, originY, particleCount);

    // Visual: Meme Text (random chance or high combo)
    if (Math.random() < 0.45 || combo % 5 === 0) {
      spawnMemeText(originX, originY);
    }

    // Audio: Synthesized tones
    playSoundClick(combo);

    // Visual: Screen flash on milestones
    if (combo > 0 && (combo % 20 === 0 || zaebisPercent % 100 < increment)) {
      flashScreen();
    }

    // Absurd Popup Trigger
    if (clicksCount >= nextPopupMilestone) {
      spawnAbsurdPopup();
      nextPopupMilestone += Math.floor(25 + Math.random() * 20);
    }

    // Disco ball activates at 60% zaebis or combo >= 12
    if (zaebisPercent >= 60 || combo >= 12) {
      discoBall.classList.add('active');
    }

    // Button visual pump
    zaebisBtn.classList.remove('is-active');
    void zaebisBtn.offsetWidth; // reflow
    zaebisBtn.classList.add('is-active');
    setTimeout(() => {
      if (!isTurboHolding) zaebisBtn.classList.remove('is-active');
    }, 120);

    // Combo multiplier pump animation
    comboMultiplierEl.classList.remove('combo-pump');
    void comboMultiplierEl.offsetWidth;
    comboMultiplierEl.classList.add('combo-pump');

    // Update HUD
    updateHUD();
  }

  function updateHUD() {
    clicksCountEl.textContent = clicksCount.toLocaleString('ru-RU');
    percentVal.textContent = zaebisPercent.toLocaleString('ru-RU');
    comboMultiplierEl.textContent = `x${combo}`;
    cpsValEl.textContent = cps.toFixed(1);

    // Progress bar fill (capped at 100% visually, but continues infinitely!)
    const fillPercent = Math.min(zaebisPercent, 100);
    progressBarFill.style.width = `${fillPercent}%`;

    // Dynamic titles
    const statusInfo = getStatusInfo(zaebisPercent);
    statusBadge.textContent = statusInfo.title;
    btnEmoji.textContent = statusInfo.emoji;
    btnText.textContent = statusInfo.btn;

    // Combo Hype Text
    if (combo >= 40) {
      comboHypeText.textContent = `🔥 БОЖЕСТВЕННОЕ КОМБО x${combo}! ВЫ ПРЕВЗОШЛИ ВСЁ! 🔥`;
      comboHypeText.style.color = '#00ff87';
    } else if (combo >= 20) {
      comboHypeText.textContent = `⚡ ГИПЕР-СКОРОСТЬ x${combo}! НЕ СНИЖАЙ ТЕМП! ⚡`;
      comboHypeText.style.color = '#00f2fe';
    } else if (combo >= 8) {
      comboHypeText.textContent = `🚀 РАЗГОН ПОШЁЛ x${combo}! ДАВИ ЕЩЁ! 🚀`;
      comboHypeText.style.color = '#ffb703';
    } else {
      comboHypeText.textContent = 'ЖМИ БЫСТРЕЕ ДЛЯ УЛЬТРА-КОМБО! 🔥';
      comboHypeText.style.color = '#ff007f';
    }
  }

  // --- BUTTON EVENT LISTENERS ---
  zaebisBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    triggerZaebis(e.clientX, e.clientY);

    // Turbo hold mode
    isTurboHolding = true;
    clearInterval(turboInterval);
    turboInterval = setInterval(() => {
      if (isTurboHolding) {
        triggerZaebis();
      }
    }, 75);
  });

  window.addEventListener('pointerup', () => {
    isTurboHolding = false;
    clearInterval(turboInterval);
  });

  window.addEventListener('pointercancel', () => {
    isTurboHolding = false;
    clearInterval(turboInterval);
  });

  // Keyboard controls: Spacebar or Enter
  let isSpaceDown = false;
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
      if (e.target.tagName === 'BUTTON' && e.target !== zaebisBtn) return;
      e.preventDefault();
      if (!isSpaceDown) {
        isSpaceDown = true;
        triggerZaebis();
        isTurboHolding = true;
        clearInterval(turboInterval);
        turboInterval = setInterval(() => {
          if (isTurboHolding) {
            triggerZaebis();
          }
        }, 75);
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
      isSpaceDown = false;
      isTurboHolding = false;
      clearInterval(turboInterval);
    }
  });

  // Combo decay timer (decays combo when idle)
  setInterval(() => {
    const now = performance.now();
    if (now - lastClickTime > 1200 && combo > 0) {
      combo = Math.max(0, combo - 1);
      updateHUD();
    }
    // Update CPS when decaying
    recentClicks = recentClicks.filter(t => now - t < 1000);
    cps = recentClicks.length;
    cpsValEl.textContent = cps.toFixed(1);
  }, 150);

  // Reset button
  resetBtn.addEventListener('click', () => {
    clicksCount = 0;
    zaebisPercent = 0;
    combo = 0;
    maxCombo = 0;
    recentClicks = [];
    cps = 0;
    particles.length = 0;
    discoBall.classList.remove('active');
    memeTextContainer.innerHTML = '';
    popupContainer.innerHTML = '';
    nextPopupMilestone = 25;
    updateHUD();
  });

  // --- ANIMATION LOOP ---
  function mainLoop() {
    updateScreenShake();
    renderBackground();
    renderParticles();
    requestAnimationFrame(mainLoop);
  }
  requestAnimationFrame(mainLoop);

  // Initialize display
  updateHUD();
})();
