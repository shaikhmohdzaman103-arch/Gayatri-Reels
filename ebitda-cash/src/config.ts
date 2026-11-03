// "EBITDA is not cash" — every editable word, number and time lives here.
// Times are seconds. No imports, so Node can read this file directly (scripts/check.ts, scripts/dump-config.ts).

export const FPS = 30;
export const DURATION_S = 40;

// Design stage 1080x1350 (4:5). The 9:16 copy centres the same stage in 1080x1920.
export const STAGE = { width: 1080, height: 1350 };
export const FORMATS = {
  '4x5': { width: 1080, height: 1350 },
  '9x16': { width: 1080, height: 1920 },
} as const;
export const SAFE = { side: 80, top: 120, bottom: 160 };

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
};

export const CONTACT = {
  site: 'gayatri-business.com',
  url: 'https://gayatri-business.com',
  phone: '+91 88580 48888',
  name: 'Divyansh Singh',
};

export const BRAND = {
  logo: 'logo.png',
  footer: `${CONTACT.site}  |  ${CONTACT.phone}`,
  label: 'Illustrative example',
};

// Media under ./assets (Remotion public dir).
export const MEDIA = {
  voRaw: 'ebitda/vo_raw.mp3', // narration take (ElevenLabs), cleaned into vo_clean.wav
  voClean: 'ebitda/vo_clean.wav',
  music: 'ebitda/music.wav', // ElevenLabs music bed, extended on the beat to 39.5 s
  mix: 'ebitda/mix.wav', // voice + music + SFX at -14 LUFS
  mixMusicOnly: 'ebitda/mix_music_only.wav', // used until a voiceover exists
};

// The example, in rupees. scripts/check.ts recomputes every derived figure and stops on a mismatch.
export const NUMBERS = {
  ebitda: 25000000,
  steps: [
    { key: 'receivables', label: ['Customers', 'paid later'], amount: 6000000 },
    { key: 'inventory', label: ['More stock', 'on the shelf'], amount: 3000000 },
    { key: 'payables', label: ['Suppliers', 'paid faster'], amount: 2000000 },
    { key: 'tax', label: ['Tax', 'paid'], amount: 2000000 },
  ],
  ocf: 12000000,
  gap: 13000000,
};

export const TEXT = {
  hook: {
    kicker: 'Your P&L vs your bank',
    ebitdaLabel: 'EBITDA',
    cashLabel: 'Cash from operations',
    question: ['Where did ', ' go?'],
  },
  define: {
    word: 'EBITDA',
    parts: [
      ['E', 'Earnings'], ['B', 'Before'], ['I', 'Interest'],
      ['T', 'Tax'], ['D', 'Depreciation'], ['A', 'Amortisation'],
    ],
    shows: ['It shows', 'How the business performed'],
    hides: ['It does not show', 'What reached the bank'],
  },
  bridge: { title: 'From EBITDA to cash', sub: '₹ crore', counter: 'Cash so far', ebitda: ['EBITDA', ''], ocf: ['Cash from', 'operations'] },
  verdict: ['never reached', 'the bank'],
  reframe: ['Profit is the scoreboard.', 'Cash is the oxygen.'],
  signs: {
    title: 'Watch three signs',
    sub: 'Profit rising, cash falling? Check these first.',
    items: [
      { text: 'Customers paying slower', tag: 'Debtor days ↑' },
      { text: 'Stock piling up', tag: 'Inventory days ↑' },
      { text: 'Suppliers want faster payment', tag: 'Creditor days ↓' },
    ],
  },
  cta: {
    lead: ['See your profit-to-cash bridge', 'every month.'],
    button: 'Book a ₹501 Discovery Call',
  },
};

// Narration, line by line. `say` is spoken; anchors are the words that drive on-screen events.
export const VO_LINES = [
  { id: 'L1', say: 'Your EBITDA: two crore fifty lakh. Your cash from operations: one crore twenty lakh. Where did the rest go?' },
  { id: 'L2', say: 'EBITDA shows how the business performed. Not what reached the bank.' },
  { id: 'L3', say: 'Customers paid later: sixty lakh, stuck.' },
  { id: 'L4', say: 'More stock on the shelf: thirty lakh.' },
  { id: 'L5', say: 'Suppliers paid faster: twenty lakh.' },
  { id: 'L6', say: 'Tax paid: twenty lakh.' },
  { id: 'L7', say: 'One crore thirty lakh of profit... that never reached the bank.' },
  { id: 'L8', say: 'Profit is the scoreboard. Cash is the oxygen.' },
  { id: 'L9', say: 'Watch three signs. Customers paying slower. Stock piling up. Suppliers pushing for faster payment.' },
  { id: 'L10', say: 'See your profit-to-cash bridge every month. Book a five-hundred-and-one rupee Discovery Call.' },
] as const;

export const ANCHORS = [
  { key: 'L1', after: null, match: '^your' },
  { key: 'cash', after: 'L1', match: '^cash' },
  { key: 'gap', after: 'cash', match: '^where' },
  { key: 'L2', after: 'gap', match: '^(ebitda|ebit)' },
  { key: 'L3', after: 'L2', match: '^customer' },
  { key: 'L4', after: 'L3', match: '^more' },
  { key: 'L5', after: 'L4', match: '^supplier' },
  { key: 'L6', after: 'L5', match: '^tax' },
  { key: 'L7', after: 'L6', match: '^(one|1|130)' },
  { key: 'L8', after: 'L7', match: '^profit' },
  { key: 'oxygen', after: 'L8', match: '^cash' },
  { key: 'L9', after: 'oxygen', match: '^watch' },
  { key: 'sign1', after: 'L9', match: '^customer' },
  { key: 'sign2', after: 'sign1', match: '^stock' },
  { key: 'sign3', after: 'sign2', match: '^supplier' },
  { key: 'L10', after: 'sign3', match: '^see' },
] as const;

// Subtitles carry the narration on mute. Lines already written on screen (hook numbers,
// the verdict stamp, the reframe, the three signs, the CTA) are not repeated.
export const SUBTITLES = [
  { from: 'L2', to: 'L2.end', text: 'EBITDA shows how the business performed. Not what reached the bank.' },
  { from: 'L3', to: 'L3.end', text: 'Customers paid later: ₹60 lakh stuck.' },
  { from: 'L4', to: 'L4.end', text: 'More stock on the shelf: ₹30 lakh.' },
  { from: 'L5', to: 'L5.end', text: 'Suppliers paid faster: ₹20 lakh.' },
  { from: 'L6', to: 'L6.end', text: 'Tax paid: ₹20 lakh.' },
] as const;

// Event times. scripts/audio.py sync rewrites this block from Whisper word timestamps on the narration.
// Until then these are the planned times (the music-only cut uses them as they are).
// @timings-start
export const TIMINGS: { source: string; anchors: Record<string, number> } = {
  "source": "plan",
  "anchors": {
    "L1": 0.35, "cash": 1.7, "gap": 3.1, "L1.end": 4.2,
    "L2": 5.0, "L2.end": 8.4,
    "L3": 9.9, "L3.end": 11.5,
    "L4": 11.9, "L4.end": 13.4,
    "L5": 13.8, "L5.end": 15.3,
    "L6": 15.7, "L6.end": 16.9,
    "L7": 19.4, "L7.end": 22.6,
    "L8": 23.8, "oxygen": 25.3, "L8.end": 26.8,
    "L9": 28.0, "sign1": 29.0, "sign2": 30.5, "sign3": 31.9, "L9.end": 34.0,
    "L10": 34.8, "L10.end": 38.8
  }
};
// @timings-end

const A = TIMINGS.anchors;
// Scene windows follow the narration.
export const SCENES = {
  hook: [0, A['L2'] - 0.45],
  define: [A['L2'] - 0.45, A['L2.end'] + 0.55],
  bridge: [A['L2.end'] + 0.55, A['L7'] - 0.1],
  verdict: [A['L7'] - 0.1, A['L8'] - 0.4],
  reframe: [A['L8'] - 0.4, A['L9'] - 0.45],
  signs: [A['L9'] - 0.45, A['L10'] - 0.35],
  cta: [A['L10'] - 0.35, DURATION_S],
} as const;

export const AUDIO = {
  voLufs: -14,
  voTruePeak: -1,
  musicUnderVoiceLufs: -24,
  musicGapLiftDb: 4,
  musicCutSeconds: 1,
  sfxDb: -7,
};
