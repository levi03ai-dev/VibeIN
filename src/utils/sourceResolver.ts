import { saavn } from '../api/saavn';
import { resolvePipedStreamUrl } from '../api/piped';
import type { VibeTrack } from '../types';

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
  // 1. Direct saavn URL — highest quality last entry
  if (track.source === 'saavn' && track.downloadUrls?.length) {
    return track.downloadUrls[track.downloadUrls.length - 1].url;
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
    if (match?.downloadUrls?.length) {
      return match.downloadUrls[match.downloadUrls.length - 1].url;
    }
    if (match?.url) return match.url;
  } catch {
    // fall through
  }

  // 4. Fallback to piped search
  if (track.externalId) {
    const url = await resolvePipedStreamUrl(track.externalId);
    if (url) return url;
  }

  throw new Error(`No stream found for: ${track.title}`);
};
