import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { BaseColors, hexToRgba } from '../theme/colors';
import { Type } from '../theme/typography';
import { S, R } from '../theme/spacing';
import { saavn } from '../api/saavn';
import { piped } from '../api/piped';
import TabPills from '../components/ui/TabPills';
import SongRow from '../components/cards/SongRow';
import AlbumCard from '../components/cards/AlbumCard';
import ArtistCard from '../components/cards/ArtistCard';
import Shimmer from '../components/ui/Shimmer';
import EmptyState from '../components/ui/EmptyState';
import { useDebounce } from '../hooks/useDebounce';
import { usePlayerStore } from '../store/playerStore';
import SongMenuModal from '../components/modals/SongMenuModal';
import AddToPlaylistModal from '../components/modals/AddToPlaylistModal';
import type { VibeTrack, VibeAlbum, VibeArtist, VibePlaylist } from '../types';

const GENRE_GRID = [
  { label: 'Pop', gradient: ['#FF5252', '#FF8A65'], icon: 'musical-note' },
  { label: 'Hip-Hop', gradient: ['#5C6BC0', '#7E57C2'], icon: 'mic' },
  { label: 'Rock', gradient: ['#546E7A', '#37474F'], icon: 'flash' },
  { label: 'R&B', gradient: ['#EC407A', '#FF80AB'], icon: 'heart' },
  { label: 'Electronic', gradient: ['#26A69A', '#4FC3F7'], icon: 'flash-outline' },
  { label: 'Lo-fi', gradient: ['#8D6E63', '#A1887F'], icon: 'moon' },
  { label: 'Jazz', gradient: ['#FFA726', '#FF7043'], icon: 'disc' },
  { label: 'Classical', gradient: ['#78909C', '#90A4AE'], icon: 'library' },
  { label: 'Indie', gradient: ['#AB47BC', '#CE93D8'], icon: 'headset' },
  { label: 'Country', gradient: ['#8D8D2F', '#C0CA33'], icon: 'planet' },
  { label: 'Disco', gradient: ['#D81B60', '#F06292'], icon: 'sparkles' },
  { label: 'Latin', gradient: ['#F4511E', '#FF7043'], icon: 'globe' },
];

type TabKey = 'songs' | 'artists' | 'albums' | 'playlists';

interface SearchResults {
  songs: VibeTrack[];
  artists: VibeArtist[];
  albums: VibeAlbum[];
  playlists: VibePlaylist[];
}

const SearchScreen: React.FC = () => {
  const playTrack = usePlayerStore(s => s.playTrack);
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 350);
  const [tab, setTab] = useState<TabKey>('songs');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [quick, setQuick] = useState<VibeTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const [menuTrack, setMenuTrack] = useState<VibeTrack | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);

  useEffect(() => {
    if (debounced.length < 2) {
      setResults(null);
      setQuick([]);
      setSearching(false);
      return;
    }
    let active = true;
    const run = async () => {
      setSearching(true);
      try {
        const [songs, artists, albums, playlists] = await Promise.all([
          saavn.searchSongs(debounced, 1, 20),
          saavn.searchArtists(debounced, 1, 8),
          saavn.searchAlbums(debounced, 1, 8),
          saavn.searchPlaylists(debounced, 1, 8),
        ]);
        let combined = songs;
        if (songs.length < 3) {
          try {
            const pipedSongs = await piped.searchSongs(debounced, 'music_songs');
            for (const p of pipedSongs) {
              if (!combined.some(c => c.title.toLowerCase() === p.title.toLowerCase())) {
                combined = [...combined, p];
              }
            }
          } catch {
            // piped fallback unavailable
          }
        }
        if (active) {
          setResults({ songs: combined, artists, albums, playlists });
          setQuick(songs.slice(0, 5));
        }
      } catch {
        // ignore
      } finally {
        if (active) setSearching(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [debounced]);

  const isIdle = query.length === 0;

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Search</Text>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={BaseColors.text2} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search songs, artists, albums…"
          placeholderTextColor={BaseColors.text3}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={BaseColors.text3} />
          </Pressable>
        )}
      </View>

      {isIdle ? (
        <View style={styles.grid}>
          {GENRE_GRID.map(g => (
            <Pressable key={g.label} style={styles.genreCard} onPress={() => setQuery(g.label)}>
              <LinearGradient colors={g.gradient} style={styles.genreGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name={g.icon as any} size={22} color="rgba(255,255,255,0.85)" />
                <Text style={styles.genreLabel}>{g.label}</Text>
              </LinearGradient>
            </Pressable>
          ))}
        </View>
      ) : searching ? (
        <View style={styles.flat}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Shimmer key={i} height={56} style={{ marginBottom: 12 }} />
          ))}
        </View>
      ) : results ? (
        <>
          <TabPills
            pills={[
              { key: 'songs', label: `Songs (${results.songs.length})` },
              { key: 'artists', label: 'Artists' },
              { key: 'albums', label: 'Albums' },
              { key: 'playlists', label: 'Playlists' },
            ]}
            activeKey={tab}
            onChange={k => setTab(k as TabKey)}
          />
          {tab === 'songs' && (
            results.songs.length === 0 ? (
              <EmptyState icon="musical-note-outline" title="No songs found" subtitle="Try a different search." />
            ) : (
              <FlatList
                data={results.songs}
                keyExtractor={(item, i) => `${item.id}-${i}`}
                renderItem={({ item }) => (
                  <SongRow
                    title={item.title}
                    artist={item.artist}
                    image={item.image}
                    duration={item.duration}
                    onPress={() => playTrack(item)}
                    onMenuPress={() => {
                      setMenuTrack(item);
                      setShowMenu(true);
                    }}
                  />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flat}
              />
            )
          )}
          {tab === 'artists' &&
            (results.artists.length === 0 ? (
              <EmptyState icon="people-outline" title="No artists found" />
            ) : (
              <View style={styles.resultRow}>
                {results.artists.map((a, i) => (
                  <ArtistCard key={`${a.id}-${i}`} name={a.name} image={a.image} size={82} />
                ))}
              </View>
            ))}
          {tab === 'albums' &&
            (results.albums.length === 0 ? (
              <EmptyState icon="albums-outline" title="No albums found" />
            ) : (
              <View style={styles.albumGrid}>
                {results.albums.map((a, i) => (
                  <AlbumCard key={`${a.id}-${i}`} name={a.name} image={a.image} width={110} />
                ))}
              </View>
            ))}
          {tab === 'playlists' &&
            (results.playlists.length === 0 ? (
              <EmptyState icon="list-outline" title="No playlists found" />
            ) : (
              <View style={styles.playlistWrap}>
                {results.playlists.map((p, i) => (
                  <Pressable key={`${p.id}-${i}`} style={styles.playlistRow}>
                    <View style={styles.playlistArt}>
                      <Ionicons name="musical-notes" size={18} color={BaseColors.text3} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} style={styles.playlistTitle}>{p.name}</Text>
                      {p.owner ? <Text numberOfLines={1} style={styles.playlistMeta}>{p.owner}</Text> : null}
                    </View>
                  </Pressable>
                ))}
              </View>
            ))}
        </>
      ) : (
        <View style={styles.quick}>
          {quick.map((t, i) => (
            <SongRow key={`${t.id}-${i}`} title={t.title} artist={t.artist} image={t.image} onPress={() => playTrack(t)} />
          ))}
        </View>
      )}

      <SongMenuModal
        visible={showMenu}
        track={menuTrack}
        onClose={() => setShowMenu(false)}
        onAddToPlaylist={() => {
          setShowMenu(false);
          setShowAddToPlaylist(true);
        }}
      />
      <AddToPlaylistModal visible={showAddToPlaylist} track={menuTrack} onClose={() => setShowAddToPlaylist(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BaseColors.bg0, paddingHorizontal: S.lg, paddingTop: 16 },
  title: { ...Type.d2, color: BaseColors.text1, marginBottom: S.lg },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    backgroundColor: hexToRgba(BaseColors.bg1, 0.9),
    borderRadius: R.pill,
    paddingHorizontal: S.lg,
    height: 44,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BaseColors.border,
    marginBottom: S.lg,
  },
  input: { flex: 1, color: BaseColors.text1, fontSize: Type.body.fontSize, padding: 0 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.md },
  genreCard: { width: '30%', aspectRatio: 1.2, borderRadius: R.md, overflow: 'hidden' },
  genreGradient: { flex: 1, justifyContent: 'flex-end', padding: S.sm, gap: 4 },
  genreLabel: { ...Type.sm, color: BaseColors.text1, fontWeight: '600' },
  quick: { gap: 2 },
  resultRow: { flexDirection: 'row', flexWrap: 'wrap', gap: S.md, paddingVertical: S.md },
  albumGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: S.md },
  playlistWrap: { paddingVertical: S.md },
  playlistRow: { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingVertical: S.sm },
  playlistTitle: { ...Type.body, color: BaseColors.text1, fontWeight: '600' },
  playlistMeta: { ...Type.sm, color: BaseColors.text2 },
  playlistArt: {
    width: 48,
    height: 48,
    borderRadius: R.sm,
    backgroundColor: BaseColors.bg2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flat: { paddingBottom: 120 },
});

export default SearchScreen;