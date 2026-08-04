import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SleepTimerMode } from '../types';

interface SettingsStore {
  volume: number;
  setVolume: (v: number) => void;
  quality: 'low' | 'medium' | 'high';
  setQuality: (q: 'low' | 'medium' | 'high') => void;
  sleepTimer: SleepTimerMode;
  setSleepTimer: (t: SleepTimerMode) => void;
  showDynamicColors: boolean;
  setShowDynamicColors: (v: boolean) => void;
  lastFmUser: string;
  setLastFmUser: (u: string) => void;
  eqEnabled: boolean;
  eqBands: number[];
  eqPreset: number;
  setEqEnabled: (v: boolean) => void;
  setEqBands: (bands: number[]) => void;
  setEqPreset: (p: number) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    set => ({
      volume: 1,
      setVolume: v => set({ volume: Math.max(0, Math.min(1, v)) }),
      quality: 'high',
      setQuality: q => set({ quality: q }),
      sleepTimer: { type: 'none' },
      setSleepTimer: t => set({ sleepTimer: t }),
      showDynamicColors: true,
      setShowDynamicColors: v => set({ showDynamicColors: v }),
      lastFmUser: '',
      setLastFmUser: u => set({ lastFmUser: u }),
      eqEnabled: false,
      eqBands: [0, 0, 0, 0, 0],
      eqPreset: 0,
      setEqEnabled: v => set({ eqEnabled: v }),
      setEqBands: bands => set({ eqBands: bands }),
      setEqPreset: p => set({ eqPreset: p }),
    }),
    {
      name: 'vibe-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);