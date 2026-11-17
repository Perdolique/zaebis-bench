import { createEffects } from './effects.js';

const TIERS = [
  { at: 0, name: 'Ожидание', color: '#cbff3d', hue: 0 },
  { at: 1, name: 'Искрит', color: '#cbff3d', hue: 0 },
  { at: 4, name: 'Разгон', color: '#7dffda', hue: 75 },
  { at: 9, name: 'Понеслась', color: '#d9abff', hue: 172 },
  { at: 17, name: 'Перегруз', color: '#ff83bf', hue: 240 },
  { at: 29, name: 'Отвал башки', color: '#ffbc65', hue: 300 },
  { at: 45, name: 'Неприлично заебись', color: '#ff8fe3', hue: 230 },
];
const COMBO_WINDOW = 780;
const stage = document.querySelector('#stage');
const trigger = document.querySelector('#trigger');
const reset = document.querySelector('#reset');
const sound = document.querySelector('#sound');
const soundState = document.querySelector('#sound-state');
const count = document.querySelector('#count');
const combo = document.querySelector('#streak');
const tierLabel = document.querySelector('#tier');
const meter = document.querySelector('#meter-fill');
const announcement = document.querySelector('#announcement');
const effects = createEffects(document.querySelector('#effects'), trigger);

let total = 0;
let streak = 0;
let level = 0;
let comboTimer = 0;
let lastPress = -Infinity;
let audio;
let audioBus;
let canPlayAfter = 0;
let soundEnabled = false;

function render() {
  const tier = TIERS[level];
  count.textContent = String(total).padStart(3, '0');
  combo.textContent = String(streak).padStart(2, '0');
  tierLabel.textContent = tier.name;
  const segments = Math.min(24, Math.ceil(total / TIERS.at(-1).at * 24));
  meter.style.width = `${segments / 24 * 100}%`;
  document.documentElement.style.setProperty('--accent', tier.color);
}

function playSound() {
  if (!soundEnabled || audio.state !== 'running' || audio.currentTime < canPlayAfter) return;

  const time = audio.currentTime;
  canPlayAfter = time + .055;
  const pitch = 95 + level * 45 + Math.min(streak, 15) * 11;
  const voice = audio.createOscillator();
  const envelope = audio.createGain();
  voice.type = level >= 4 ? 'triangle' : 'sine';
  voice.frequency.setValueAtTime(pitch * 2.4, time);
  voice.frequency.exponentialRampToValueAtTime(pitch, time + .14);
  envelope.gain.setValueAtTime(.001, time);
  envelope.gain.exponentialRampToValueAtTime(.09, time + .012);
  envelope.gain.exponentialRampToValueAtTime(.001, time + .21);
  voice.connect(envelope).connect(audioBus);
  voice.onended = () => {
    voice.disconnect();
    envelope.disconnect();
  };
  voice.start(time);
  voice.stop(time + .22);
}

function paintScene() {
  const hue = total === 0 ? 0 : TIERS[level].hue + (level >= 4 ? total * 27 % 155 : 0);
  const amount = 1 - Math.exp(-(total + streak) / 30);
  const tilt = (total % 2 === 0 ? 1 : -1) * amount * 8.5;
  stage.style.setProperty('--hue-shift', `${hue}deg`);
  stage.style.setProperty('--zoom', 1 + amount * .23);
  stage.style.setProperty('--tilt', `${tilt}deg`);
  stage.style.setProperty('--boost', 1 + amount * .36);
}

function press() {
  const now = performance.now();
  total++;
  streak = now - lastPress <= COMBO_WINDOW ? streak + 1 : 1;
  lastPress = now;
  clearTimeout(comboTimer);
  comboTimer = setTimeout(() => {
    streak = 0;
    combo.textContent = '00';
  }, COMBO_WINDOW);

  const nextLevel = TIERS.findLastIndex((tier) => total >= tier.at);
  if (level !== nextLevel) {
    level = nextLevel;
    announcement.textContent = `Уровень хаоса — ${TIERS[level].name}`;
  }

  render();
  paintScene();
  effects.burst({ level, serial: total, streak, color: TIERS[level].color });
  playSound();
}

function resetChaos() {
  clearTimeout(comboTimer);
  total = 0;
  streak = 0;
  level = 0;
  lastPress = -Infinity;
  render();
  paintScene();
  effects.clear();
  announcement.textContent = 'Хаос сброшен';
}

sound.addEventListener('click', async () => {
  const enabled = !soundEnabled;
  soundEnabled = enabled;
  try {
    if (enabled) {
      if (!audio) {
        audio = new AudioContext();
        audioBus = audio.createGain();
        audioBus.connect(audio.destination);
      }
      audioBus.gain.value = 1;
      if (audio.state === 'suspended') await audio.resume();
    } else {
      audioBus.gain.value = 0;
    }
  } catch {
    soundEnabled = false;
    announcement.textContent = 'Звук недоступен';
  }
  sound.setAttribute('aria-pressed', String(soundEnabled));
  soundState.textContent = soundEnabled ? 'вкл' : 'выкл';
});

trigger.addEventListener('click', press);
reset.addEventListener('click', resetChaos);
document.addEventListener('keydown', (event) => {
  if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey || event.repeat) return;

  if (event.key === 'Escape') {
    resetChaos();
  } else if (event.code === 'Space' && !event.target.closest('button')) {
    event.preventDefault();
    press();
  }
});
