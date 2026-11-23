// "A fee is paid once. Equity is paid forever." — every word, number and time for the reel.
// 9:16 only (1080x1920). Times are seconds. No imports, so Node can read this file directly.

export const FPS = 30;
export const DURATION_S = 40;

export const STAGE = { width: 1080, height: 1920 };
export const FORMATS = { '9x16': { width: 1080, height: 1920 } } as const;
// Instagram / Facebook Reels safe area: keep text out of the top 250 px and bottom 320 px.
export const SAFE = { side: 80, top: 250, bottom: 320 };

export const COLORS = {
  green: '#063F32',
  gold: '#C9972B',
  paper: '#FAF8F3',
  grey: '#56655F',
  loss: '#C0504D',
  profit: '#2E8B57',
  amber: '#D98A1C',
  black: '#050505',
  ink: '#10231D',
  line: 'rgba(6,63,50,0.12)',
  note: '#FFF4D6',
};

export const CONTACT = {
  site: 'gayatri-business.com',
  phone: '+91 88580 48888',
  name: 'Divyansh Singh',
};

export const BRAND = {
  logo: 'logo.png', // the supplied circular logo in ./assets; scaled proportionally, never redrawn
  footer: `${CONTACT.site}  |  ${CONTACT.phone}`,
  label: 'Illustrative example',
};

export const MEDIA = {
  dialogue: 'equity/vo_dialogue.wav', // built by scripts/build_dialogue.py from the two ElevenLabs takes
  music: 'equity/music.mp3', // ElevenLabs music cue, only after 30 s
  mix: 'equity/mix.wav', // dialogue + music + SFX at -14 LUFS (scripts/mix.py)
};

// The example. scripts/check.ts recomputes every derived figure and stops on a mismatch.
export const NUMBERS = {
  profit: 40000000, // ₹4 Cr a year
  raise: 60000000, // ₹6 Cr
  messyMultiple: 6,
  cleanMultiple: 8,
  messyValuation: 240000000, // post-money, 6x profit
  cleanValuation: 320000000, // post-money, 8x profit
  messyStakePct: 25,
  cleanStakePct: 18.75,
  messyShare: 10000000, // investor's share of profit a year
  cleanShare: 7500000,
  yearlySaving: 2500000,
  years: 10,
  fee: 150000, // Finance, Ops & SOP Setup, from ₹1,50,000 (published price)
};

export const TEXT = {
  sheet: {
    title: 'Term sheet',
    sub: 'Strategic investment · Draft',
    rows: {
      investment: ['Investment', '₹6 Cr'],
      valuation: ['Post-money valuation', '₹24 Cr', '6× profit'],
      equity: ['Equity to investor', '25%'],
    },
    sign: 'Promoter signature',
  },
  notes: ['Books not reliable', 'No MIS', 'Everything depends on the owner'],
  notesTitle: "Investor's due-diligence notes",
  pie: {
    title: 'What 25% really costs',
    you: 'You 75%',
    investor: 'Investor 25%',
    profit: ['Profit', '₹4 Cr a year'],
    share: ["Investor's share", '₹1 Cr a year'],
    years: '₹10 Cr in 10 years. Before any growth.',
  },
  compare: {
    title: 'Same company. Same ₹6 Cr.',
    left: 'Messy books',
    right: 'Clean books + MIS + SOPs',
    rows: [
      ['Valuation', '6× = ₹24 Cr', '8× = ₹32 Cr'],
      ['Stake for ₹6 Cr', '25%', '18.75%'],
      ['Investor’s profit / year', '₹1.00 Cr', '₹0.75 Cr'],
    ],
    saving: '₹25 lakh a year stays with you',
    loan: 'Or borrow it, and keep 100%.',
  },
  reframe: ['A fee is paid once.', 'Equity is paid forever.'],
  cta: {
    offer: 'Finance, Ops & SOP Setup',
    price: 'from ₹1,50,000',
    ticks: ['Clean books', 'Monthly MIS', 'SOPs'],
    keyword: 'SYSTEM',
    keywordLead: 'Comment',
    whatsapp: 'WhatsApp',
  },
};

// The dialogue (ElevenLabs takes). R = Rajesh, the promoter (Saurav Tandon voice); M = Meera, the advisor (Devi voice).
export const SPEAKERS = { R: 'Rajesh · Promoter', M: 'Meera · Advisor' } as const;
export const VO_LINES = [
  { id: 'R1', say: 'Six crore for twenty-five percent. Bas, sign karna hai.' },
  { id: 'M1', say: "Read his notes first. Books not reliable. No MIS. Everything depends on you. So he's paying only six times profit." },
  { id: 'R2', say: "Toh? It's just twenty-five percent, yaar." },
  { id: 'M2', say: "On four crore profit, that's one crore a year. Every year." },
  { id: 'M3', say: "Clean the books first, and it's eight times profit. The same six crore buys only eighteen point seven five percent." },
  { id: 'R3', say: 'So... I give away less.' },
  { id: 'M4', say: 'A fee is paid once. Equity is paid forever.' },
  { id: 'M5', say: 'Finance, Ops and SOP Setup. From one lakh fifty thousand. Comment SYSTEM.' },
] as const;

// Subtitles: one line at a time, condensed sans, bottom third. The reframe and the end card are
// already on screen as large type, so they are not repeated.
export const SUBTITLES: { from: string; to: string; who: 'R' | 'M'; text: string }[] = [
  { from: 'R1', to: 'R1.end', who: 'R', text: '₹6 crore for 25%. Bas, sign karna hai.' },
  { from: 'M1', to: 'note1', who: 'M', text: 'Read his notes first.' },
  { from: 'note1', to: 'note3', who: 'M', text: 'Books not reliable. No MIS.' },
  { from: 'note3', to: 'six', who: 'M', text: 'Everything depends on you.' },
  { from: 'six', to: 'M1.end', who: 'M', text: "So he's paying only 6× profit." },
  { from: 'R2', to: 'R2.end', who: 'R', text: "Toh? It's just 25%, yaar." },
  { from: 'M2', to: 'every', who: 'M', text: "On ₹4 crore profit, that's ₹1 crore a year." },
  { from: 'every', to: 'M2.end', who: 'M', text: 'Every year.' },
  { from: 'M3', to: 'same', who: 'M', text: 'Clean the books first: 8× profit.' },
  { from: 'same', to: 'M3.end', who: 'M', text: 'The same ₹6 crore buys only 18.75%.' },
  { from: 'R3', to: 'R3.end', who: 'R', text: 'So… I give away less.' },
];

// Event times, written by scripts/build_dialogue.py from Whisper word timestamps on the takes.
// @timings-start
export const TIMINGS: { source: string; anchors: Record<string, number> } = {
  "source": "build_dialogue.py tempo 1.08",
  "anchors": {
    "R1": 0.324,
    "pct": 0.954,
    "R1.end": 3.176,
    "M1": 3.435,
    "note1": 4.602,
    "note2": 5.806,
    "note3": 7.194,
    "six": 9.694,
    "M1.end": 11.009,
    "R2": 11.269,
    "pie": 12.417,
    "R2.end": 13.676,
    "M2": 13.935,
    "four": 14.361,
    "oneCr": 15.731,
    "every": 16.972,
    "M2.end": 18.028,
    "M3": 18.287,
    "eight": 20.102,
    "same": 21.398,
    "stake": 22.898,
    "M3.end": 25.009,
    "R3": 25.269,
    "R3.end": 26.935,
    "M4": 28.935,
    "equity": 30.62,
    "M4.end": 32.139,
    "M5": 32.398,
    "price": 36.12,
    "keyword": 38.583,
    "M5.end": 39.454,
    "end": 40.009
  }
};
// @timings-end

const A = TIMINGS.anchors;
export const SCENES = {
  sheet: [0, A['R2'] - 0.2],
  pie: [A['R2'] - 0.2, A['M3'] + 0.3], // holds the ten-year row a moment into Meera's next line
  compare: [A['M3'] + 0.3, A['M4'] - 0.3],
  reframe: [A['M4'] - 0.3, A['M5'] - 0.25],
  cta: [A['M5'] - 0.25, DURATION_S],
} as const;

export const AUDIO = {
  voLufs: -14,
  truePeak: -1,
  musicStart: 30.0, // project rule: no music under the first 30 seconds
  musicUnderVoiceLufs: -24,
  sfxDb: -8,
};
