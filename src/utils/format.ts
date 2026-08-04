import { formatDistanceToNowStrict, format as dateFnsFormat } from 'date-fns';

export const formatDuration = (seconds: number): string => {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
};

export const formatPlayCount = (n: number | undefined): string => {
  if (!n) return '';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

export const relativeTime = (ts: number): string => {
  try {
    return formatDistanceToNowStrict(ts, { addSuffix: true });
  } catch {
    return '';
  }
};

export const formatDate = (ts: number, pattern = 'MMM d, yyyy'): string => {
  try {
    return dateFnsFormat(ts, pattern);
  } catch {
    return '';
  }
};

export const greetByTime = (): string => {
  const h = new Date().getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

export const truncate = (s: string, max: number): string =>
  s.length > max ? `${s.slice(0, max - 1)}…` : s;

export const uniqueById = <T extends { id: string }>(arr: T[]): T[] => {
  const seen = new Set<string>();
  return arr.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

export const shuffleArray = <T>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
