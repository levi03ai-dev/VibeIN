import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import TrackPlayer from 'react-native-track-player';
import { haptics } from '../utils/haptics';

export const useSleepTimer = () => {
  const timer = useSettingsStore(s => s.sleepTimer);
  const setTimer = useSettingsStore(s => s.setSleepTimer);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (timer.type === 'none') {
      setRemaining(null);
      return;
    }
    if (timer.type === 'endOfSong') {
      return;
    }
    const tick = () => {
      const rem = Math.round(((timer.endAt ?? 0) - Date.now()) / 1000);
      if (rem <= 0) {
        TrackPlayer.pause();
        setTimer({ type: 'none' });
        setRemaining(null);
        haptics.medium();
      } else {
        setRemaining(rem);
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [timer.endAt, timer.type, setTimer]);

  return { timer, remaining };
};
