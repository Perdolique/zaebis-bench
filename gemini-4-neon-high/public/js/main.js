/**
 * Main orchestrator for «Сделать заебись».
 * Connects input (mouse, touch, keyboard), escalation state, combo overdrive,
 * procedural audio, dual high-FPS canvases, and DOM spectacle layers.
 */

import { ZaebisAudio } from './audio.js';
import { BackgroundCanvas } from './bg-canvas.js';
import { DomChaos } from './dom-chaos.js';
import { EffectsCanvas } from './fx-canvas.js';
import { formatMeterDisplay, getStageForClicks } from './stages.js';

const els = {
  body: document.body,
  stageFrame: document.getElementById('stage-frame'),
  bgCanvas: document.getElementById('bg-canvas'),
  fxCanvas: document.getElementById('fx-canvas'),
  floatingLayer: document.getElementById('floating-layer'),
  stickersLayer: document.getElementById('stickers-layer'),
  equalizer: document.getElementById('equalizer'),
  tickerBottomTrack: document.getElementById('ticker-bottom-track'),
  tickerTopTrack: document.getElementById('ticker-top-track'),
  toastStack: document.getElementById('toast-stack'),
  milestoneBanner: document.getElementById('milestone-banner'),
  milestoneKicker: document.getElementById('milestone-kicker'),
  milestoneTitle: document.getElementById('milestone-title'),
  heroBtn: document.getElementById('zaebis-btn'),
  heroBtnTag: document.getElementById('btn-tag'),
  heroWrap: document.getElementById('hero-wrap'),
  stageSubtitle: document.getElementById('stage-subtitle'),
  stageBadge: document.getElementById('stage-badge'),
  clicksCount: document.getElementById('clicks-count'),
  meterValue: document.getElementById('meter-value'),
  meterFill: document.getElementById('meter-fill'),
  meterTrack: document.getElementById('meter-track'),
  comboPill: document.getElementById('combo-pill'),
  comboValue: document.getElementById('combo-value'),
  cpsValue: document.getElementById('cps-value'),
  soundBtn: document.getElementById('sound-toggle'),
  softBtn: document.getElementById('soft-toggle'),
  resetBtn: document.getElementById('reset-btn'),
  liveRegion: document.getElementById('live-announcer'),
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const state = {
  clicks: 0,
  level: 0,
  combo: 0,
  cps: 0,
  recentClickTimes: [],
  lastClickAt: 0,
  softMode: prefersReducedMotion,
  muted: false,
  centerX: window.innerWidth * 0.5,
  centerY: window.innerHeight * 0.5,
  shakeEnergy: 0,
  buttonSpring: 0,
};

const audio = new ZaebisAudio();
const bgCanvas = new BackgroundCanvas(els.bgCanvas);
const fxCanvas = new EffectsCanvas(els.fxCanvas);
const domChaos = new DomChaos(els);

function updateCenter() {
  const rect = els.heroBtn.getBoundingClientRect();
  state.centerX = rect.left + rect.width * 0.5;
  state.centerY = rect.top + rect.height * 0.5;
}

function handleResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  bgCanvas.resize(w, h);
  fxCanvas.resize(w, h);
  updateCenter();
}

function syncUI(stage) {
  els.body.dataset.level = String(state.level);
  els.body.classList.toggle('is-active', state.clicks > 0);
  els.body.classList.toggle('is-soft', state.softMode);

  document.documentElement.style.setProperty('--accent', stage.accent);
  document.documentElement.style.setProperty('--accent-alt', stage.accentAlt);
  document.title = stage.pageTitle;

  els.stageBadge.textContent = stage.name;
  els.stageSubtitle.textContent = stage.subtitle;
  els.clicksCount.textContent = state.clicks.toLocaleString('ru-RU');

  if (stage.btnTag) {
    els.heroBtnTag.textContent = stage.btnTag;
    els.heroBtnTag.hidden = false;
  } else {
    els.heroBtnTag.textContent = '';
    els.heroBtnTag.hidden = true;
  }

  const meter = formatMeterDisplay(state.clicks, state.level);
  els.meterValue.textContent = meter.label;
  els.meterFill.style.setProperty('--meter-scale', (Math.min(100, meter.fillPct) / 100).toFixed(3));
  els.meterTrack.classList.toggle('is-broken', meter.broken);
  els.meterValue.classList.toggle('is-broken', meter.broken);
}

function updateComboDisplay() {
  const active = state.combo >= 2;
  els.comboPill.classList.toggle('is-hot', active);
  els.comboPill.classList.toggle('is-overdrive', state.combo >= 10);
  els.comboValue.textContent = `×${Math.max(1, state.combo)}`;
  els.cpsValue.textContent = `${state.cps.toFixed(1)}/с`;

  const heat = Math.min(1, Math.max(0, (state.combo - 2) / 14));
  document.documentElement.style.setProperty('--combo-heat', heat.toFixed(3));
}

function triggerZaebis(originX, originY) {
  const now = performance.now();
  const prevLevel = state.level;

  state.clicks += 1;
  state.recentClickTimes.push(now);
  while (state.recentClickTimes.length > 0 && now - state.recentClickTimes[0] > 1500) {
    state.recentClickTimes.shift();
  }
  state.cps = state.recentClickTimes.length / 1.5;

  if (now - state.lastClickAt < 1350) {
    state.combo += 1;
  } else {
    state.combo = 1;
  }
  state.lastClickAt = now;

  const stage = getStageForClicks(state.clicks);
  state.level = stage.level;

  updateCenter();
  const x = typeof originX === 'number' ? originX : state.centerX;
  const y = typeof originY === 'number' ? originY : state.centerY;

  // Sync HUD & page aesthetics
  syncUI(stage);
  updateComboDisplay();

  // Tactile button kick & stage shake impulse
  state.buttonSpring = Math.min(1.4, state.buttonSpring + 0.9);
  if (!state.softMode) {
    state.shakeEnergy = Math.min(1.5, state.shakeEnergy + 0.25 + state.level * 0.08);
  }

  // Fire all sensory layers
  audio.playClick({ level: state.level, combo: state.combo, clicks: state.clicks });
  bgCanvas.triggerPulse(0.55 + state.level * 0.08, state.level >= 8);
  fxCanvas.burst(x, y, {
    level: state.level,
    combo: state.combo,
    clicks: state.clicks,
    softMode: state.softMode,
  });

  domChaos.spawnWord(x, y, state.level, state.combo);
  domChaos.maybeSpawnSticker(state.level, state.clicks);
  domChaos.kickEqualizer(state.level, state.combo);
  domChaos.checkAchievements(state.clicks);

  // Level-up celebration!
  if (state.level > prevLevel) {
    els.liveRegion.textContent = `Уровень ${state.level}: ${stage.name}`;
    if (state.level >= 2) {
      audio.playLevelUp(state.level);
      domChaos.showBanner(`УРОВЕНЬ ${state.level}`, stage.name.toUpperCase());
      fxCanvas.supernova(state.centerX, state.centerY, state.level);
      bgCanvas.triggerPulse(1.4, state.level >= 7);
    }
  }

  // Infinite Supernova milestones past level 10!
  if (state.clicks >= 175 && state.clicks % 25 === 0) {
    audio.playSupernova();
    fxCanvas.supernova(state.centerX, state.centerY, 10);
    bgCanvas.triggerPulse(2.0, true);
    domChaos.showBanner('СУПЕРНОВА ЗАЕБИСТНОСТИ', `${state.clicks} КЛИКОВ!`);
    els.liveRegion.textContent = `Супернова заебистности: ${state.clicks} кликов!`;
  }
}

function resetChaos() {
  state.clicks = 0;
  state.level = 0;
  state.combo = 0;
  state.cps = 0;
  state.recentClickTimes.length = 0;
  state.lastClickAt = 0;
  state.shakeEnergy = 0;
  state.buttonSpring = 0;

  bgCanvas.reset();
  fxCanvas.reset();
  domChaos.reset();

  const stage = getStageForClicks(0);
  syncUI(stage);
  updateComboDisplay();
  els.stageFrame.style.transform = '';
  els.heroWrap.style.setProperty('--btn-kick', '1');
  els.liveRegion.textContent = 'Хаос сброшен. Можно начинать заново.';
}

function syncControlButtons() {
  els.soundBtn.setAttribute('aria-pressed', String(!state.muted));
  els.soundBtn.setAttribute('aria-label', state.muted ? 'Включить звук' : 'Выключить звук');
  els.soundBtn.querySelector('.ctrl-icon').textContent = state.muted ? '🔇' : '🔊';
  els.soundBtn.querySelector('.ctrl-text').textContent = state.muted ? 'Тихо' : 'Звук';

  els.softBtn.setAttribute('aria-pressed', String(state.softMode));
  els.softBtn.setAttribute('aria-label', state.softMode ? 'Выключить мягкий режим' : 'Включить мягкий режим');
  els.softBtn.querySelector('.ctrl-icon').textContent = state.softMode ? '🛡️' : '✨';
  els.softBtn.querySelector('.ctrl-text').textContent = state.softMode ? 'Мягко' : 'Макс';

  els.body.classList.toggle('is-soft', state.softMode);
}

// Instant low-latency pointer triggering + deduped accessible click fallback
let lastPointerDownAt = 0;

els.heroBtn.addEventListener('pointerdown', (event) => {
  if (event.button !== 0 && event.pointerType === 'mouse') return;
  lastPointerDownAt = performance.now();
  els.heroBtn.classList.add('is-pressed');
  triggerZaebis(event.clientX, event.clientY);
});

window.addEventListener('pointerup', () => {
  els.heroBtn.classList.remove('is-pressed');
});

els.heroBtn.addEventListener('click', (event) => {
  // Keyboard activation (Enter / Space) or assistive tech fires click with detail === 0
  if (event.detail === 0 || performance.now() - lastPointerDownAt > 400) {
    triggerZaebis();
  }
});

// Arcade Spacebar shortcut anywhere on page (unless another control is focused)
window.addEventListener('keydown', (event) => {
  if (event.code !== 'Space' || event.repeat) return;
  const active = document.activeElement;
  if (active && active.tagName === 'BUTTON' && active !== els.heroBtn) return;
  if (active !== els.heroBtn) {
    event.preventDefault();
    els.heroBtn.classList.add('is-pressed');
    triggerZaebis();
  }
});

window.addEventListener('keyup', (event) => {
  if (event.code === 'Space') {
    els.heroBtn.classList.remove('is-pressed');
  }
});

els.soundBtn.addEventListener('click', () => {
  state.muted = !state.muted;
  audio.setMuted(state.muted);
  syncControlButtons();
});

els.softBtn.addEventListener('click', () => {
  state.softMode = !state.softMode;
  if (state.softMode) {
    state.shakeEnergy = 0;
    els.stageFrame.style.transform = '';
  }
  syncControlButtons();
});

els.resetBtn.addEventListener('click', () => {
  resetChaos();
});

window.addEventListener('resize', handleResize);

// Unified high-FPS animation loop
let lastFrameTime = performance.now();

function tick(now) {
  const dt = Math.min(0.05, Math.max(0.001, (now - lastFrameTime) / 1000));
  lastFrameTime = now;

  // Decay combo & CPS smoothly when idle
  if (state.recentClickTimes.length > 0) {
    while (state.recentClickTimes.length > 0 && now - state.recentClickTimes[0] > 1500) {
      state.recentClickTimes.shift();
    }
    const newCps = state.recentClickTimes.length / 1.5;
    if (Math.abs(newCps - state.cps) > 0.05) {
      state.cps = newCps;
      updateComboDisplay();
    }
  }
  if (state.combo > 0 && now - state.lastClickAt > 1450) {
    state.combo = 0;
    updateComboDisplay();
  }

  // Smooth spring decay for button bounce
  if (state.buttonSpring > 0.001) {
    state.buttonSpring = Math.max(0, state.buttonSpring - dt * 6.5);
    const kick = 1 + Math.sin(state.buttonSpring * Math.PI) * 0.095;
    els.heroWrap.style.setProperty('--btn-kick', kick.toFixed(4));
  } else {
    els.heroWrap.style.setProperty('--btn-kick', '1');
  }

  // Punchy clamped screen shake
  if (state.shakeEnergy > 0.005 && !state.softMode) {
    state.shakeEnergy = Math.max(0, state.shakeEnergy - dt * 4.8);
    const amp = Math.min(8.5, state.shakeEnergy * (2.5 + state.level * 0.55));
    const sx = (Math.random() - 0.5) * 2 * amp;
    const sy = (Math.random() - 0.5) * 2 * amp;
    const rot = (Math.random() - 0.5) * amp * 0.14;
    els.stageFrame.style.transform = `translate3d(${sx.toFixed(2)}px, ${sy.toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg)`;
  } else if (els.stageFrame.style.transform) {
    els.stageFrame.style.transform = '';
  }

  bgCanvas.render(dt, state);
  fxCanvas.render(dt, state);
  domChaos.updateEqualizer(dt, state.level);

  window.requestAnimationFrame(tick);
}

// Initialize
syncControlButtons();
syncUI(getStageForClicks(0));
updateComboDisplay();
handleResize();
window.requestAnimationFrame(tick);
