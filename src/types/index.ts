export type MusicSource = 'saavn' | 'piped' | 'lastfm';

export interface VibeArtist {
  id: string;
  name: string;
  image?: string;
  role?: string;
}

export interface VibeAlbum {
  id?: string;
  name: string;
  image?: string;
  url?: string;
}

export interface DownloadUrl {
  quality: string;
  url: string;
}

export interface VibeTrack {
  id: string;
  title: string;
  artist: string;
  artists?: VibeArtist[];
  album?: string;
  albumId?: string;
  image?: string;
  duration: number;
  source: MusicSource;
  url?: string;
  downloadUrls?: DownloadUrl[];
  externalId?: string;
  lyrics?: string;
  year?: string;
}

export interface VibePlaylist {
  id: string;
  name: string;
  description?: string;
  image?: string;
  owner?: string;
  trackIds?: string[];
  tracks?: VibeTrack[];
  createdAt?: number;
}

export interface ChartEntry {
  track: VibeTrack;
  rank: number;
}

export interface Palette {
  dominant: string;
  vibrant: string;
  muted: string;
  dark: string;
  light: string;
  background: string;
}

export type RepeatMode = 'off' | 'track' | 'queue';

export interface SearchResults {
  songs: VibeTrack[];
  albums: VibeAlbum[];
  artists: VibeArtist[];
  playlists: VibePlaylist[];
}

export interface SleepTimerMode {
  type: 'none' | 'duration' | 'endOfSong';
  endAt?: number;
}
