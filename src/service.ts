import TrackPlayer, { Event, State } from 'react-native-track-player';

let hasSkipHandler = false;
let hasQueueEndedHandler = false;

export default async function PlaybackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }) => TrackPlayer.seekTo(position));
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.reset());

  TrackPlayer.addEventListener(Event.PlaybackError, async () => {
    try {
      const state = await TrackPlayer.getState();
      if (state === State.Error) await TrackPlayer.skipToNext();
    } catch {
      // ignore
    }
  });

  if (!hasSkipHandler) {
    hasSkipHandler = true;
    TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, ({ index }) => {
      TrackPlayer.play().catch(() => {});
    });
  }

  if (!hasQueueEndedHandler) {
    hasQueueEndedHandler = true;
    TrackPlayer.addEventListener(Event.PlaybackQueueEnded, ({ position, track }) => {
      // repeat logic handled in playerStore via repeatMode
      if (track !== null && track !== undefined) {
        // queue ended
      }
    });
  }
}