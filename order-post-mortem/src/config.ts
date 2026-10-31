// Every editable word, number and time for the "Order post-mortem" reel lives here.
// Times are seconds. This file has no imports so Node can read it directly
// (scripts/check.ts, scripts/dump-config.ts) as well as Remotion.

export const FPS = 30;
export const DURATION_S = 30;

// The design stage is 1080x1350 (4:5). The 9:16 copy centres the same stage in 1080x1920.
export const STAGE = { width: 1080, height: 1350 };
export const FORMATS = {
  '4x5': { width: 1080, height: 1350 },
  '9x16': { width: 1080, height: 1920 },
} as const;

// Safe area inside the stage: nothing important in the top 120 px or bottom 160 px (except the footer).
export const SAFE = { side: 80, top: 120, bottom: 160 };

export const COLORS = {
  green: '#063F32',
  gold: '#C9972B',
  paper: '#FAF8F3',
  grey: '#56655F',
  loss: '#C0504D',
  profit: '#2E8B57',
  amber: '#D98A1C', // meter midpoint between profit green and loss red
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
  logo: 'logo.png', // ./assets/logo.png, served as Remotion's public dir. Never redrawn or recoloured.
  footer: `${CONTACT.site}  |  ${CONTACT.phone}`,
  label: 'Illustrative example',
};

// The example. scripts/check.ts recomputes every derived figure from these and stops on a mismatch.
export const NUMBERS = {
  order: 1000000,
  marginPct: 12,
  costs: [
    { key: 'scheme', label: 'Scheme to win it (5%)', pct: 5, amount: 50000 },
    { key: 'freight', label: 'Freight', amount: 25000 },
    { key: 'credit', label: "120 days' credit at 12% interest", days: 120, ratePct: 12, amount: 39500 },
    { key: 'returns', label: 'Returns (2%)', pct: 2, amount: 20000 },
  ],
  profit: 120000, // order x margin
  totalCost: 134500,
  actual: -14500,
};

export const TEXT = {
  hook: 'Your biggest order just lost you money.',
  invoice: {
    kicker: 'Sales team',
    kickerNote: 'Deal closed',
    title: 'Invoice',
    orderLabel: 'Order',
    marginLabel: 'Gross margin',
    profitLabel: 'Profit',
    stamp: 'WON',
  },
  receipt: {
    title: 'Post-mortem',
    sub: 'What the order really cost',
    booked: 'Profit booked',
    meter: 'Profit left',
  },
  verdict: { stamp1: 'ACTUAL: −₹14,500', stamp2: 'LOSS' },
  question: { before: 'Do you know which of your ', em: 'top 10 customers', after: ' make you money?' },
  cta: {
    button: 'Book a ₹501 Discovery Call',
    call: `Call / WhatsApp ${CONTACT.name}: ${CONTACT.phone}`,
  },
};

// Scene windows, fixed by the brief.
export const SCENES = {
  hook: [0, 4],
  celebration: [4, 8],
  postMortem: [8, 19],
  verdict: [19, 23],
  question: [23, 26],
  cta: [26, 30],
} as const;

// What the voiceover says, line by line. Record exactly this (see order-post-mortem/RECORDING.md).
// `say` is the spoken line; anchors are the words whose timing drives an on-screen event.
// Each anchor: `after` = the anchor it must follow, `match` = regex on Whisper's normalised word.
export const VO_LINES = [
  { id: 'L1', scene: 'hook', say: 'Your biggest order just lost you money.' },
  { id: 'L2', scene: 'celebration', say: 'Ten-lakh order. Twelve percent margin. One lakh twenty thousand profit. Deal closed.' },
  { id: 'L3', scene: 'postMortem', say: 'Now, the post-mortem.' },
  { id: 'L4', scene: 'postMortem', say: 'Scheme to win it: fifty thousand.' },
  { id: 'L5', scene: 'postMortem', say: 'Freight: twenty-five thousand.' },
  { id: 'L6', scene: 'postMortem', say: "Hundred and twenty days' credit at twelve percent: thirty-nine thousand five hundred." },
  { id: 'L7', scene: 'postMortem', say: 'Returns: twenty thousand.' },
  { id: 'L8', scene: 'verdict', say: 'Add it up. That order lost fourteen thousand five hundred rupees.' },
  { id: 'L9', scene: 'question', say: 'Do you know which of your top ten customers make you money?' },
  { id: 'L10', scene: 'cta', say: 'Book a five-hundred-and-one rupee Discovery Call with Divyansh.' },
] as const;

export const ANCHORS = [
  { key: 'L1', after: null, match: '^your' },
  { key: 'L2', after: 'L1', match: '^(ten|10)' },
  { key: 'margin', after: 'L2', match: '^(twelve|12)' },
  { key: 'profit', after: 'margin', match: '^(one|1|lakh|120)' },
  { key: 'closed', after: 'profit', match: '^clos' },
  { key: 'L3', after: 'closed', match: '^now' },
  { key: 'flip', after: 'L3', match: '^post' },
  { key: 'L4', after: 'flip', match: '^scheme' },
  { key: 'amt1', after: 'L4', match: '^(fifty|50)' },
  { key: 'L5', after: 'amt1', match: '^(freight|fright|fraight)' },
  { key: 'amt2', after: 'L5', match: '^(twenty|25)' },
  { key: 'L6', after: 'amt2', match: '^(hundred|120|a|one)' },
  { key: 'amt3', after: 'L6', match: '^(thirty|39)' },
  { key: 'L7', after: 'amt3', match: '^return' },
  { key: 'amt4', after: 'L7', match: '^(twenty|20)' },
  { key: 'L8', after: 'amt4', match: '^add' },
  { key: 'that', after: 'L8', match: '^that' },
  { key: 'loss', after: 'that', match: '^(fourteen|14)' },
  { key: 'L9', after: 'loss', match: '^do' },
  { key: 'L10', after: 'L9', match: '^book' },
] as const;

// Burned-in subtitles: `from`/`to` are anchor keys; `Lx.end` is the end of that line's last word.
// Lines whose words are already the headline on screen (hook, question, CTA) are not repeated as subtitles.
export const SUBTITLES = [
  { from: 'L2', to: 'profit', text: 'A ₹10,00,000 order. 12% margin.' },
  { from: 'profit', to: 'L2.end', text: '₹1,20,000 profit. Deal closed.' },
  { from: 'L3', to: 'L3.end', text: 'Now, the post-mortem.' },
  { from: 'L4', to: 'L4.end', text: 'Scheme to win it: −₹50,000' },
  { from: 'L5', to: 'L5.end', text: 'Freight: −₹25,000' },
  { from: 'L6', to: 'L6.end', text: "120 days' credit at 12%: −₹39,500" },
  { from: 'L7', to: 'L7.end', text: 'Returns: −₹20,000' },
  { from: 'L8', to: 'that', text: 'Add it up.' },
  { from: 'that', to: 'L8.end', text: 'That order lost ₹14,500.' },
] as const;

// Event times in seconds. scripts/sync_whisper.py rewrites the block between the markers
// from Whisper's word timestamps on assets/vo_clean.wav. Until then these are the planned times.
// @timings-start
export const TIMINGS: { source: string; anchors: Record<string, number> } = {
  "source": "plan",
  "anchors": {
    "L1": 0.3, "L1.end": 2.7,
    "L2": 4.15, "margin": 5.05, "profit": 6.05, "closed": 7.3, "L2.end": 7.75,
    "L3": 8.2, "flip": 8.75, "L3.end": 9.4,
    "L4": 9.75, "amt1": 10.85, "L4.end": 11.6,
    "L5": 11.95, "amt2": 12.6, "L5.end": 13.5,
    "L6": 13.85, "amt3": 15.65, "L6.end": 16.85,
    "L7": 17.2, "amt4": 17.85, "L7.end": 18.7,
    "L8": 19.25, "that": 20.05, "loss": 20.95, "L8.end": 22.5,
    "L9": 23.15, "L9.end": 25.75,
    "L10": 26.25, "L10.end": 29.5
  }
};
// @timings-end

// Audio levels (applied by scripts/build_audio.py when it builds assets/mix.wav).
export const AUDIO = {
  voLufs: -14,
  voTruePeak: -1,
  musicUnderVoiceLufs: -24, // music sits here while the voice plays
  musicGapLiftDb: 4, // a little louder in pauses
  musicCutSeconds: 1, // music silent for this long at the loss reveal
  sfxDb: -6,
};
