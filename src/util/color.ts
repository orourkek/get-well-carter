import { Display } from 'phaser';

export const lightOrDark = (color: Display.Color): 'light' | 'dark' => {
  // http://alienryderflex.com/hsp.html
  const hsp = Math.sqrt(
    0.299 * Math.pow(color.red, 2) +
    0.587 * Math.pow(color.green, 2) +
    0.114 * Math.pow(color.blue, 2)
  );
  return hsp > (255 / 2) ? 'light' : 'dark';
}

export const isLight = (color: Display.Color) => lightOrDark(color) === 'light';

export const isDark = (color: Display.Color) => lightOrDark(color) === 'dark';
