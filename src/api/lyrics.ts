import axios from 'axios';

const LRCLIB = 'https://lrclib.net/api';

export interface LyricsResult {
  syncedLyrics?: string;
  plainLyrics?: string;
  source?: string;
}

interface LRCLibHit {
  syncedLyrics?: string | null;
  plainLyrics?: string | null;
  trackName?: string;
  artistName?: string;
}

const client = axios.create({ baseURL: LRCLIB, timeout: 12000 });

export const lyricsApi = {
  async get(
    trackName: string,
    artistName: string,
    albumName?: string,
    duration?: number,
  ): Promise<LyricsResult> {
    try {
      const res = await client.get('/get', {
        params: {
          track_name: trackName,
          artist_name: artistName,
          album_name: albumName,
          duration,
        },
      });
      return mapHit(res.data);
    } catch {
      return {};
    }
  },

  async search(trackName: string, artistName: string): Promise<LyricsResult> {
    try {
      const res = await client.get('/search', {
        params: { track_name: trackName, artist_name: artistName },
      });
      const hits: LRCLibHit[] = res.data ?? [];
      if (hits.length > 0) return mapHit(hits[0]);
      return {};
    } catch {
      return {};
    }
  },

  async fetch(trackName: string, artistName: string, albumName?: string, duration?: number): Promise<LyricsResult> {
    const exact = await this.get(trackName, artistName, albumName, duration);
    if (exact.syncedLyrics || exact.plainLyrics) return exact;
    const searched = await this.search(trackName, artistName);
    return searched;
  },
};

const mapHit = (hit: LRCLibHit | undefined): LyricsResult => {
  if (!hit) return {};
  return {
    syncedLyrics: hit.syncedLyrics || undefined,
    plainLyrics: hit.plainLyrics || undefined,
    source: hit.trackName ? `${hit.trackName} · ${hit.artistName}` : undefined,
  };
};
