import axios from 'axios';
import Config from 'react-native-config';

const LASTFM = 'https://ws.audioscrobbler.com/2.0/';
const API_KEY = Config.LASTFM_API_KEY || '';

const fmt = (s: string) => s.toLowerCase().replace(/\s+/g, '+');

export interface LastfmTrack {
  name: string;
  artist: string;
  image?: string;
  duration?: number;
  playcount?: number;
  url?: string;
  mbid?: string;
}

const mapTrack = (t: any): LastfmTrack => {
  const image =
    Array.isArray(t.image)
      ? t.image
          .filter((i: any) => i && i['#text'])
          .sort((a: any, b: any) => (a.size === 'extralarge' ? 1 : 0) - (b.size === 'extralarge' ? 1 : 0))
          .pop()?.['#text'] || undefined
      : undefined;
  return {
    name: t.name ?? '',
    artist: typeof t.artist === 'string' ? t.artist : t.artist?.['#text'] ?? t.artist?.name ?? '',
    image,
    duration: Number(t.duration ?? 0) / 1000,
    playcount: Number(t.playcount ?? 0),
    url: t.url,
  };
};


const get = async (params: Record<string, any>): Promise<any> => {
  try {
    const res = await axios.get(LASTFM, {
      params: { api_key: API_KEY, format: 'json', ...params },
      timeout: 15000,
    });
    return res.data;
  } catch {
    return {};
  }
};

export const lastfm = {
  async getTrackSimilar(name: string, artist: string, limit = 20): Promise<LastfmTrack[]> {
    if (!name || !artist) return [];
    const data = await get({ method: 'track.getSimilar', track: name, artist, limit });
    return (data.similartracks?.track ?? []).map(mapTrack);
  },

  async getArtistSimilar(name: string, limit = 20): Promise<any[]> {
    const data = await get({ method: 'artist.getSimilar', artist: name, limit });
    return data.similarartists?.artist ?? [];
  },

  async getTopTracks(limit = 50, page = 1): Promise<LastfmTrack[]> {
    const data = await get({ method: 'chart.getTopTracks', limit, page });
    return (data.tracks?.track ?? []).map(mapTrack);
  },

  async getTopArtists(limit = 50): Promise<any[]> {
    const data = await get({ method: 'chart.getTopArtists', limit });
    return data.artists?.artist ?? [];
  },

  async getGeoTopTracks(country: string, limit = 50, page = 1): Promise<LastfmTrack[]> {
    const data = await get({ method: 'geo.getTopTracks', country, limit, page });
    return (data.tracks?.track ?? []).map(mapTrack);
  },

  async getArtistTopTracks(artist: string, limit = 20): Promise<LastfmTrack[]> {
    const data = await get({ method: 'artist.getTopTracks', artist: fmt(artist), limit });
    return (data.toptracks?.track ?? []).map(mapTrack);
  },

  async getArtistInfo(artist: string): Promise<any> {
    const data = await get({ method: 'artist.getInfo', artist: fmt(artist) });
    return data.artist ?? null;
  },

  async getTrackInfo(name: string, artist: string): Promise<any> {
    const data = await get({ method: 'track.getInfo', track: name, artist });
    return data.track ?? null;
  },

  async getUserTopTracks(user: string, period = '1month', limit = 30): Promise<LastfmTrack[]> {
    const data = await get({ method: 'user.getTopTracks', user, period, limit });
    return (data.toptracks?.track ?? []).map(mapTrack);
  },

  async getTagTopTracks(tag: string, limit = 50): Promise<LastfmTrack[]> {
    const data = await get({ method: 'tag.getTopTracks', tag: tag.toLowerCase(), limit });
    return (data.tracks?.track ?? []).map(mapTrack);
  },

  async searchTrack(name: string, artist?: string): Promise<LastfmTrack[]> {
    const data = await get({
      method: 'track.search',
      track: name,
      artist,
      limit: 10,
    });
    return (data.results?.trackmatches?.track ?? []).map(mapTrack);
  },
};