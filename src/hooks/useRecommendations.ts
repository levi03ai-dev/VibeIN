import { useState, useEffect } from 'react';
import { lastfm } from '../api/lastfm';
import type { LastfmTrack } from '../api/lastfm';
import type { VibeTrack } from '../types';

export interface Recommendations {
  similar: VibeTrack[];
  personal: VibeTrack[];
  trending: VibeTrack[];
  loading: boolean;
}

const toVibeTrack = (t: LastfmTrack): VibeTrack => ({
  id: `lf-${t.name}-${t.artist}`.toLowerCase(),
  title: t.name,
  artist: t.artist,
  image: t.image,
  duration: t.duration ?? 0,
  source: 'lastfm',
});

export const useRecommendations = (currentTrack?: VibeTrack | null): Recommendations => {
  const [similar, setSimilar] = useState<VibeTrack[]>([]);
  const personal: VibeTrack[] = [];
  const [trending, setTrending] = useState<VibeTrack[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [top, global] = await Promise.all([
          lastfm.getTopTracks(30),
          lastfm.getGeoTopTracks('united states', 30),
        ]);
        if (active) {
          setTrending([...toVibeTracks(top), ...toVibeTracks(global)].slice(0, 30));
        }
      } catch {
        // ignore
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const title = currentTrack?.title;
  const artist = currentTrack?.artist;

  useEffect(() => {
    let active = true;
    const loadSimilar = async () => {
      if (!title || !artist) return;
      try {
        const sim = await lastfm.getTrackSimilar(title, artist, 20);
        if (active) setSimilar(toVibeTracks(sim));
      } catch {
        // ignore
      }
    };
    loadSimilar();
    return () => {
      active = false;
    };
  }, [title, artist]);

  return { similar, personal, trending, loading };
};

const toVibeTracks = (tracks: LastfmTrack[]): VibeTrack[] =>
  tracks.map(toVibeTrack);
