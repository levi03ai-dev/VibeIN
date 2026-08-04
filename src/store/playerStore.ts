import { create } from 'zustand';
import TrackPlayer, {
  RepeatMode as TpRepeatMode,
  State,
  Capability,
  AppKilledPlaybackBehavior,
} from 'react-native-track-player';
import type { Palette, RepeatMode, VibeTrack } from '../types';
import { DEFAULT_PALETTE, getAccentFromPalette } from '../theme/colors';
import { resolveStreamUrl } from '../utils/sourceResolver';
import { extractPalette } from '../hooks/useColorExtract';

interface PlayerStore {
  currentTrack: VibeTrack | null;
  queue: VibeTrack[];
  queueIndex: number;
  isPlaying: boolean;
  repeatMode: RepeatMode;
  shuffleEnabled: boolean;
  palette: Palette;
  accentColor: string;
  position: number;
  duration: number;
  buffered: number;
  isBuffering: boolean;

  playTrack: (track: VibeTrack, queue?: VibeTrack[]) => Promise<void>;
  playQueue: (tracks: VibeTrack[], index?: number) => Promise<void>;
  togglePlay: () => Promise<void>;
  skipNext: () => Promise<void>;
  skipPrevious: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  cycleRepeat: () => void;
  toggleShuffle: () => void;
  addToQueue: (track: VibeTrack) => void;
  removeFromQueue: (index: number) => void;
  updatePalette: (imageUri?: string) => Promise<void>;
  setPlaybackState: (p: {
    position?: number;
    duration?: number;
    buffered?: number;
    isBuffering?: boolean;
  }) => void;
}

let tpReady = false;

export const ensureTrackPlayer = async (): Promise<void> => {
  if (tpReady) return;
  await TrackPlayer.setupPlayer({
    maxCacheSize: 1024 * 5,
    autoHandleInterruptions: true,
  });
  await TrackPlayer.updateOptions({
    android: {
      appKilledPlaybackBehavior:
        AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
    },
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo,
      Capability.Stop,
    ],
    compactCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
    ],
    notificationCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
    ],
    progressUpdateEventInterval: 250,
  });
  tpReady = true;
};

const trackToTpTrack = (t: VibeTrack) => ({
  id: t.id,
  url: t.url ?? '',
  title: t.title,
  artist: t.artist,
  album: t.album,
  artwork: t.image,
  duration: t.duration,
});



export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  repeatMode: 'off',
  shuffleEnabled: false,
  palette: DEFAULT_PALETTE,
  accentColor: '#FFFFFF',
  position: 0,
  duration: 0,
  buffered: 0,
  isBuffering: false,

  playTrack: async (track, queue) => {
    await ensureTrackPlayer();
    const q = queue && queue.length ? queue : get().queue;
    const index = queue && queue.length ? 0 : Math.max(get().queueIndex, 0);
    await TrackPlayer.reset();
    await TrackPlayer.add(q.map(trackToTpTrack));
    await TrackPlayer.skip(index);
    const resolved = { ...track, url: track.url };
    try {
      resolved.url = await resolveStreamUrl(track);
    } catch {
      // keep original url, may still work
    }
    await TrackPlayer.load({
      ...trackToTpTrack(resolved),
      url: resolved.url ?? "",
    });
    await TrackPlayer.play();
    get().updatePalette(track.image);
    set({
      currentTrack: track,
      queue: q,
      queueIndex: index,
      isPlaying: true,
    });
  },

  playQueue: async (tracks, index = 0) => {
    await ensureTrackPlayer();
    await TrackPlayer.reset();
    await TrackPlayer.add(tracks.map(trackToTpTrack));
    await TrackPlayer.skip(index);
    const track = tracks[index];
    if (track) {
      const resolved = { ...track, url: track.url };
      try {
        resolved.url = await resolveStreamUrl(track);
      } catch {
        // keep original url
      }
      await TrackPlayer.load({ ...trackToTpTrack(resolved), url: resolved.url ?? "" });
    }
    await TrackPlayer.play();
    get().updatePalette(track?.image);
    set({
      currentTrack: track ?? null,
      queue: tracks,
      queueIndex: index,
      isPlaying: true,
    });
  },

  togglePlay: async () => {
    await ensureTrackPlayer();
    const state = await TrackPlayer.getState();
    if (state === State.Playing) {
      await TrackPlayer.pause();
      set({ isPlaying: false });
    } else {
      await TrackPlayer.play();
      set({ isPlaying: true });
    }
  },

  skipNext: async () => {
    const { repeatMode, queue, queueIndex, shuffleEnabled } = get();
    if (!queue.length) return;
    if (repeatMode === 'track') return;
    let next = queueIndex + 1;
    if (shuffleEnabled && queue.length > 1) {
      do {
        next = Math.floor(Math.random() * queue.length);
      } while (next === queueIndex);
    } else if (next >= queue.length) {
      if (repeatMode === 'queue') next = 0;
      else return;
    }
    const track = queue[next];
    if (track) {
      const resolved = { ...track, url: track.url };
      try {
        resolved.url = await resolveStreamUrl(track);
      } catch {
        // keep original url
      }
      await TrackPlayer.load({ ...trackToTpTrack(resolved), url: resolved.url ?? "" });
      await TrackPlayer.play();
      get().updatePalette(track.image);
    }
    set({ queueIndex: next, currentTrack: track, isPlaying: true });
  },

  skipPrevious: async () => {
    const { queue, queueIndex, shuffleEnabled, repeatMode } = get();
    if (!queue.length) return;
    if (get().position > 3) {
      await TrackPlayer.seekTo(0);
      return;
    }
    let prev = queueIndex - 1;
    if (shuffleEnabled && queue.length > 1) {
      do {
        prev = Math.floor(Math.random() * queue.length);
      } while (prev === queueIndex);
    } else if (prev < 0) {
      prev = repeatMode === 'queue' ? queue.length - 1 : 0;
    }
    const track = queue[prev];
    if (track) {
      const resolved = { ...track, url: track.url };
      try {
        resolved.url = await resolveStreamUrl(track);
      } catch {
        // keep original url
      }
      await TrackPlayer.load({ ...trackToTpTrack(resolved), url: resolved.url ?? "" });
      await TrackPlayer.play();
      get().updatePalette(track.image);
    }
    set({ queueIndex: prev, currentTrack: track, isPlaying: true });
  },

  seekTo: async position => {
    await ensureTrackPlayer();
    await TrackPlayer.seekTo(position);
    set({ position });
  },

  cycleRepeat: () => {
    const order: RepeatMode[] = ['off', 'track', 'queue'];
    const current = get().repeatMode;
    const next = order[(order.indexOf(current) + 1) % order.length];
    TrackPlayer.setRepeatMode(
      next === 'track' ? TpRepeatMode.Track : next === 'queue' ? TpRepeatMode.Queue : TpRepeatMode.Off,
    );
    set({ repeatMode: next });
  },

  toggleShuffle: () => {
    const { shuffleEnabled } = get();
    set({ shuffleEnabled: !shuffleEnabled });
  },

  addToQueue: track => {
    const queue = [...get().queue, track];
    TrackPlayer.add(trackToTpTrack(track));
    set({ queue });
  },

  removeFromQueue: index => {
    const queue = [...get().queue];
    queue.splice(index, 1);
    set({ queue });
  },

  updatePalette: async imageUri => {
    try {
      const palette = imageUri
        ? await extractPalette(imageUri)
        : DEFAULT_PALETTE;
      set({
        palette,
        accentColor: getAccentFromPalette(palette),
      });
    } catch {
      set({ palette: DEFAULT_PALETTE, accentColor: '#FFFFFF' });
    }
  },

  setPlaybackState: p =>
    set(s => ({
      position: p.position ?? s.position,
      duration: p.duration ?? s.duration,
      buffered: p.buffered ?? s.buffered,
      isBuffering: p.isBuffering ?? s.isBuffering,
    })),
}));
