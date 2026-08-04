import axios from 'axios';

const ITUNES = 'https://itunes.apple.com/search';

export const artworkApi = {
  async searchFallback(artist: string, song: string): Promise<string | undefined> {
    try {
      const res = await axios.get(ITUNES, {
        params: { term: `${artist} ${song}`, media: 'music', limit: 1 },
        timeout: 10000,
      });
      const result = res.data?.results?.[0];
      if (!result?.artworkUrl100) return undefined;
      return result.artworkUrl100.replace('100x100', '600x600');
    } catch {
      return undefined;
    }
  },

  async searchAlbumFallback(artist: string, album: string): Promise<string | undefined> {
    try {
      const res = await axios.get(ITUNES, {
        params: { term: `${artist} ${album}`, entity: 'album', limit: 1 },
        timeout: 10000,
      });
      const result = res.data?.results?.[0];
      if (!result?.artworkUrl100) return undefined;
      return result.artworkUrl100.replace('100x100', '600x600');
    } catch {
      return undefined;
    }
  },
};
