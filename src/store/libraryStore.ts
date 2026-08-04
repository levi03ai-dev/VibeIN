import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { VibePlaylist, VibeTrack } from '../types';

interface LibraryStore {
  favorites: VibeTrack[];
  playlists: VibePlaylist[];
  addFavorite: (track: VibeTrack) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (track: VibeTrack) => void;
  isFavorite: (id: string) => boolean;
  createPlaylist: (name: string, description?: string) => string;
  deletePlaylist: (id: string) => void;
  renamePlaylist: (id: string, name: string) => void;
  addToPlaylist: (playlistId: string, track: VibeTrack) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
}

export const useLibraryStore = create<LibraryStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      playlists: [],

      addFavorite: track => {
        if (get().isFavorite(track.id)) return;
        set(s => ({ favorites: [track, ...s.favorites] }));
      },

      removeFavorite: id =>
        set(s => ({ favorites: s.favorites.filter(t => t.id !== id) })),

      toggleFavorite: track => {
        if (get().isFavorite(track.id)) get().removeFavorite(track.id);
        else get().addFavorite(track);
      },

      isFavorite: id => get().favorites.some(t => t.id === id),

      createPlaylist: (name, description) => {
        const id = `pl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const playlist: VibePlaylist = {
          id,
          name,
          description,
          tracks: [],
          createdAt: Date.now(),
        };
        set(s => ({ playlists: [playlist, ...s.playlists] }));
        return id;
      },

      deletePlaylist: id =>
        set(s => ({ playlists: s.playlists.filter(p => p.id !== id) })),

      renamePlaylist: (id, name) =>
        set(s => ({
          playlists: s.playlists.map(p =>
            p.id === id ? { ...p, name } : p,
          ),
        })),

      addToPlaylist: (playlistId, track) =>
        set(s => ({
          playlists: s.playlists.map(p =>
            p.id === playlistId && p.tracks
              ? p.tracks.some(t => t.id === track.id)
                ? p
                : { ...p, tracks: [...p.tracks, track] }
              : p,
          ),
        })),

      removeFromPlaylist: (playlistId, trackId) =>
        set(s => ({
          playlists: s.playlists.map(p =>
            p.id === playlistId
              ? { ...p, tracks: (p.tracks ?? []).filter(t => t.id !== trackId) }
              : p,
          ),
        })),
    }),
    {
      name: 'vibe-library',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);