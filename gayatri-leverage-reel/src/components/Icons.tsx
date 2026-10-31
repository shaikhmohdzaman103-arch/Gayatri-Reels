import React from 'react';

type P = { size?: number; color?: string; stroke?: number };

const Svg: React.FC<P & { children: React.ReactNode }> = ({ size = 120, color = 'currentColor', stroke = 5, children }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth={stroke}
    strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);

export const Building: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M18 88 V30 L50 14 L82 30 V88" />
    <path d="M10 88 H90" />
    <path d="M32 40 h8 M60 40 h8 M32 56 h8 M60 56 h8" />
    <path d="M43 88 V70 h14 v18" />
  </Svg>
);

export const People: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="36" cy="34" r="12" />
    <circle cx="68" cy="38" r="10" />
    <path d="M14 82 c0-16 10-26 22-26 s22 10 22 26" />
    <path d="M54 62 c4-4 8-6 14-6 c10 0 18 9 18 22" />
  </Svg>
);

export const Gear: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="50" cy="50" r="14" />
    <path d="M50 12 v12 M50 76 v12 M12 50 h12 M76 50 h12 M23 23 l9 9 M68 68 l9 9 M77 23 l-9 9 M32 68 l-9 9" />
    <circle cx="50" cy="50" r="30" />
  </Svg>
);

export const Bank: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M10 36 L50 14 L90 36 Z" />
    <path d="M22 42 V74 M40 42 V74 M60 42 V74 M78 42 V74" />
    <path d="M12 80 H88 M8 88 H92" />
  </Svg>
);

export const Calendar: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="14" y="20" width="72" height="66" rx="8" />
    <path d="M14 38 H86 M32 12 V28 M68 12 V28" />
    <path d="M30 54 h8 M46 54 h8 M62 54 h8 M30 70 h8 M46 70 h8" />
    <circle cx="66" cy="70" r="6" />
  </Svg>
);

export const Check: React.FC<P> = (p) => (
  <Svg {...p}><path d="M22 52 L42 72 L80 30" /></Svg>
);

// Drawn arrow, so it never depends on a font having the → glyph.
export const RightArrow: React.FC<{ color?: string; width?: number }> = ({ color = '#C9972B', width = 56 }) => (
  <svg width={width} height={28} viewBox="0 0 56 28" fill="none" stroke={color} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14 H50 M38 4 L50 14 L38 24" />
  </svg>
);

export const ICONS = { building: Building, people: People, gear: Gear, bank: Bank, calendar: Calendar } as const;
