export const BaseColors = {
  bg0: '#080808',
  bg1: '#111111',
  bg2: '#1A1A1A',
  bg3: '#242424',

  text1: '#F5F5F5',
  text2: '#9E9E9E',
  text3: '#5A5A5A',
  textInverse: '#0A0A0A',

  border: 'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.14)',

  error: '#FF5252',
  success: '#69F0AE',
  warning: '#FFD740',
};

export const AccentColors = {
  accent: '#FFFFFF',
  accentDim: 'rgba(255,255,255,0.4)',
  accentMuted: 'rgba(255,255,255,0.15)',
};

export type ColorPalette = {
  dominant: string;
  vibrant: string;
  muted: string;
  dark: string;
  light: string;
  background: string;
};

export const DEFAULT_PALETTE: ColorPalette = {
  dominant: '#1A1A1A',
  vibrant: '#FFFFFF',
  muted: '#9E9E9E',
  dark: '#080808',
  light: '#FFFFFF',
  background: '#080808',
};

export const getAccentFromPalette = (palette: ColorPalette): string =>
  palette.vibrant || palette.light || palette.dominant || '#FFFFFF';

export const hexToRgba = (hex: string, alpha: number): string => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const int = parseInt(full, 16);
  if (Number.isNaN(int)) return `rgba(255,255,255,${alpha})`;
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r},${g},${b},${alpha})`;
};
