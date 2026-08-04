import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { BaseColors, hexToRgba } from '../theme/colors';
import { Type } from '../theme/typography';
import { S } from '../theme/spacing';
import { saavn } from '../api/saavn';
import { lastfm } from '../api/lastfm';
import { usePlayerStore } from '../store/playerStore';
import SongRow from '../components/cards/SongRow';
import AlbumCard from '../components/cards/AlbumCard';
import Shimmer from '../components/ui/Shimmer';
import EmptyState from '../components/ui/EmptyState';
import type { VibeTrack, VibeAlbum } from '../types';

const ArtistScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const artist = route.params?.artist;
  const playTrack = usePlayerStore(s => s.playTrack);
  const [songs, setSongs] = useState<VibeTrack[]>([]);
  const [albums, setAlbums] = useState<VibeAlbum[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        let saavnSongs: VibeTrack[] = [];
        let saavnAlbums: VibeAlbum[] = [];
        try {
          if (artist?.id && !artist.id.startsWith('lf-')) {
            [saavnSongs, saavnAlbums] = await Promise.all([
              saavn.getArtistSongs(artist.id, 1, 'popularity'),
              saavn.getArtistAlbums(artist.id, 1),
            ]);
          }
        } catch {
          // fall through to lastfm
        }
        if (!saavnSongs.length) {
          const top = await lastfm.getArtistTopTracks(artist?.name ?? '', 20);
          saavnSongs = top.map(t => ({
            id: `lf-${t.name}-${t.artist}`.toLowerCase(),
            title: t.name,
            artist: t.artist,
            image: t.image,
            duration: t.duration ?? 0,
            source: 'lastfm' as const,
          }));
        }
        const sim = await lastfm.getArtistSimilar(artist?.name ?? '', 10);
        if (active) {
          setSongs(saavnSongs);
          setAlbums(saavnAlbums);
          setSimilar(sim);
        }
      } catch {
        // ignore
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [artist?.id, artist?.name]);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={BaseColors.text1} />
        </Pressable>
        <Text style={styles.headerTitle}>Artist</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          {artist?.image ? (
            <FastImage source={{ uri: artist.image }} style={styles.heroArt} resizeMode="cover" />
          ) : (
            <View style={[styles.heroArt, styles.heroPlaceholder]}>
              <Ionicons name="person" size={64} color={BaseColors.text3} />
            </View>
          )}
          <Text style={styles.name}>{artist?.name ?? 'Unknown Artist'}</Text>
        </View>

        {loading ? (
          <View>
            {Array.from({ length: 8 }).map((_, i) => (
              <Shimmer key={i} height={56} style={{ marginBottom: 12 }} />
            ))}
          </View>
        ) : (
          <>
            {songs.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>POPULAR SONGS</Text>
                {songs.slice(0, 10).map((t, i) => (
                  <SongRow
                    key={`${t.id}-${i}`}
                    title={t.title}
                    artist={t.artist}
                    image={t.image}
                    duration={t.duration}
                    onPress={() => playTrack(t)}
                  />
                ))}
              </>
            )}

            {albums.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>ALBUMS</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {albums.map((a, i) => (
                    <AlbumCard key={`${a.id}-${i}`} name={a.name} image={a.image} onPress={() => navigation.navigate('Album', { album: a })} />
                  ))}
                </ScrollView>
              </>
            )}

            {similar.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>SIMILAR ARTISTS</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {similar.map((a, i) => (
                    <Pressable key={i} style={styles.similarCard} onPress={() => navigation.replace('Artist', { artist: { id: `lf-${a.name}`, name: a.name, image: a.image } })}>
                      {a.image ? (
                        <FastImage source={{ uri: a.image }} style={styles.similarArt} resizeMode="cover" />
                      ) : (
                        <View style={[styles.similarArt, styles.heroPlaceholder]} />
                      )}
                      <Text numberOfLines={1} style={styles.similarName}>{a.name}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            )}

            {!songs.length && !albums.length && !similar.length && (
              <EmptyState icon="person-outline" title="No content" subtitle="Couldn't load artist details." />
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BaseColors.bg0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingHorizontal: S.lg,
    paddingTop: 16,
    paddingBottom: S.sm,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: hexToRgba(BaseColors.text1, 0.06) },
  headerTitle: { ...Type.h3, color: BaseColors.text1 },
  content: { paddingHorizontal: S.lg, paddingBottom: 120 },
  hero: { alignItems: 'center', gap: S.md, marginVertical: S.xl },
  heroArt: { width: 200, height: 200, borderRadius: 100 },
  heroPlaceholder: { backgroundColor: BaseColors.bg2, alignItems: 'center', justifyContent: 'center' },
  name: { ...Type.d1, color: BaseColors.text1, textAlign: 'center' },
  sectionTitle: { ...Type.label, color: BaseColors.text2, marginTop: S.xxl, marginBottom: S.md },
  similarCard: { alignItems: 'center', width: 100, marginRight: S.md },
  similarArt: { width: 84, height: 84, borderRadius: 42 },
  similarName: { ...Type.sm, color: BaseColors.text2, marginTop: S.sm, textAlign: 'center' },
});

export default ArtistScreen;