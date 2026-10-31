import React from 'react';
import { AbsoluteFill, Audio, Sequence, getStaticFiles, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { COLORS, FPS, MEDIA, SCENES, SUBTITLES } from './config';
import { Footer, Subtitles } from './components/Chrome';
import { sec } from './theme';
import { Hook } from './scenes/Hook';
import { FixedCosts } from './scenes/FixedCosts';
import { OperatingLeverage } from './scenes/OperatingLeverage';
import { DolFormula } from './scenes/DolFormula';
import { FinancialLeverage } from './scenes/FinancialLeverage';
import { TotalLeverage } from './scenes/TotalLeverage';
import { Takeaway } from './scenes/Takeaway';
import { Cta } from './scenes/Cta';

const ORDER: [keyof typeof SCENES, React.FC][] = [
  ['hook', Hook], ['fixedCosts', FixedCosts], ['operating', OperatingLeverage], ['dol', DolFormula],
  ['financial', FinancialLeverage], ['total', TotalLeverage], ['takeaway', Takeaway], ['cta', Cta],
];

const has = (name: string) => getStaticFiles().some((f) => f.name === name);

// A short crossfade into each scene so cuts never feel abrupt.
const Fade: React.FC<{ children: React.ReactNode; first: boolean }> = ({ children, first }) => {
  const f = useCurrentFrame();
  const o = first ? 1 : interpolate(f, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

export type ReelProps = { cover?: boolean };

export const Reel: React.FC<ReelProps> = ({ cover }) => {
  const voice = has(MEDIA.voiceover);
  const music = has(MEDIA.music);
  // Music ducks to MEDIA.musicDuckedVolume while a subtitle cue (a voiceover line) is on screen.
  const musicVolume = (frame: number) => {
    if (!voice) return MEDIA.musicVolume;
    const t = frame / FPS;
    const speaking = SUBTITLES.some((c) => t >= c.from - 0.2 && t < c.to + 0.2);
    return speaking ? MEDIA.musicDuckedVolume : MEDIA.musicVolume;
  };
  return (
    <AbsoluteFill style={{ background: COLORS.paper, fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }}>
      {ORDER.map(([key, Scene], i) => (
        <Sequence key={key} from={sec(SCENES[key].start)} durationInFrames={sec(SCENES[key].end - SCENES[key].start)} name={key}>
          <Fade first={i === 0}><Scene /></Fade>
        </Sequence>
      ))}
      {!cover && <Subtitles />}
      <Footer />
      {voice && <Audio src={staticFile(MEDIA.voiceover)} />}
      {music && <Audio src={staticFile(MEDIA.music)} volume={musicVolume} />}
    </AbsoluteFill>
  );
};
