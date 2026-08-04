import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { VibeTrack } from '../types';
import { uniqueById } from '../utils/format';

interface ListenHistoryStore {
  history: VibeTrack[];
  countByTrack: Record<string, number>;
  countByArtist: Record<string, number>;
  push: (track: VibeTrack) => void;
  getTopTracks: (limit: number) => VibeTrack[];
  getTopArtists: (limit: number) => string[];
  clear: () => void;
}

const MAX_HISTORY = 500;

export const useListenHistoryStore = create<ListenHistoryStore>()(
  persist(
    (set, get) => ({
      history: [],
      countByTrack: {},
      countByArtist: {},

      push: track => {
        const history = [track, ...get().history.filter(t => t.id !== track.id)].slice(0, MAX_HISTORY);
        const countByTrack = {
          ...get().countByTrack,
          [track.id]: (get().countByTrack[track.id] ?? 0) + 1,
        };
        const artistKey = track.artist.toLowerCase();
        const countByArtist = {
          ...get().countByArtist,
          [artistKey]: (get().countByArtist[artistKey] ?? 0) + 1,
        };
        set({ history, countByTrack, countByArtist });
      },

      getTopTracks: limit => {
        const sorted = [...get().history];
        sorted.sort((a, b) => (get().countByTrack[b.id] ?? 0) - (get().countByTrack[a.id] ?? 0));
        return uniqueById(sorted).slice(0, limit);
      },

      getTopArtists: limit => {
        const entries = Object.entries(get().countByArtist).sort((a, b) => b[1] - a[1]);
        return entries.slice(0, limit).map(([artist]) => artist);
      },

      clear: () => set({ history: [], countByTrack: {}, countByArtist: {} }),
    }),
    {
      name: 'vibe-history',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);