import { useState, useEffect, useMemo, useRef } from 'react';
import { useProgress } from 'react-native-track-player';
import { lyricsApi } from '../api/lyrics';
import { parseLRC, LyricLine } from '../utils/lrcParser';
import type { VibeTrack } from '../types';

export const useLyrics = (track: VibeTrack | null) => {
  const progress = useProgress(250);
  const [raw, setRaw] = useState<string | null>(null);
  const [plain, setPlain] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [noLyrics, setNoLyrics] = useState(false);
  const lastTrackId = useRef<string | null>(null);

  useEffect(() => {
    if (!track) {
      setRaw(null);
      setPlain(null);
      setNoLyrics(false);
      return;
    }
    if (lastTrackId.current === track.id && raw !== null) return;
    lastTrackId.current = track.id;
    let active = true;
    setLoading(true);
    setNoLyrics(false);
    lyricsApi
      .fetch(track.title, track.artist, track.album, track.duration)
      .then(result => {
        if (!active) return;
        setRaw(result.syncedLyrics ?? null);
        setPlain(result.plainLyrics ?? null);
        if (!result.syncedLyrics && !result.plainLyrics) setNoLyrics(true);
      })
      .catch(() => {
        if (active) setNoLyrics(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [track?.id]);

  const lines: LyricLine[] = useMemo(() => (raw ? parseLRC(raw) : []), [raw]);

  const activeIndex = useMemo(() => {
    if (!lines.length) return -1;
    let idx = -1;
    for (let i = 0; i < lines.length; i += 1) {
      if (lines[i].time <= progress.position) idx = i;
      else break;
    }
    return idx;
  }, [lines, progress.position]);

  const isSynced = lines.length > 0;

  return {
    lines,
    activeIndex,
    plain,
    isSynced,
    loading,
    noLyrics,
  };
};
