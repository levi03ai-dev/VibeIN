import { saavn } from '../api/saavn';
import { resolvePipedStreamUrl, piped } from '../api/piped';
import type { VibeTrack, DownloadUrl } from '../types';
import { useSettingsStore } from '../store/settingsStore';

const normalize = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const isExactMatch = (a: string, b: string): boolean => {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
};

export const resolveStreamUrl = async (track: VibeTrack): Promise<string> => {
  const quality = useSettingsStore.getState().quality;

  const selectUrl = (urls?: DownloadUrl[]): string | undefined => {
    if (!urls || urls.length === 0) return undefined;
    const getBitrate = (q: string): number => {
      const num = parseInt(q, 10);
      return isNaN(num) ? 0 : num;
    };
    const sorted = [...urls].sort((a, b) => getBitrate(a.quality) - getBitrate(b.quality));
    if (quality === 'low') {
      const low = sorted.find(u => getBitrate(u.quality) >= 96) ?? sorted[0];
      return low.url;
    } else if (quality === 'medium') {
      const med = sorted.find(u => getBitrate(u.quality) >= 192) ?? sorted[sorted.length - 1];
      return med.url;
    } else {
      return sorted[sorted.length - 1].url;
    }
  };

  // 1. Direct saavn URL
  if (track.source === 'saavn' && track.downloadUrls?.length) {
    const url = selectUrl(track.downloadUrls);
    if (url) return url;
  }
  if (track.source === 'saavn' && track.url) {
    return track.url;
  }

  // 2. Piped direct video id
  if (track.source === 'piped' && track.externalId) {
    const url = await resolvePipedStreamUrl(track.externalId);
    if (url) return url;
  }

  // 3. Search saavn by title/artist
  try {
    const results = await saavn.searchSongs(`${track.title} ${track.artist}`, 1, 10);
    const match =
      results.find(r => isExactMatch(r.title, track.title) && isExactMatch(r.artist, track.artist)) ??
      results[0];
    if (match) {
      if (match.downloadUrls?.length) {
        const url = selectUrl(match.downloadUrls);
        if (url) return url;
      }
      if (match.url) return match.url;
    }
  } catch {
    // fall through
  }

  // 4. Fallback to piped search by title/artist or direct ID
  if (track.externalId) {
    const url = await resolvePipedStreamUrl(track.externalId);
    if (url) return url;
  }

  try {
    const results = await piped.searchSongs(`${track.title} ${track.artist}`);
    if (results.length > 0 && results[0].externalId) {
      const url = await resolvePipedStreamUrl(results[0].externalId);
      if (url) return url;
    }
  } catch {
    // fall through
  }

  throw new Error(`No stream found for: ${track.title}`);
};
