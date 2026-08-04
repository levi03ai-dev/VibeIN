import { useEffect, useState } from 'react';
import { getColors } from 'react-native-image-colors';
import type { Palette } from '../types';
import { DEFAULT_PALETTE } from '../theme/colors';

export const extractPalette = async (imageUri: string): Promise<Palette> => {
  try {
    const result = await getColors(imageUri, {
      fallback: '#1A1A1A',
      cache: true,
      quality: 'low',
    });
    if (result.platform === 'android') {
      return {
        dominant: result.dominant || DEFAULT_PALETTE.dominant,
        vibrant: result.vibrant || DEFAULT_PALETTE.vibrant,
        muted: result.muted || DEFAULT_PALETTE.muted,
        dark: result.darkVibrant || result.darkMuted || DEFAULT_PALETTE.dark,
        light: result.lightVibrant || result.lightMuted || DEFAULT_PALETTE.light,
        background: result.darkVibrant || result.darkMuted || '#0A0A0A',
      };
    }
    if (result.platform === 'ios') {
      return {
        dominant: result.primary || DEFAULT_PALETTE.dominant,
        vibrant: result.secondary || result.background || DEFAULT_PALETTE.vibrant,
        muted: result.detail || DEFAULT_PALETTE.muted,
        dark: result.background || DEFAULT_PALETTE.dark,
        light: result.secondary || result.primary || DEFAULT_PALETTE.light,
        background: result.background || '#0A0A0A',
      };
    }
    return DEFAULT_PALETTE;
  } catch {
    return DEFAULT_PALETTE;
  }
};

export const useColorExtract = (imageUri?: string): Palette => {
  const [palette, setPalette] = useState<Palette>(DEFAULT_PALETTE);

  useEffect(() => {
    let active = true;
    if (!imageUri) {
      setPalette(DEFAULT_PALETTE);
      return;
    }
    extractPalette(imageUri).then(p => {
      if (active) setPalette(p);
    });
    return () => {
      active = false;
    };
  }, [imageUri]);

  return palette;
};

export const useAccentColor = (imageUri?: string): string => {
  const palette = useColorExtract(imageUri);
  return palette.vibrant || palette.light || palette.dominant || '#FFFFFF';
};

export const useTrackPalette = (): { palette: Palette; accent: string } => {
  const [palette, setPalette] = useState<Palette>(DEFAULT_PALETTE);
  const [accent, setAccent] = useState('#FFFFFF');

  return { palette, accent };
};
