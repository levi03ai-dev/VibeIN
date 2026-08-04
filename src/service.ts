import TrackPlayer, { Event, State } from 'react-native-track-player';
import { usePlayerStore } from './store/playerStore';

let hasSkipHandler = false;
let hasQueueEndedHandler = false;

export default async function PlaybackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, () => usePlayerStore.getState().skipNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => usePlayerStore.getState().skipPrevious());
  TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }) => TrackPlayer.seekTo(position));
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.reset());

  TrackPlayer.addEventListener(Event.PlaybackError, async () => {
    try {
      const state = await TrackPlayer.getState();
      if (state === State.Error) await usePlayerStore.getState().skipNext();
    } catch {
      // ignore
    }
  });

  if (!hasSkipHandler) {
    hasSkipHandler = true;
    TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, () => {
      TrackPlayer.play().catch(() => {});
    });
  }

  if (!hasQueueEndedHandler) {
    hasQueueEndedHandler = true;
    TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
      const store = usePlayerStore.getState();
      if (store.repeatMode === 'track') {
        await TrackPlayer.seekTo(0);
        await TrackPlayer.play();
      } else {
        await store.skipNext();
      }
    });
  }
}