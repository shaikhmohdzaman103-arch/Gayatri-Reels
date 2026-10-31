import type React from 'react';
import { loadFont } from '@remotion/fonts';
import { Easing, interpolate, spring, staticFile } from 'remotion';
import { FPS, TIMINGS } from './config';

// Self-hosted Google Fonts (OFL) in assets/fonts, so renders never depend on the network.
const LATIN = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const LATIN_EXT = 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF';
const face = (family: string, file: string, weight: string) =>
  [['latin', LATIN], ['latin-ext', LATIN_EXT]].forEach(([subset, unicodeRange]) =>
    loadFont({ family, url: staticFile(`fonts/${file}-normal-${subset}.woff2`), weight, unicodeRange, display: 'block' }));
face('DM Serif Display', 'DMSerifDisplay', '400');
face('Inter', 'Inter', '100 900');

// DM Serif Display has no ₹ glyph; Inter supplies it.
export const serif = "'DM Serif Display', 'Inter', serif";
export const sans = "'Inter', sans-serif";
export const tnum: React.CSSProperties = { fontVariantNumeric: 'tabular-nums lining-nums', fontFeatureSettings: '"tnum" 1, "lnum" 1' };

export const T = (key: string): number => {
  const t = TIMINGS.anchors[key];
  if (t === undefined) throw new Error(`No timing for anchor ${key}`);
  return t;
};

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// 0→1 eased between two absolute times (seconds).
export const ramp = (t: number, from: number, dur: number, ease = Easing.bezier(0.22, 1, 0.36, 1)) =>
  interpolate(t, [from, from + dur], [0, 1], { ...clamp, easing: ease });

// Spring 0→1 (may overshoot) starting at absolute time `at`.
export const pop = (t: number, at: number, damping = 13, stiffness = 170) =>
  t < at ? 0 : spring({ frame: Math.round((t - at) * FPS), fps: FPS, config: { damping, stiffness, mass: 0.8 } });

// Indian digit grouping: 1000000 -> 10,00,000; negatives use a true minus sign.
export const inr = (n: number) => {
  const s = Math.round(Math.abs(n)).toString();
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return (n < 0 ? '−' : '') + '₹' + (rest ? `${rest},${last3}` : last3);
};

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mix = (a: string, b: string, p: number) => {
  const [x, y] = [hex(a), hex(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * Math.min(1, Math.max(0, p)))).join(',')})`;
};
