import React from 'react';
import { AbsoluteFill, Audio, getStaticFiles, staticFile, useCurrentFrame } from 'remotion';
import { COLORS, FPS, MEDIA, SCENES } from './config';
import { CornerLogo, Footer, Label, Subtitles, Tone } from './components/Chrome';
import { ramp, sans } from './theme';
import { Sheet } from './scenes/Sheet';
import { Pie } from './scenes/Pie';
import { Compare } from './scenes/Compare';
import { Reframe } from './scenes/Reframe';
import { Cta } from './scenes/Cta';

const has = (name: string) => getStaticFiles().some((f) => f.name === name);

export type ReelProps = { cover?: boolean; coverAt?: number };

export const Reel: React.FC<ReelProps> = ({ cover, coverAt }) => {
  const frame = useCurrentFrame();
  const t = cover ? (coverAt ?? 2.6) : frame / FPS;
  // Paper for the argument, deep green for the reframe and the end card.
  const green = Math.max(ramp(t, SCENES.reframe[0] - 0.1, 0.4), 0);
  const tone: Tone = green > 0.5 ? 'green' : 'light';
  return (
    <AbsoluteFill style={{ background: COLORS.paper, fontFamily: sans }}>
      <AbsoluteFill style={{ background: COLORS.green, opacity: green }} />
      {green > 0 && <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 35%, rgba(201,151,43,0.16), rgba(6,63,50,0) 60%)', opacity: green }} />}
      <Sheet t={t} />
      {!cover && <Pie t={t} />}
      {!cover && <Compare t={t} />}
      {!cover && <Reframe t={t} />}
      {!cover && <Cta t={t} />}
      <CornerLogo t={t} />
      <Label tone={tone} />
      {!cover && <Subtitles t={t} />}
      <Footer tone={tone} />
      {!cover && has(MEDIA.mix) && <Audio src={staticFile(MEDIA.mix)} />}
    </AbsoluteFill>
  );
};
