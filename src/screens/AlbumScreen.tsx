import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { BaseColors, hexToRgba } from '../theme/colors';
import { Type } from '../theme/typography';
import { S } from '../theme/spacing';
import { saavn } from '../api/saavn';
import { usePlayerStore } from '../store/playerStore';
import SongRow from '../components/cards/SongRow';
import Shimmer from '../components/ui/Shimmer';
import EmptyState from '../components/ui/EmptyState';
import type { VibeTrack } from '../types';

const AlbumScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const album = route.params?.album;
  const playTrack = usePlayerStore(s => s.playTrack);
  const playQueue = usePlayerStore(s => s.playQueue);
  const [songs, setSongs] = useState<VibeTrack[]>([]);
  const [image, setImage] = useState<string | undefined>(album?.image);
  const [name, setName] = useState<string>(album?.name ?? '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        if (album?.id && !album.id.startsWith('alb-')) {
          const data = await saavn.getAlbum(album.id);
          if (active) {
            setSongs(data?.songs ?? []);
            setImage(data?.album?.image ?? album.image);
            setName(data?.album?.name ?? album.name);
          }
        } else {
          // Fallback: search saavn for the album
          const results = await saavn.searchAlbums(album?.name ?? '', 1, 5);
          if (results.length) {
            const found = results.find(r => r.name.toLowerCase().includes((album?.name ?? '').toLowerCase())) ?? results[0];
            if (found?.id) {
              const data = await saavn.getAlbum(found.id);
              if (active) {
                setSongs(data?.songs ?? []);
                setImage(data?.album?.image ?? found.image);
              }
            }
          }
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
  }, [album?.id, album?.name, album?.image]);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={BaseColors.text1} />
        </Pressable>
        <Text style={styles.headerTitle}>Album</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          {image ? (
            <FastImage source={{ uri: image }} style={styles.heroArt} resizeMode="cover" />
          ) : (
            <View style={[styles.heroArt, styles.placeholder]}>
              <Ionicons name="albums-outline" size={48} color={BaseColors.text3} />
            </View>
          )}
          <Text style={styles.name}>{name}</Text>
        </View>

        {loading ? (
          <View style={styles.loading}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Shimmer key={i} height={56} style={{ marginBottom: 12 }} />
            ))}
          </View>
        ) : songs.length === 0 ? (
          <EmptyState icon="albums-outline" title="No songs found" subtitle="Couldn't load this album." />
        ) : (
          <View>
            <Pressable onPress={() => playQueue(songs, 0)} style={styles.playAll}>
              <View style={styles.playAllIcon}>
                <Ionicons name="play" size={18} color={BaseColors.textInverse} />
              </View>
              <Text style={styles.playAllText}>Play Album</Text>
            </Pressable>
            {songs.map((t, i) => (
              <SongRow
                key={`${t.id}-${i}`}
                title={t.title}
                artist={t.artist}
                image={t.image}
                duration={t.duration}
                onPress={() => playTrack(t)}
              />
            ))}
          </View>
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
  scrollContent: { paddingBottom: 140 },
  hero: { alignItems: 'center', gap: S.md, paddingHorizontal: S.lg, paddingTop: S.md, paddingBottom: S.lg },
  heroArt: { width: 220, height: 220, borderRadius: 16 },
  placeholder: { backgroundColor: BaseColors.bg2, alignItems: 'center', justifyContent: 'center' },
  name: { ...Type.d2, color: BaseColors.text1, textAlign: 'center', marginTop: S.md },
  loading: { paddingHorizontal: S.lg },
  playAll: { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingHorizontal: S.lg, paddingVertical: S.md },
  playAllIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playAllText: { ...Type.h2, color: BaseColors.text1 },
});

export default AlbumScreen;