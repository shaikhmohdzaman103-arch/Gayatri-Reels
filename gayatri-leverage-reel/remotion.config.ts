import { Config } from '@remotion/cli/config';

// ./assets is the public folder: drop voiceover.mp3, music.mp3 or logo.png there and they are picked up.
Config.setPublicDir('./assets');
Config.setVideoImageFormat('png');
// Use the preinstalled headless Chromium instead of downloading one.
Config.setBrowserExecutable('/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell');
