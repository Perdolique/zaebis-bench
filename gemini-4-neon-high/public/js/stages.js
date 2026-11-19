/**
 * Escalation stages, Russian hype phrases, tickers, achievements, and sticker definitions.
 * Every click permanently advances chaos while rapid clicking multiplies temporary intensity.
 */

export const STAGES = [
  {
    level: 0,
    minClicks: 0,
    name: 'Обычный день',
    subtitle: 'нажми, чтобы пошло дело',
    pageTitle: 'Сделать заебись',
    btnMain: 'СДЕЛАТЬ ЗАЕБИСЬ',
    btnTag: '',
    accent: '#ff3b7f',
    accentAlt: '#ffb800',
    bgIntensity: 0,
  },
  {
    level: 1,
    minClicks: 1,
    name: 'Уже заебись',
    subtitle: 'пошла жара — жми ещё!',
    pageTitle: 'Уже заебись ✨',
    btnMain: 'СДЕЛАТЬ ЗАЕБИСЬ',
    btnTag: 'ЕЩЁ!',
    accent: '#ff4d6d',
    accentAlt: '#ffd166',
    bgIntensity: 0.14,
  },
  {
    level: 2,
    minClicks: 4,
    name: 'Нормально так качает',
    subtitle: 'эффекты начинают накладываться',
    pageTitle: 'Качает 🔥 Сделать заебись',
    btnMain: 'СДЕЛАТЬ ЗАЕБИСЬ',
    btnTag: 'КРАСИВО!',
    accent: '#ff6b00',
    accentAlt: '#ffe600',
    bgIntensity: 0.28,
  },
  {
    level: 3,
    minClicks: 9,
    name: 'Чистый кайф',
    subtitle: 'диско-шар на месте, врубаем лазеры',
    pageTitle: '🪩 Чистый кайф!',
    btnMain: 'СДЕЛАТЬ ЗАЕБИСЬ',
    btnTag: 'ЧИСТЫЙ КАЙФ',
    accent: '#ff2e93',
    accentAlt: '#00f5d4',
    bgIntensity: 0.42,
  },
  {
    level: 4,
    minClicks: 17,
    name: 'Турбо-заебись',
    subtitle: 'молнии, стикеры, экстренный выпуск новостей',
    pageTitle: '⚡ ТУРБО-ЗАЕБИСЬ',
    btnMain: 'СДЕЛАТЬ ЗАЕБИСЬ',
    btnTag: 'ТУРБО ×2',
    accent: '#00e5ff',
    accentAlt: '#ffbe0b',
    bgIntensity: 0.56,
  },
  {
    level: 5,
    minClicks: 29,
    name: 'Мега-разъёб',
    subtitle: 'шкала пробила 100%, пути назад нет',
    pageTitle: '👑 МЕГА-РАЗЪЁБ',
    btnMain: 'СДЕЛАТЬ ЗАЕБИСЬ',
    btnTag: 'КОРОЛЕВСКИЙ',
    accent: '#ffd700',
    accentAlt: '#ff007f',
    bgIntensity: 0.7,
  },
  {
    level: 6,
    minClicks: 45,
    name: 'Ультра-флип',
    subtitle: 'у кнопки выросли крылья, реальность в шоке',
    pageTitle: '🪽 УЛЬТРА-ФЛИП',
    btnMain: 'СДЕЛАТЬ ЗАЕБИСЬ',
    btnTag: 'УЛЬТРА-ЛЮКС',
    accent: '#c77dff',
    accentAlt: '#00f5d4',
    bgIntensity: 0.82,
  },
  {
    level: 7,
    minClicks: 66,
    name: 'Запредельный космос',
    subtitle: 'метеоритный дождь и двойная строка новостей',
    pageTitle: '🌌 ЗАПРЕДЕЛЬНЫЙ КОСМОС',
    btnMain: 'СДЕЛАТЬ ЗАЕБИСЬ',
    btnTag: 'КОСМОС ∞',
    accent: '#ff00cc',
    accentAlt: '#33ff99',
    bgIntensity: 0.94,
  },
  {
    level: 8,
    minClicks: 91,
    name: 'Нарушение законов физики',
    subtitle: 'матрица плавится от концентрации кайфа',
    pageTitle: '⚡ ФИЗИКА СЛОМАНА',
    btnMain: 'СДЕЛАТЬ ЗАЕБИСЬ',
    btnTag: 'ВНЕ ЗАКОНА',
    accent: '#00ffd5',
    accentAlt: '#ff2a6d',
    bgIntensity: 1.08,
  },
  {
    level: 9,
    minClicks: 126,
    name: 'Неприлично заебись',
    subtitle: 'настолько хорошо, что аж неловко перед вселенной',
    pageTitle: '🔥 НЕПРИЛИЧНО ЗАЕБИСЬ 🔥',
    btnMain: 'СДЕЛАТЬ ЗАЕБИСЬ',
    btnTag: 'НЕПРИЛИЧНО!!',
    accent: '#ffdd00',
    accentAlt: '#ff00ff',
    bgIntensity: 1.24,
  },
  {
    level: 10,
    minClicks: 170,
    name: 'ЗАЕБИСЬ-СИНГУЛЯРНОСТЬ',
    subtitle: 'абсурдный максимум пробит — каждые 25 кликов супернова!',
    pageTitle: '💎 ∞ ЗАЕБИСЬ-СИНГУЛЯРНОСТЬ ∞',
    btnMain: 'СДЕЛАТЬ ЗАЕБИСЬ',
    btnTag: 'БОГ-РЕЖИМ ∞',
    accent: '#ffffff',
    accentAlt: '#ffea00',
    bgIntensity: 1.45,
  },
];

export const PHRASE_TIERS = {
  early: [
    'ЗАЕБИСЬ!',
    'ХОРОШО ПОШЛО!',
    'КАЙФ!',
    'КРАСОТА!',
    'ПУШКА!',
    'ОГОНЬ!',
    'СОЧНО!',
    'ЧЁТКО!',
    'БАЛДЁЖ!',
    'ОПА-НА!',
  ],
  mid: [
    'ВООБЩЕ ЗАЕБИСЬ!',
    'УЛЬТРАКАЙФ!',
    'ТУРБО-ЛЮКС!',
    'РАЗЪЁБ!',
    'КОСМОС!',
    'ИМБА!',
    'ЛЕГЕНДАРНО!',
    'ДИКИЙ ФЛЕКС!',
    'МОЩНЕЙШЕ!',
    '100 из 10!',
    'ШМЕЛЬ-РАКЕТА!',
    'ОДНОЗНАЧНО ДА!',
  ],
  high: [
    'МЕГА-ЗАЕБИСЬ!',
    'НЕКТАР БОГОВ!',
    'ВЫШЕ КРЫШИ!',
    'ЗАПРЕДЕЛЬНО!',
    'ГИПЕР-КАЙФ!',
    'ЭТО ШЕДЕВР!',
    'СУПЕРЛЮКС!',
    'РЕАЛЬНОСТЬ ПЛАВИТСЯ!',
    'КАК ЖЕ ХОРОШО!',
    'ЗОЛОТОЙ ФОНД!',
    'ЭКСТАЗ ПИКСЕЛЕЙ!',
  ],
  absurd: [
    'НЕПРИЛИЧНО ЗАЕБИСЬ!',
    'ВСЕЛЕННАЯ В АХУЕ!',
    'СВЕРХНОВАЯ ЗАЕБИСТНОСТЬ!',
    'НАРУШЕНИЕ ФИЗИКИ!',
    'СРОЧНО ВЫЗОВИТЕ НАСА!',
    'ПИК ЭВОЛЮЦИИ!',
    '∞ / 10 ЗАЕБИСЬ!',
    'КВАНТОВЫЙ КАЙФ!',
    'БОГ ПОСТАВИЛ ЛАЙК!',
    'СЛИШКОМ ХОРОШО!',
    'БРАУЗЕР ВОЗНЁССЯ!',
    'АБСОЛЮТНЫЙ БЕСПРЕДЕЛ!',
    'ЭТО НЕЗАКОННО ХОРОШО!',
    'ГАЛАКТИКА АПЛОДИРУЕТ!',
  ],
};

export const EMOJI_TIERS = {
  early: ['✨', '🔥', '⚡', '🎉', '💫', '🌟'],
  mid: ['🔥', '⚡', '🪩', '💎', '🚀', '👑', '💥', '🎆', '🌈', '🎊'],
  high: ['👑', '💎', '🚀', '🦄', '🍾', '🪩', '⚡', '🌈', '🎆', '💫', '😎', '🏆', '🪐'],
  absurd: ['👑', '💎', '🚀', '🦄', '🍾', '🪩', '⚡', '🌈', '🎆', '😎', '🏆', '🪐', '👽', '🛸', '🤯', '💯', '☄️', '🎷'],
};

export const STICKER_POOL = [
  { text: '100% ЗАЕБИСЬ', style: 'gold-seal', minLevel: 4 },
  { text: 'ТУРБО ЛЮКС', style: 'neon-pill', minLevel: 4 },
  { text: 'ОДОБРЕНО КАЙФОМ', style: 'stamp-red', minLevel: 4 },
  { text: 'ПУШКА-ГОНКА', style: 'holo-tag', minLevel: 4 },
  { text: 'VIP ★ ULTRA', style: 'gold-seal', minLevel: 5 },
  { text: '146% УРОВЕНЬ', style: 'neon-pill', minLevel: 5 },
  { text: 'КОРОЛЬ КЛИКА', style: 'crown-badge', minLevel: 5 },
  { text: 'ГОСТ 777-ЗАЕБИСЬ', style: 'stamp-red', minLevel: 6 },
  { text: '999+ FPS ДУШИ', style: 'holo-tag', minLevel: 6 },
  { text: 'ОПАСНО ХОРОШО', style: 'hazard-tape', minLevel: 6 },
  { text: 'СЕРТИФИКАТ БОГА', style: 'gold-seal', minLevel: 7 },
  { text: 'СРОЧНО В ЛУВР', style: 'crown-badge', minLevel: 7 },
  { text: 'ФИЗИКА ВЫШЛА', style: 'hazard-tape', minLevel: 8 },
  { text: 'ПЕРЕДОЗ КАЙФА', style: 'stamp-red', minLevel: 8 },
  { text: 'НЕПРИЛИЧНО ★ ∞', style: 'holo-tag', minLevel: 9 },
  { text: 'ГАЛАКТИЧЕСКИЙ ХИТ', style: 'gold-seal', minLevel: 9 },
  { text: 'СИНГУЛЯРНОСТЬ', style: 'crown-badge', minLevel: 10 },
];

export const TICKER_BOTTOM_ITEMS = [
  '⚡ СРОЧНО: Уровень заебистности в этой вкладке превысил все допустимые нормы',
  '🪩 СИНОПТИКИ: Над экраном сформировался устойчивый антициклон чистого кайфа',
  '📈 БИРЖА: Акции «Заебись» выросли на 999 999% за последние 4 секунды',
  '🔥 ОЧЕВИДЦЫ СООБЩАЮТ: Кнопка начинает светиться ярче, чем будущее человечества',
  '🏆 ЭКСПЕРТЫ ПОДТВЕРДИЛИ: Да, действительно становится всё заебистее и заебистее',
  '🚀 РОСКОСМОС И NASA СПОРЯТ, ЧЕЙ ЭТО СИГНАЛ ВИДЕН С ОРБИТЫ',
  '👑 МИНЗДРАВ КАЙФА: Продолжайте нажимать, останавливаться уже поздно',
];

export const TICKER_TOP_ITEMS = [
  '🚨 ВНИМАНИЕ: НАРУШЕНЫ ЗАКОНЫ ТЕРМОДИНАМИКИ — ЭНТРОПИЯ ЗАМЕНЕНА НА ЧИСТЫЙ ФЛЕКС',
  '🛸 ИНОПЛАНЕТНАЯ ДЕЛЕГАЦИЯ ПРИЛЕТЕЛА ПОСМОТРЕТЬ, ЧТО ТУТ ВООБЩЕ ПРОИСХОДИТ',
  '⚠️ СЕНСАЦИЯ: ВИДЕОКАРТА ДОСТИГЛА ДУХОВНОГО ПРОСВЕТЛЕНИЯ И ПЛАЧЕТ ОТ КРАСОТЫ',
  '💎 РЕКОРД ГИННЕССА: САМАЯ НЕПРИЛИЧНАЯ КОНЦЕНТРАЦИЯ ЗАЕБИСТНОСТИ НА КВАДРАТНЫЙ ПИКСЕЛЬ',
  '🌌 УЧЁНЫЕ РАЗВЕЛИ РУКАМИ: «МЫ ПРОСТО ХОТЕЛИ ПОСМОТРЕТЬ, ЧТО БУДЕТ ПОСЛЕ СОТОГО КЛИКА»',
  '🎷 ВНЕЗАПНОЕ ВКЛЮЧЕНИЕ: ВСЁ ОФИЦИАЛЬНО СЛИШКОМ ХОРОШО',
];

export const ACHIEVEMENTS = [
  { clicks: 1, icon: '✨', title: 'Первый пошёл', desc: 'Официально стало заебись' },
  { clicks: 10, icon: '🪩', title: 'Включаем дискотеку', desc: 'Шар опущен, лазеры разогреты' },
  { clicks: 25, icon: '⚡', title: 'Пальцы дымятся', desc: '25 кликов чистого энтузиазма' },
  { clicks: 45, icon: '👑', title: 'Коронация кнопки', desc: 'Шкала пробита, физика напряглась' },
  { clicks: 75, icon: '🛸', title: 'Замечено с орбиты', desc: 'Уровень хаоса виден невооружённым глазом' },
  { clicks: 100, icon: '💥', title: 'Сотка заебистности', desc: 'Здравый смысл покинул чат' },
  { clicks: 140, icon: '🌈', title: 'Неприличный уровень', desc: 'Соседи чувствуют вайб через стены' },
  { clicks: 170, icon: '🌌', title: 'Заебись-сингулярность', desc: 'Ты прошёл реальность насквозь' },
  { clicks: 250, icon: '🏆', title: 'Абсолютная легенда', desc: '250 нажатий — кнопка теперь божество' },
];

export function getStageForClicks(clicks) {
  let current = STAGES[0];
  for (let i = STAGES.length - 1; i >= 0; i -= 1) {
    if (clicks >= STAGES[i].minClicks) {
      current = STAGES[i];
      break;
    }
  }
  return current;
}

export function pickPhrase(level) {
  let pool = PHRASE_TIERS.early;
  if (level >= 8) {
    pool = Math.random() < 0.72 ? PHRASE_TIERS.absurd : PHRASE_TIERS.high;
  } else if (level >= 5) {
    pool = Math.random() < 0.65 ? PHRASE_TIERS.high : PHRASE_TIERS.mid;
  } else if (level >= 2) {
    pool = Math.random() < 0.7 ? PHRASE_TIERS.mid : PHRASE_TIERS.early;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

export function pickEmoji(level) {
  let pool = EMOJI_TIERS.early;
  if (level >= 8) pool = EMOJI_TIERS.absurd;
  else if (level >= 5) pool = EMOJI_TIERS.high;
  else if (level >= 2) pool = EMOJI_TIERS.mid;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Formats the "Заебистность" meter readout so it climbs smoothly to 100%
 * and then breaks completely into absurd territory.
 */
export function formatMeterDisplay(clicks, level) {
  if (clicks === 0) return { label: '0%', fillPct: 0, broken: false };
  if (clicks < 29) {
    const pct = Math.min(99, Math.round((clicks / 29) * 100));
    return { label: `${pct}%`, fillPct: pct, broken: false };
  }
  if (clicks < 45) {
    const pct = 100 + (clicks - 29) * 8;
    return { label: `${pct}%`, fillPct: 108, broken: true };
  }
  if (clicks < 66) {
    const pct = 240 + (clicks - 45) * 37;
    return { label: `${pct}%`, fillPct: 116, broken: true };
  }
  if (clicks < 91) {
    const pct = 1020 + (clicks - 66) * 320;
    return { label: `${pct.toLocaleString('ru-RU')}%`, fillPct: 124, broken: true };
  }
  if (clicks < 126) {
    const pct = 9001 + (clicks - 91) * 2850;
    return { label: `${pct.toLocaleString('ru-RU')}%`, fillPct: 132, broken: true };
  }
  if (clicks < 170) {
    const labels = ['∞%', 'NaN% (СЛИШКОМ ХОРОШО)', '999 999%', 'OVERFLOW%', '∞ + 1%'];
    const idx = Math.floor((clicks - 126) / 6) % labels.length;
    return { label: labels[idx], fillPct: 140, broken: true };
  }
  const cosmic = ['∞ × ∞%', 'ЗАЕБИСЬ^∞%', 'ERROR: СЛИШКОМ КАЙФ', 'GOD MODE ∞%'];
  const idx = Math.floor((clicks - 170) / 8) % cosmic.length;
  return { label: cosmic[idx], fillPct: 150, broken: true };
}
