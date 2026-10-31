import React from 'react';
import { Composition, Still } from 'remotion';
import { DURATION_S, FORMATS, FPS } from './config';
import { Reel } from './Reel';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Reel4x5" component={Reel} durationInFrames={DURATION_S * FPS} fps={FPS} {...FORMATS['4x5']} defaultProps={{ cover: false }} />
    <Composition id="Reel9x16" component={Reel} durationInFrames={DURATION_S * FPS} fps={FPS} {...FORMATS['9x16']} defaultProps={{ cover: false }} />
    <Still id="Cover" component={Reel} {...FORMATS['4x5']} defaultProps={{ cover: true, coverAt: 3.5 }} />
  </>
);
