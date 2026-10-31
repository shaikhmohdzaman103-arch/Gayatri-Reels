import { Config } from '@remotion/cli/config';

// ./assets (repo root) is the public dir: logo.png, fonts/, vo_clean.wav, mix.wav.
Config.setPublicDir('../assets');
Config.setVideoImageFormat('png'); // PNG frames keep the output yuv420p (JPEG frames gave yuvj420p)
Config.setBrowserExecutable('/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell');
