import axios from 'axios';
import type { VibeAlbum, VibeArtist, VibePlaylist, VibeTrack } from '../types';

const BASE = 'https://saavn.dev/api';

const client = axios.create({
  baseURL: BASE,
  timeout: 15000,
});

const pickLast = <T,>(arr: T[] | undefined): T | undefined =>
  Array.isArray(arr) && arr.length > 0 ? arr[arr.length - 1] : undefined;

const mediaUrl = (arr: { url?: string }[] | undefined): string | undefined =>
  pickLast(arr)?.url ?? arr?.[0]?.url;

const mapSaavnSong = (s: any): VibeTrack | null => {
  if (!s) return null;
  const downloadUrls: any[] = Array.isArray(s.downloadUrl) ? s.downloadUrl : [];
  const image = mediaUrl(s.image);
  const artists: any[] = Array.isArray(s.artists) ? s.artists : [];
  return {
    id: s.id ?? `${s.title}-${s.primaryArtists ?? ''}`,
    title: s.name ?? s.title ?? 'Unknown',
    artist: s.primaryArtists || s.artists?.primary?.map((a: any) => a.name).join(', ') || 'Unknown',
    artists: artists.map((a: any) => ({ id: a.id, name: a.name, image: a.image?.[0]?.url })),
    album: s.album?.name,
    albumId: s.album?.id,
    image,
    duration: Number(s.duration ?? 0),
    source: 'saavn' as const,
    url: downloadUrls.length ? downloadUrls[downloadUrls.length - 1].url : undefined,
    downloadUrls,
    externalId: s.id,
  };
};

const mapSaavnAlbum = (a: any): VibeAlbum => ({
  id: a.id,
  name: a.name ?? a.title ?? 'Unknown',
  image: mediaUrl(a.image),
  url: a.url,
});

const mapSaavnArtist = (a: any): VibeArtist => ({
  id: a.id,
  name: a.name ?? a.title ?? 'Unknown',
  image: mediaUrl(a.image),
  role: a.role,
});

const mapSaavnPlaylist = (p: any): VibePlaylist => ({
  id: p.id,
  name: p.name ?? p.title ?? 'Unknown',
  description: p.description,
  image: mediaUrl(p.image),
  owner: p.owner ?? p.firstname,
  trackIds: p.songs?.map((s: any) => s.id),
});

export const saavn = {
  async searchSongs(query: string, page = 1, limit = 20): Promise<VibeTrack[]> {
    const res = await client.get('/search/songs', { params: { query, page, limit } });
    const data = res.data?.data?.results ?? [];
    return data.map(mapSaavnSong).filter(Boolean);
  },

  async searchAlbums(query: string, page = 1, limit = 10): Promise<VibeAlbum[]> {
    const res = await client.get('/search/albums', { params: { query, page, limit } });
    return (res.data?.data?.results ?? []).map(mapSaavnAlbum);
  },

  async searchArtists(query: string, page = 1, limit = 10): Promise<VibeArtist[]> {
    const res = await client.get('/search/artists', { params: { query, page, limit } });
    return (res.data?.data?.results ?? []).map(mapSaavnArtist);
  },

  async searchPlaylists(query: string, page = 1, limit = 10): Promise<VibePlaylist[]> {
    const res = await client.get('/search/playlists', { params: { query, page, limit } });
    return (res.data?.data?.results ?? []).map(mapSaavnPlaylist);
  },

  async getSong(id: string): Promise<VibeTrack | null> {
    const res = await client.get(`/songs/${id}`);
    return mapSaavnSong(res.data?.data?.[0]);
  },

  async getSongs(ids: string[]): Promise<VibeTrack[]> {
    const res = await client.get('/songs', { params: { id: ids.join(',') } });
    return (res.data?.data ?? []).map(mapSaavnSong).filter(Boolean);
  },

  async getSuggestions(id: string, limit = 10): Promise<VibeTrack[]> {
    const res = await client.get(`/songs/${id}/suggestions`, { params: { limit } });
    return (res.data?.data ?? []).map(mapSaavnSong).filter(Boolean);
  },

  async getCharts(): Promise<VibePlaylist[]> {
    const res = await client.get('/charts');
    const data = res.data?.data ?? [];
    return Array.isArray(data)
      ? data.map((c: any) => ({ id: c.id, name: c.name, image: mediaUrl(c.image), description: c.description }))
      : [];
  },

  async getChartSongs(id: string): Promise<VibeTrack[]> {
    const res = await client.get('/charts', { params: { id } });
    const songs = res.data?.data?.songs ?? [];
    return songs.map(mapSaavnSong).filter(Boolean);
  },

  async getAlbum(id: string): Promise<{ album: VibeAlbum; songs: VibeTrack[] } | null> {
    const res = await client.get('/albums', { params: { id } });
    const data = res.data?.data;
    if (!data) return null;
    return {
      album: mapSaavnAlbum(data),
      songs: (data.songs ?? []).map(mapSaavnSong).filter(Boolean),
    };
  },

  async getArtist(id: string): Promise<VibeArtist | null> {
    const res = await client.get(`/artists/${id}`);
    return mapSaavnArtist(res.data?.data?.[0] ?? res.data?.data);
  },

  async getArtistSongs(id: string, page = 1, sortBy = 'popularity'): Promise<VibeTrack[]> {
    const res = await client.get(`/artists/${id}/songs`, {
      params: { page, sortBy, sortOrder: 'desc' },
    });
    return (res.data?.data?.songs ?? []).map(mapSaavnSong).filter(Boolean);
  },

  async getArtistAlbums(id: string, page = 1): Promise<VibeAlbum[]> {
    const res = await client.get(`/artists/${id}/albums`, { params: { page } });
    return (res.data?.data?.albums ?? []).map(mapSaavnAlbum);
  },

  async getArtistRelated(id: string): Promise<VibeArtist[]> {
    const res = await client.get(`/artists/${id}/related`);
    return (res.data?.data?.relatedArtists ?? []).map(mapSaavnArtist);
  },
};

