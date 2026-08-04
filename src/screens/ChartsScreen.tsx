import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BaseColors } from '../theme/colors';
import { Type } from '../theme/typography';
import { S } from '../theme/spacing';
import { lastfm } from '../api/lastfm';
import TabPills from '../components/ui/TabPills';
import SongRow from '../components/cards/SongRow';
import Shimmer from '../components/ui/Shimmer';
import EmptyState from '../components/ui/EmptyState';
import { usePlayerStore } from '../store/playerStore';
import type { VibeTrack } from '../types';

const COUNTRIES = [
  { key: 'Global', label: '🌍', code: '' },
  { key: 'US', label: '🇺🇸', code: 'united states' },
  { key: 'UK', label: '🇬🇧', code: 'united kingdom' },
  { key: 'DE', label: '🇩🇪', code: 'germany' },
  { key: 'FR', label: '🇫🇷', code: 'france' },
  { key: 'JP', label: '🇯🇵', code: 'japan' },
  { key: 'KR', label: '🇰🇷', code: 'south korea' },
  { key: 'BR', label: '🇧🇷', code: 'brazil' },
  { key: 'IN', label: '🇮🇳', code: 'india' },
];

const toVibeTrack = (t: any): VibeTrack => ({
  id: `lf-${t.name}-${t.artist}`.toLowerCase(),
  title: t.name,
  artist: t.artist,
  image: t.image,
  duration: t.duration ?? 0,
  source: 'lastfm',
});

const ChartsScreen: React.FC = () => {
  const playTrack = usePlayerStore(s => s.playTrack);
  const playQueue = usePlayerStore(s => s.playQueue);
  const [country, setCountry] = useState('Global');
  const [tracks, setTracks] = useState<VibeTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const load = async () => {
      try {
        const item = COUNTRIES.find(c => c.key === country);
        const data = item?.code
          ? await lastfm.getGeoTopTracks(item.code, 50)
          : await lastfm.getTopTracks(50);
        if (active) setTracks(data.map(toVibeTrack));
      } catch {
        if (active) setTracks([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [country]);

  const flagPills = COUNTRIES.map(c => ({ key: c.key, label: c.key, emoji: c.label }));

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Worldwide Charts</Text>

      <TabPills pills={flagPills} activeKey={country} onChange={setCountry} />

      <Text style={styles.subtitle}>Top 50 · {country}</Text>

      {loading ? (
        <View>
          {Array.from({ length: 10 }).map((_, i) => (
            <Shimmer key={i} height={56} style={{ marginBottom: 12 }} />
          ))}
        </View>
      ) : tracks.length === 0 ? (
        <EmptyState icon="bar-chart-outline" title="No chart data" subtitle="Couldn't load worldwide charts." />
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(t, i) => `${t.id}-${i}`}
          renderItem={({ item, index }) => (
            <SongRow
              title={item.title}
              artist={item.artist}
              image={item.image}
              duration={item.duration}
              index={index}
              showIndex
              onPress={() => playTrack(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flat}
          ListFooterComponent={
            <Pressable onPress={() => tracks.length && playQueue(tracks, 0)} style={styles.playAll}>
              <Ionicons name="play" size={18} color={BaseColors.text1} />
              <Text style={styles.playAllText}>Play All</Text>
            </Pressable>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BaseColors.bg0, paddingHorizontal: S.lg, paddingTop: 16 },
  title: { ...Type.d2, color: BaseColors.text1, marginBottom: S.lg },
  subtitle: { ...Type.sm, color: BaseColors.text3, marginVertical: S.md },
  flat: { paddingBottom: 120 },
  playAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.sm,
    paddingVertical: S.lg,
  },
  playAllText: { ...Type.h3, color: BaseColors.text1 },
});

export default ChartsScreen;