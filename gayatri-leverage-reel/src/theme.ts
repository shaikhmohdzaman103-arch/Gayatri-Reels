import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';
import { interpolate, spring, Easing } from 'remotion';
import { FPS } from './config';

// Fonts are self-hosted in assets/fonts (Google Fonts, OFL) so renders never depend on the network.
const LATIN = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const LATIN_EXT = 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF';
const face = (family: string, file: string, style: string, weight: string) =>
  [['latin', LATIN], ['latin-ext', LATIN_EXT]].forEach(([subset, unicodeRange]) =>
    loadFont({ family, url: staticFile(`fonts/${file}-${style}-${subset}.woff2`), style, weight, unicodeRange, display: 'block' }));
face('Playfair Display', 'PlayfairDisplay', 'normal', '400 900');
face('Playfair Display', 'PlayfairDisplay', 'italic', '400 900');
face('Inter', 'Inter', 'normal', '100 900');

// Inter is the fallback for any glyph the serif lacks (₹, →).
export const serif = "'Playfair Display', 'Inter', serif";
export const serifItalic = "'Playfair Display', 'Inter', serif";
export const sans = "'Inter', sans-serif";

export const sec = (s: number) => Math.round(s * FPS);

// Spring progress (0→1) starting at `at` seconds, measured on the scene-local frame.
export const pop = (frame: number, at: number, damping = 14, mass = 0.8) =>
  spring({ frame: frame - sec(at), fps: FPS, config: { damping, mass, stiffness: 140 } });

// Eased 0→1 between two scene-local times in seconds.
export const ramp = (frame: number, from: number, to: number) =>
  interpolate(frame, [sec(from), sec(to)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

// Fade + rise for an element entering at `at` seconds.
export const enter = (frame: number, at: number, dist = 40) => {
  const p = pop(frame, at);
  return { opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * dist}px)` };
};
