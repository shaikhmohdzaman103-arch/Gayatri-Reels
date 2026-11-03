import React from 'react';
import { AbsoluteFill, Audio, getStaticFiles, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FPS, MEDIA, SCENES, STAGE } from './config';
import { CornerLogo, Footer, Label, Subtitles, Tone } from './components/Chrome';
import { ramp, sans } from './theme';
import { Hook } from './scenes/Hook';
import { Define } from './scenes/Define';
import { Bridge } from './scenes/Bridge';
import { Reframe } from './scenes/Reframe';
import { Signs } from './scenes/Signs';
import { Cta } from './scenes/Cta';

const has = (name: string) => getStaticFiles().some((f) => f.name === name);

export type ReelProps = { cover?: boolean };

export const Reel: React.FC<ReelProps> = ({ cover }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const t = cover ? 0 : frame / FPS;
  const stageTop = Math.round((height - STAGE.height) / 2);

  // Backgrounds: black hook → paper → deep green reframe → paper → green CTA.
  const paper = cover ? 0 : ramp(t, SCENES.hook[1] - 0.2, 0.4);
  const reframe = cover ? 0 : Math.min(ramp(t, SCENES.reframe[0] - 0.1, 0.4), 1 - ramp(t, SCENES.reframe[1] - 0.1, 0.4));
  const green = cover ? 0 : ramp(t, SCENES.cta[0] - 0.05, 0.45);
  const tone: Tone = green > 0.5 || reframe > 0.5 ? 'green' : paper > 0.5 ? 'light' : 'dark';
  const audio = has(MEDIA.mix) ? MEDIA.mix : has(MEDIA.mixMusicOnly) ? MEDIA.mixMusicOnly : null;

  return (
    <AbsoluteFill style={{ background: COLORS.black, fontFamily: sans }}>
      <AbsoluteFill style={{ background: COLORS.paper, opacity: paper }} />
      <AbsoluteFill style={{ background: COLORS.green, opacity: reframe }} />
      <AbsoluteFill style={{ background: COLORS.green, clipPath: `inset(${(1 - green) * 100}% 0 0 0)` }} />
      {(green > 0 || reframe > 0) && (
        <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 35%, rgba(201,151,43,0.16), rgba(6,63,50,0) 60%)', opacity: Math.max(green, reframe) }} />
      )}
      <div style={{ position: 'absolute', left: 0, top: stageTop, width: STAGE.width, height: STAGE.height }}>
        <Hook t={t} cover={cover} />
        {!cover && <Define t={t} />}
        {!cover && <Bridge t={t} />}
        {!cover && <Reframe t={t} />}
        {!cover && <Signs t={t} />}
        {!cover && <Cta t={t} />}
        <CornerLogo t={t} />
        <Label tone={tone} />
        {!cover && <Subtitles t={t} />}
        <Footer tone={tone} />
      </div>
      {!cover && audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
