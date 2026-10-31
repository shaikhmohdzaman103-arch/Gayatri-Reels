// Every editable word, time and colour for the reel lives here.
// Times are in seconds; the composition converts them to frames.

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION_S = 45;

export const COLORS = {
  green: '#063F32',     // primary
  gold: '#C9972B',      // accent
  paper: '#FAF8F3',     // background
  muted: '#56655F',     // small text
  down: '#C0504D',      // only for "down" movements
  up: '#2E8B57',        // only for "up" movements
  ink: '#10231D',
  line: 'rgba(6,63,50,0.12)',
  footer: '#04342A',
};

// Instagram safe zone: nothing important above SAFE.top or below SAFE.bottom (except the footer).
export const SAFE = { top: 250, bottom: HEIGHT - 320, side: 72 };
export const FOOTER_HEIGHT = 90;

export const CONTACT = {
  site: 'gayatri-business.com',
  url: 'https://gayatri-business.com',
  phone: '+91 88580 48888',
  name: 'Divyansh Singh',
};

export const FOOTER_TEXT = `${CONTACT.site}  |  Call / WhatsApp: ${CONTACT.phone} (${CONTACT.name})`;

// Optional media in ./assets (served as Remotion's public dir). Used only if the file exists.
export const MEDIA = {
  voiceover: 'voiceover.wav', // built by scripts/build_audio.py (or drop in your own)
  music: 'music.wav',
  sfx: 'sfx.wav',
  logo: 'logo.png',
  musicVolume: 0.45,       // music level when nobody is speaking
  musicDuckedVolume: 0.15, // music level under the voiceover
  sfxVolume: 0.9,
};

export const SCENES = {
  hook: { start: 0, end: 4 },
  fixedCosts: { start: 4, end: 10 },
  operating: { start: 10, end: 17 },
  dol: { start: 17, end: 22 },
  financial: { start: 22, end: 30 },
  total: { start: 30, end: 36 },
  takeaway: { start: 36, end: 41 },
  cta: { start: 41, end: 45 },
} as const;

export const TEXT = {
  brand: 'GAYATRI BUSINESS',
  hook: {
    lines: ['Sales up 10%.', 'Profit up 30%.'],
    question: 'How?',
    salesLabel: 'Sales',
    profitLabel: 'Profit',
    salesGrowth: 10,
    profitGrowth: 30,
  },
  fixedCosts: {
    title: 'Fixed costs',
    subtitle: 'you pay them every month.',
    items: [
      { icon: 'building', label: 'Rent', note: 'Same every month' },
      { icon: 'people', label: 'Salaries', note: 'Same every month' },
      { icon: 'gear', label: 'Machines', note: 'Same every month' },
    ],
    stamp: 'Good month or bad, the bill is the same.',
  },
  operating: {
    title: 'Operating leverage',
    left: { sales: 'Sales', ebit: 'EBIT', tag: 'Good month' },
    right: { sales: 'Sales', ebit: 'EBIT', tag: 'Bad month' },
    note: 'Fixed costs magnify every move.',
  },
  dol: {
    title: 'Degree of operating leverage',
    formula: 'DOL = % change in EBIT\n÷ % change in sales',
    example: ['1% more sales', '3% more EBIT'],
    result: 'DOL = ',
    resultValue: 3,
    note: 'Higher DOL means higher operating risk.',
  },
  financial: {
    title: 'Financial leverage',
    icons: [
      { icon: 'bank', label: 'Bank loan' },
      { icon: 'calendar', label: 'EMI every month' },
    ],
    chain: ['More debt', 'More fixed interest', 'Higher financial risk'],
    note: 'Interest is due even when EBIT is low.',
  },
  total: {
    title: 'Total leverage',
    nodes: ['SALES', 'EBIT', 'NET PROFIT'],
    links: ['DOL', 'DFL'],
    formula: 'DTL = DOL × DFL',
    example: 'DOL 3 × DFL 2 = DTL 6',
    exampleNote: 'A 1% move in sales moves net profit by 6%.',
  },
  takeaway: {
    title: "Owner's takeaway",
    items: [
      'Know your fixed costs',
      'Know your break-even',
      "Don't borrow more than your cash flow can carry",
    ],
  },
  cta: {
    headline: 'Know your numbers.',
    button: 'Book a ₹501 Discovery Call',
    callLabel: `Call / WhatsApp ${CONTACT.name}:`,
  },
};

// Burned-in subtitles, synced to the voiceover script.
export const SUBTITLES: { from: number; to: number; text: string }[] = [
  { from: 0.1, to: 3.05, text: 'Your sales went up 10%, but your profit jumped 30%.' },
  { from: 3.15, to: 4.1, text: "That's leverage." },
  { from: 4.38, to: 6.68, text: 'Rent, salaries and machines cost the same' },
  { from: 6.78, to: 8.8, text: 'whether you sell more or less.' },
  { from: 10.36, to: 12.55, text: 'When sales rise, profit rises faster.' },
  { from: 12.55, to: 14.85, text: 'When sales fall, profit falls faster.' },
  { from: 14.93, to: 16.85, text: "That's operating leverage." },
  { from: 17.11, to: 19.65, text: 'A DOL of 3 means every 1% of sales' },
  { from: 19.65, to: 21.95, text: 'moves operating profit by 3%.' },
  { from: 22.4, to: 25.2, text: 'Loans add another fixed cost: interest.' },
  { from: 25.31, to: 27.35, text: 'It has to be paid even in a bad month.' },
  { from: 27.43, to: 29.6, text: "That's financial leverage." },
  { from: 30.41, to: 32.7, text: 'Put both together, and a small change in sales' },
  { from: 32.7, to: 35.6, text: 'can swing your net profit sharply, either way.' },
  { from: 36.39, to: 37.8, text: "Leverage isn't good or bad." },
  { from: 37.8, to: 40.3, text: 'Not knowing your numbers is the real risk.' },
  { from: 40.38, to: 41.65, text: 'Book your Discovery Call.' },
  { from: 41.74, to: 45.0, text: `Call Divyansh on ${CONTACT.phone.replace(/ /g, '\u00a0')}.` }, // number never wraps
];

// Voiceover script (for the TTS take that becomes assets/voiceover.mp3).
export const VOICEOVER_SCRIPT = [
  "Your sales went up 10%, but your profit jumped 30%. That's leverage.",
  'Rent, salaries and machines cost the same whether you sell more or less.',
  "So when sales rise, profit rises faster. When sales fall, profit falls faster. That's operating leverage.",
  'A DOL of 3 means every 1% of sales moves operating profit by 3%.',
  "Loans add another fixed cost: interest. It has to be paid even in a bad month. That's financial leverage.",
  'Put both together and a small change in sales can swing your net profit sharply, either way.',
  "Leverage isn't good or bad. Not knowing your numbers is the real risk.",
  'Book your Discovery Call. Call Divyansh on 88580 48888.',  // shortened to fit the 4-second CTA scene
];
