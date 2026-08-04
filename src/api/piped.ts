import axios from 'axios';
import type { VibeTrack } from '../types';

const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://piped-api.garudalinux.org',
];

let instanceIdx = 0;

const getBase = (): string => PIPED_INSTANCES[instanceIdx % PIPED_INSTANCES.length];

const client = axios.create({ timeout: 15000 });

export const rotatePipedInstance = (): void => {
  instanceIdx += 1;
};

export interface PipedAudioStream {
  url: string;
  mimeType: string;
  bitrate: number;
  quality: string;
  codec: string;
}

export interface PipedStreams {
  audioStreams: PipedAudioStream[];
  title?: string;
  artist?: string;
  duration?: number;
  thumbnail?: string;
  videoId?: string;
}

export interface PipedSearchItem {
  videoId: string;
  title: string;
  duration: number;
  thumbnail?: string;
  uploaderName?: string;
  uploaderAvatar?: string;
}

const getParams = (q: string): Record<string, any> => ({ q });

export const piped = {
  async searchSongs(query: string, filter = 'music_songs'): Promise<VibeTrack[]> {
    const res = await client.get(`${getBase()}/search`, {
      params: { ...getParams(query), filter },
    });
    const items: PipedSearchItem[] = res.data?.items ?? [];
    return items
      .filter((i: any) => i.videoId && i.title)
      .map((i: any) => ({
        id: `piped-${i.videoId}`,
        title: i.title,
        artist: i.uploaderName ?? 'Unknown',
        image: i.thumbnail,
        duration: Number(i.duration ?? 0),
        source: 'piped' as const,
        externalId: i.videoId,
      }));
  },

  async getStreams(videoId: string): Promise<PipedStreams> {
    const res = await client.get(`${getBase()}/streams/${videoId}`);
    const data = res.data ?? {};
    const audioStreams: PipedAudioStream[] = (data.audioStreams ?? [])
      .filter((s: any) => s.url && (s.mimeType ?? '').includes('audio'))
      .map((s: any) => ({
        url: s.url,
        mimeType: s.mimeType,
        bitrate: Number(s.bitrate ?? 0),
        quality: s.quality,
        codec: s.codec,
      }));
    return {
      audioStreams,
      title: data.title,
      artist: data.artist,
      duration: Number(data.duration ?? 0),
      thumbnail: data.thumbnailUrl,
      videoId: data.videoId ?? videoId,
    };
  },

  async getBestAudioUrl(videoId: string): Promise<string | null> {
    const streams = await this.getStreams(videoId);
    if (!streams.audioStreams.length) return null;
    const sorted = [...streams.audioStreams].sort((a, b) => b.bitrate - a.bitrate);
    return sorted[0].url ?? null;
  },

  async getTrending(region = 'US'): Promise<VibeTrack[]> {
    const res = await client.get(`${getBase()}/trending`, { params: { region } });
    const items: PipedSearchItem[] = res.data?.items ?? [];
    return items
      .filter((i: any) => i.videoId && i.title)
      .map((i: any) => ({
        id: `piped-${i.videoId}`,
        title: i.title,
        artist: i.uploaderName ?? 'Unknown',
        image: i.thumbnail,
        duration: Number(i.duration ?? 0),
        source: 'piped' as const,
        externalId: i.videoId,
      }));
  },
};

export const resolvePipedStreamUrl = async (videoId: string): Promise<string | null> => {
  for (let i = 0; i < PIPED_INSTANCES.length; i += 1) {
    try {
      const url = await piped.getBestAudioUrl(videoId);
      if (url) return url;
    } catch {
      rotatePipedInstance();
    }
  }
  return null;
};
