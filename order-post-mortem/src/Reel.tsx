import React from 'react';
import { AbsoluteFill, Audio, getStaticFiles, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FPS, SCENES, STAGE } from './config';
import { CornerLogo, Footer, Label, Subtitles, Tone } from './components/Chrome';
import { ramp, sans } from './theme';
import { Hook } from './scenes/Hook';
import { Ledger } from './scenes/Ledger';
import { Question } from './scenes/Question';
import { Cta } from './scenes/Cta';

const has = (name: string) => getStaticFiles().some((f) => f.name === name);
export const MIX = 'mix.wav'; // built by scripts/audio.py: cleaned voice + music + SFX, −14 LUFS
export const MIX_MUSIC_ONLY = 'mix_music_only.wav'; // used only until a voiceover exists

export type ReelProps = { cover?: boolean; coverAt?: number };

export const Reel: React.FC<ReelProps> = ({ cover, coverAt }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const t = cover ? (coverAt ?? 3.5) : frame / FPS;
  const stageTop = Math.round((height - STAGE.height) / 2); // 0 for 4:5, 285 for 9:16

  // Full-frame backgrounds: black hook → off-white → green CTA wipe.
  const paper = cover ? 0 : ramp(t, SCENES.hook[1] - 0.15, 0.35);
  const green = cover ? 0 : ramp(t, SCENES.cta[0] - 0.05, 0.45);
  const tone: Tone = green > 0.5 ? 'green' : paper > 0.5 ? 'light' : 'dark';

  return (
    <AbsoluteFill style={{ background: COLORS.black, fontFamily: sans }}>
      <AbsoluteFill style={{ background: COLORS.paper, opacity: paper }} />
      <AbsoluteFill style={{ background: COLORS.green, clipPath: `inset(${(1 - green) * 100}% 0 0 0)` }} />
      {!cover && green > 0 && (
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 35%, rgba(201,151,43,0.16), rgba(6,63,50,0) 60%)`, opacity: green }} />
      )}
      <div style={{ position: 'absolute', left: 0, top: stageTop, width: STAGE.width, height: STAGE.height, overflow: 'visible' }}>
        <Hook t={t} cover={cover} />
        {!cover && <Ledger t={t} />}
        {!cover && <Question t={t} />}
        {!cover && <Cta t={t} />}
        <CornerLogo t={t} />
        <Label tone={tone} />
        {!cover && <Subtitles t={t} />}
        <Footer tone={tone} />
      </div>
      {!cover && (has(MIX) || has(MIX_MUSIC_ONLY)) && <Audio src={staticFile(has(MIX) ? MIX : MIX_MUSIC_ONLY)} />}
    </AbsoluteFill>
  );
};
