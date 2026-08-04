import { useEffect } from 'react';
import TrackPlayer, { useProgress, useTrackPlayerEvents, Event, State } from 'react-native-track-player';
import { usePlayerStore } from '../store/playerStore';
import { useListenHistoryStore } from '../store/listenHistoryStore';

export const usePlayer = () => {
  const progress = useProgress(250);
  const store = usePlayerStore();
  const pushHistory = useListenHistoryStore(s => s.push);

  useTrackPlayerEvents([Event.PlaybackState, Event.PlaybackActiveTrackChanged], async event => {
    if (event.type === Event.PlaybackState) {
      const isPlaying = event.state === State.Playing;
      usePlayerStore.setState({ isPlaying });
      if (isPlaying) {
        const current = usePlayerStore.getState().currentTrack;
        if (current) pushHistory(current);
      }
    }
  });

  useEffect(() => {
    store.setPlaybackState({
      position: progress.position,
      duration: progress.duration,
      buffered: progress.buffered,
    });
  }, [progress.position, progress.duration, progress.buffered]);

  return { ...store };
};
