import { NativeModules } from 'react-native';

const { AudioEQModule } = NativeModules;

export const EQ_PRESETS = [
  'Flat',
  'Bass Boost',
  'Treble Boost',
  'Vocal Clarity',
  'Electronic',
  'Acoustic',
  'Classical',
  'Hip-Hop',
  'Rock',
  'Pop',
];

export const eq = {
  init: (): Promise<boolean> => AudioEQModule?.init() ?? Promise.resolve(false),
  getNumberOfBands: (): Promise<number> => AudioEQModule?.getNumberOfBands() ?? Promise.resolve(5),
  getBandFreqRange: (band: number): Promise<number[]> => AudioEQModule?.getBandFreqRange(band) ?? Promise.resolve([0, 0]),
  getBandLevel: (band: number): Promise<number> => AudioEQModule?.getBandLevel(band) ?? Promise.resolve(0),
  setBandLevel: (band: number, level: number): Promise<boolean> =>
    AudioEQModule?.setBandLevel(band, level) ?? Promise.resolve(true),
  setBands: (levels: number[]): Promise<boolean> =>
    AudioEQModule?.setBands(levels) ?? Promise.resolve(true),
  getPresets: (): Promise<string[]> => AudioEQModule?.getPresets() ?? Promise.resolve(EQ_PRESETS),
  usePreset: (index: number): Promise<boolean> => AudioEQModule?.usePreset(index) ?? Promise.resolve(true),
  enabled: (on: boolean): Promise<boolean> => AudioEQModule?.enabled(on) ?? Promise.resolve(true),
  release: (): Promise<boolean> => AudioEQModule?.release() ?? Promise.resolve(true),
};

export const isEqAvailable = !!AudioEQModule;
