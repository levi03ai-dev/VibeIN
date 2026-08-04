import type { VibeAlbum, VibeArtist, VibePlaylist, VibeTrack } from '../types';

export type RootStackParamList = {
  MainTabs: undefined;
  Artist: { artist: VibeArtist };
  Album: { album: VibeAlbum };
  Playlist: { playlist: VibePlaylist };
  Mood: { mood: string; emoji?: string };
  Search: undefined;
  Charts: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Library: undefined;
  Charts: undefined;
  Settings: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  Artist: { artist: VibeArtist };
  Album: { album: VibeAlbum };
  Playlist: { playlist: VibePlaylist };
};

export type SearchStackParamList = {
  SearchScreen: undefined;
  Artist: { artist: VibeArtist };
  Album: { album: VibeAlbum };
};

export type LibraryStackParamList = {
  LibraryScreen: undefined;
  Playlist: { playlist: VibePlaylist };
};

export type ChartsStackParamList = {
  ChartsScreen: undefined;
  Artist: { artist: VibeArtist };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
