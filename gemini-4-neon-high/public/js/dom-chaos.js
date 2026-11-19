/**
 * Layer 3: Interactive DOM spectacle manager.
 * Spawns floating hype typography, persistent perimeter stickers, achievement toasts,
 * disco ball, equalizer bars, breaking news tickers, and milestone banners.
 */

import {
  ACHIEVEMENTS,
  STICKER_POOL,
  TICKER_BOTTOM_ITEMS,
  TICKER_TOP_ITEMS,
  pickPhrase,
} from './stages.js';

const MAX_FLOATING_WORDS = 18;
const MAX_STICKERS = 24;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

export class DomChaos {
  constructor(els) {
    this.els = els;
    this.activeWords = [];
    this.stickers = [];
    this.unlockedAchievements = new Set();
    this.eqBars = [];
    this.bannerTimer = null;
    this.toastTimers = new Set();

    this.initEqualizer();
    this.initTickers();
  }

  initEqualizer() {
    const container = this.els.equalizer;
    if (!container) return;
    container.innerHTML = '';
    const count = 28;
    for (let i = 0; i < count; i += 1) {
      const bar = document.createElement('span');
      bar.className = 'eq-bar';
      bar.style.setProperty('--bar-hue', `${Math.round((i / count) * 320)}`);
      bar.style.setProperty('--bar-scale', '0.15');
      container.appendChild(bar);
      this.eqBars.push({ el: bar, value: 0.15, target: 0.15 });
    }
  }

  initTickers() {
    this.populateTicker(this.els.tickerBottomTrack, TICKER_BOTTOM_ITEMS);
    this.populateTicker(this.els.tickerTopTrack, TICKER_TOP_ITEMS);
  }

  populateTicker(trackEl, items) {
    if (!trackEl) return;
    const text = items.join('   ✦   ') + '   ✦   ';
    // Duplicate twice for seamless CSS marquee loop
    trackEl.innerHTML = '';
    for (let i = 0; i < 2; i += 1) {
      const span = document.createElement('span');
      span.className = 'ticker-segment';
      span.textContent = text;
      trackEl.appendChild(span);
    }
  }

  spawnWord(x, y, level, combo) {
    const layer = this.els.floatingLayer;
    if (!layer) return;

    while (this.activeWords.length >= MAX_FLOATING_WORDS) {
      const oldest = this.activeWords.shift();
      oldest.remove();
    }

    const phrase = combo >= 8 && Math.random() < 0.25 ? `КОМБО ×${combo}!!` : pickPhrase(level);
    const el = document.createElement('div');
    el.className = `float-word float-tier-${Math.min(4, Math.floor(level / 2.5))}`;
    el.textContent = phrase;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Spawn words on a lively ring around the hero button so its label stays unobstructed
    const angleRad = rand(0, Math.PI * 2);
    const rx = rand(Math.min(145, vw * 0.24), Math.min(340, vw * 0.42));
    const ry = rand(Math.min(105, vh * 0.18), Math.min(240, vh * 0.34));
    const px = Math.max(85, Math.min(vw - 85, x + Math.cos(angleRad) * rx));
    const py = Math.max(92, Math.min(vh - 96, y + Math.sin(angleRad) * ry));
    const angle = rand(-18, 18);
    const scale = 0.92 + Math.min(level, 10) * 0.065 + rand(-0.08, 0.2);

    el.style.left = `${px}px`;
    el.style.top = `${py}px`;
    el.style.setProperty('--rot', `${angle.toFixed(1)}deg`);
    el.style.setProperty('--word-scale', scale.toFixed(2));
    el.style.setProperty('--word-hue', `${Math.round(rand(0, 360))}`);

    layer.appendChild(el);
    this.activeWords.push(el);

    const ttl = 1350;
    window.setTimeout(() => {
      const idx = this.activeWords.indexOf(el);
      if (idx !== -1) this.activeWords.splice(idx, 1);
      el.remove();
    }, ttl);
  }

  maybeSpawnSticker(level, clicks) {
    if (level < 4) return;
    const desiredCount = Math.min(MAX_STICKERS, 2 + (level - 4) * 3 + Math.floor(Math.max(0, clicks - 40) / 14));
    if (this.stickers.length >= desiredCount) {
      // Bounce existing stickers on every click!
      this.pulseStickers();
      return;
    }

    const candidates = STICKER_POOL.filter((item) => item.minLevel <= level);
    if (candidates.length === 0) return;

    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    const el = document.createElement('div');
    el.className = `chaos-sticker sticker-${chosen.style}`;
    el.textContent = chosen.text;

    // Place around the safe perimeter so the center button stays unobstructed
    const pos = this.pickPerimeterPosition();
    el.style.left = `${pos.xPct}%`;
    el.style.top = `${pos.yPct}%`;
    el.style.setProperty('--sticker-rot', `${rand(-22, 22).toFixed(1)}deg`);
    el.style.setProperty('--sticker-hue', `${Math.round(rand(0, 360))}`);
    el.style.setProperty('--float-delay', `${rand(0, 3).toFixed(2)}s`);

    this.els.stickersLayer.appendChild(el);
    this.stickers.push(el);
    this.pulseStickers();
  }

  pickPerimeterPosition() {
    // Choose one of four perimeter zones avoiding the center 38%x44% button zone
    const zone = Math.floor(Math.random() * 4);
    if (zone === 0) {
      // Left margin
      return { xPct: rand(5, 21), yPct: rand(16, 82) };
    }
    if (zone === 1) {
      // Right margin
      return { xPct: rand(79, 95), yPct: rand(16, 82) };
    }
    if (zone === 2) {
      // Top band (below header)
      return { xPct: rand(14, 86), yPct: rand(13, 24) };
    }
    // Bottom band (above bottom ticker)
    return { xPct: rand(14, 86), yPct: rand(77, 87) };
  }

  pulseStickers() {
    for (let i = 0; i < this.stickers.length; i += 1) {
      const s = this.stickers[i];
      s.classList.remove('is-bouncing');
      // Only bounce a subset on each click for lively staggered rhythm
      if (Math.random() < 0.55) {
        // Trigger CSS keyframe replay cleanly without layout thrashing
        void s.offsetWidth;
        s.classList.add('is-bouncing');
      }
    }
  }

  kickEqualizer(level, combo) {
    const energy = Math.min(1, 0.35 + level * 0.08 + combo * 0.03);
    for (let i = 0; i < this.eqBars.length; i += 1) {
      const centerBias = 1 - Math.abs(i - this.eqBars.length * 0.5) / (this.eqBars.length * 0.55);
      this.eqBars[i].target = Math.min(1, Math.max(0.18, rand(0.3, 1.05) * energy * (0.6 + centerBias * 0.6)));
    }
  }

  updateEqualizer(dt, level) {
    if (level < 3) return;
    for (let i = 0; i < this.eqBars.length; i += 1) {
      const bar = this.eqBars[i];
      bar.target = Math.max(0.12, bar.target - dt * (1.2 - Math.min(level, 10) * 0.04));
      if (level >= 6 && Math.random() < dt * 2.5) {
        bar.target = Math.max(bar.target, rand(0.28, 0.65));
      }
      bar.value += (bar.target - bar.value) * Math.min(1, dt * 16);
      bar.el.style.setProperty('--bar-scale', bar.value.toFixed(3));
    }
  }

  checkAchievements(clicks) {
    for (let i = 0; i < ACHIEVEMENTS.length; i += 1) {
      const ach = ACHIEVEMENTS[i];
      if (clicks >= ach.clicks && !this.unlockedAchievements.has(ach.clicks)) {
        this.unlockedAchievements.add(ach.clicks);
        this.showToast(ach);
      }
    }
  }

  showToast(ach) {
    const stack = this.els.toastStack;
    if (!stack) return;

    while (stack.children.length >= 3) {
      stack.firstElementChild.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
      <span class="toast-icon" aria-hidden="true">${ach.icon}</span>
      <div class="toast-body">
        <div class="toast-kicker">ДОСТИЖЕНИЕ</div>
        <div class="toast-title">${ach.title}</div>
        <div class="toast-desc">${ach.desc}</div>
      </div>
    `;
    stack.appendChild(toast);

    const timer = window.setTimeout(() => {
      toast.classList.add('is-leaving');
      window.setTimeout(() => toast.remove(), 320);
      this.toastTimers.delete(timer);
    }, 3600);
    this.toastTimers.add(timer);
  }

  showBanner(kicker, title) {
    const banner = this.els.milestoneBanner;
    if (!banner) return;

    this.els.milestoneKicker.textContent = kicker;
    this.els.milestoneTitle.textContent = title;
    banner.classList.remove('is-visible');
    void banner.offsetWidth;
    banner.classList.add('is-visible');

    if (this.bannerTimer) window.clearTimeout(this.bannerTimer);
    this.bannerTimer = window.setTimeout(() => {
      banner.classList.remove('is-visible');
    }, 2000);
  }

  reset() {
    this.activeWords.forEach((w) => w.remove());
    this.activeWords.length = 0;
    this.stickers.forEach((s) => s.remove());
    this.stickers.length = 0;
    this.unlockedAchievements.clear();
    if (this.els.toastStack) this.els.toastStack.innerHTML = '';
    if (this.els.milestoneBanner) this.els.milestoneBanner.classList.remove('is-visible');
    if (this.bannerTimer) window.clearTimeout(this.bannerTimer);
    this.toastTimers.forEach((t) => window.clearTimeout(t));
    this.toastTimers.clear();
    this.eqBars.forEach((b) => {
      b.value = 0.15;
      b.target = 0.15;
      b.el.style.setProperty('--bar-scale', '0.15');
    });
  }
}
