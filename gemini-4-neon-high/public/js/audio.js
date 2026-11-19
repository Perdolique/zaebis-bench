/**
 * Procedural Web Audio dopamine synthesizer.
 * Zero external assets, compressor-protected for heavy spam clicking.
 */

const PENTATONIC_RATIOS = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2, 9 / 4, 5 / 2, 3];

export class ZaebisAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.compressor = null;
    this.muted = false;
    this.lastAirhornAt = 0;
    this.lastLaserAt = 0;
    this.lastFireworkAt = 0;
    this.noiseBuffer = null;
  }

  ensureContext() {
    if (this.muted) return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.value = -16;
      this.compressor.knee.value = 18;
      this.compressor.ratio.value = 8;
      this.compressor.attack.value = 0.004;
      this.compressor.release.value = 0.14;

      this.master = this.ctx.createGain();
      this.master.gain.value = 0.42;

      this.compressor.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.noiseBuffer = this.createNoiseBuffer(0.35);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  createNoiseBuffer(durationSec) {
    const length = Math.floor(this.ctx.sampleRate * durationSec);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.42, this.ctx.currentTime, 0.02);
    }
  }

  playClick({ level, combo, clicks }) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const comboStep = Math.min(combo, 16);
    const baseFreq = 240 * Math.pow(1.035, Math.min(level, 10)) * PENTATONIC_RATIOS[clicks % PENTATONIC_RATIOS.length];

    // 1. Tactile bass punch (always present, grows deeper with level)
    this.playKick(ctx, now, 130 + level * 6, 42, 0.14 + level * 0.008, 0.34);

    // 2. Euphoric sparkle chime climbing with combo
    const chimeFreq = Math.min(2600, baseFreq * (1 + comboStep * 0.035));
    this.playTone(ctx, now, 'triangle', chimeFreq, chimeFreq * 1.015, 0.16, 0.18);

    // 3. Harmonic shimmer chord from level 2+
    if (level >= 2) {
      this.playTone(ctx, now + 0.02, 'sine', chimeFreq * 1.25, chimeFreq * 1.26, 0.22, 0.12);
    }
    if (level >= 4) {
      this.playTone(ctx, now + 0.04, 'sawtooth', chimeFreq * 1.5, chimeFreq * 1.52, 0.18, 0.075, 2400);
    }

    // 4. Firework crackle pop from level 3+ (rate limited)
    if (level >= 3 && now - this.lastFireworkAt > 0.16) {
      this.lastFireworkAt = now;
      this.playSparkleNoise(ctx, now + 0.03, 0.16, 0.11 + Math.min(level, 10) * 0.008);
    }

    // 5. Laser zap from level 5+ (rate limited)
    if (level >= 5 && now - this.lastLaserAt > 0.26 && Math.random() < 0.55) {
      this.lastLaserAt = now;
      this.playLaser(ctx, now, 1450 + Math.random() * 600, 220 + Math.random() * 140, 0.15, 0.09);
    }

    // 6. Hype stadium synth horn burst at level 7+ on rapid streaks (rate limited)
    if (level >= 7 && now - this.lastAirhornAt > 1.35 && (combo >= 4 || clicks % 7 === 0)) {
      this.lastAirhornAt = now;
      this.playHypeHorn(ctx, now, 0.22, 0.085);
    }
  }

  playLevelUp(level) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const root = 261.63 * Math.pow(1.06, Math.min(level, 10));
    const notes = [1, 5 / 4, 3 / 2, 2, 5 / 2];

    notes.forEach((ratio, idx) => {
      const start = now + idx * 0.055;
      this.playTone(ctx, start, 'triangle', root * ratio, root * ratio * 1.008, 0.34, 0.16);
      this.playTone(ctx, start, 'sawtooth', root * ratio * 0.5, root * ratio * 0.5, 0.26, 0.06, 1800);
    });

    if (level >= 5) {
      this.playSparkleNoise(ctx, now + 0.12, 0.28, 0.14);
    }
  }

  playSupernova() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Deep sub-drop + massive radiant major-9th fanfare
    this.playKick(ctx, now, 180, 32, 0.5, 0.45);
    const chord = [261.63, 329.63, 392.0, 493.88, 587.33, 783.99, 1046.5];
    chord.forEach((freq, idx) => {
      const start = now + idx * 0.03;
      this.playTone(ctx, start, 'sawtooth', freq, freq * 1.006, 0.72, 0.065, 3200);
      this.playTone(ctx, start, 'triangle', freq * 2, freq * 2, 0.55, 0.06);
    });
    this.playSparkleNoise(ctx, now + 0.05, 0.35, 0.18);
  }

  playKick(ctx, start, startFreq, endFreq, duration, volume) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), start + duration);

    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

    osc.connect(gain);
    gain.connect(this.compressor);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  playTone(ctx, start, type, freqStart, freqEnd, duration, volume, filterFreq = null) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), start + duration);

    gain.gain.setValueAtTime(0.001, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

    if (filterFreq) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterFreq, start);
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }

    gain.connect(this.compressor);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  playLaser(ctx, start, freqStart, freqEnd, duration, volume) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freqStart, start);
    osc.frequency.exponentialRampToValueAtTime(freqEnd, start + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, start);
    filter.Q.value = 2.4;

    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  playHypeHorn(ctx, start, duration, volume) {
    const freqs = [392, 493.88, 587.33];
    freqs.forEach((base) => {
      [-6, 0, 6].forEach((detuneCents) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(base, start);
        osc.detune.setValueAtTime(detuneCents, start);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2400, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(volume / 3, start + 0.015);
        gain.gain.setValueAtTime(volume / 3, start + duration * 0.7);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.compressor);
        osc.start(start);
        osc.stop(start + duration + 0.02);
      });
    });
  }

  playSparkleNoise(ctx, start, duration, volume) {
    if (!this.noiseBuffer) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2400, start);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);
    src.start(start);
    src.stop(start + duration + 0.02);
  }
}
