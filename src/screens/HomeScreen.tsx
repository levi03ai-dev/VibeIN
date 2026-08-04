import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { BaseColors, hexToRgba } from '../theme/colors';
import { Type } from '../theme/typography';
import { S, R } from '../theme/spacing';
import SongCard from '../components/cards/SongCard';
import AlbumCard from '../components/cards/AlbumCard';
import ArtistCard from '../components/cards/ArtistCard';
import SongRow from '../components/cards/SongRow';
import Shimmer from '../components/ui/Shimmer';
import EmptyState from '../components/ui/EmptyState';
import { saavn } from '../api/saavn';
import { lastfm } from '../api/lastfm';
import { usePlayerStore } from '../store/playerStore';
import { greetByTime } from '../utils/format';
import type { VibeTrack, VibeAlbum, VibeArtist } from '../types';

const MOODS = [
  { label: 'Chill', emoji: '😌', color: '#4FC3F7' },
  { label: 'Hype', emoji: '🔥', color: '#FF5252' },
  { label: 'Focus', emoji: '🧠', color: '#7E57C2' },
  { label: 'Sad', emoji: '😢', color: '#42A5F5' },
  { label: 'Party', emoji: '🎉', color: '#FFD740' },
  { label: 'Sleep', emoji: '😴', color: '#455A64' },
];

interface HomeData {
  forYou: VibeTrack[];
  charts: VibeTrack[];
  trending: VibeAlbum[];
  artists: VibeArtist[];
  recentlyPlayed: VibeTrack[];
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const playTrack = usePlayerStore(s => s.playTrack);
  const accent = usePlayerStore(s => s.accentColor);
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [country, setCountry] = useState('US');
  const [countryChart, setCountryChart] = useState<VibeTrack[]>([]);

  const load = useCallback(async () => {
    try {
      const [charts, globalTracks, geoUs, geoUk, geoJp, geoKr] = await Promise.all([
        saavn.getCharts(),
        lastfm.getTopTracks(20),
        lastfm.getGeoTopTracks('united states', 20),
        lastfm.getGeoTopTracks('united kingdom', 20),
        lastfm.getGeoTopTracks('japan', 20),
        lastfm.getGeoTopTracks('south korea', 20),
      ]);

      const countryMap: Record<string, any[]> = {
        US: geoUs,
        GB: geoUk,
        JP: geoJp,
        KR: geoKr,
      };

      const trendingAlbums: VibeAlbum[] = await fetchTrendingAlbums();
      const featuredArtists: VibeArtist[] = await fetchFeaturedArtists();

      const lastfmToVibe = (t: any): VibeTrack => ({
        id: `lf-${t.name}-${t.artist}`.toLowerCase(),
        title: t.name,
        artist: t.artist,
        image: t.image,
        duration: t.duration ?? 0,
        source: 'lastfm',
      });

      const countryTracks = (countryMap[country] ?? []).map(lastfmToVibe);
      setCountryChart(countryTracks);

      const chartTracks: VibeTrack[] = await loadChartTracks(charts);
      const recs: VibeTrack[] = globalTracks.map(lastfmToVibe);

      setData({
        forYou: recs.slice(0, 12),
        charts: chartTracks,
        trending: trendingAlbums,
        artists: featuredArtists,
        recentlyPlayed: [],
      });
    } catch {
      // keep partial
    } finally {
      setLoading(false);
    }
  }, [country]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (loading && !data) {
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.logo}>Vibe</Text>
          <View style={styles.avatar} />
        </View>
        <View style={styles.loading}>
          <Shimmer height={40} />
          <Shimmer height={160} />
          <Shimmer height={160} />
          <Shimmer height={80} />
        </View>
      </View>
    );
  }

  const playVibe = (t: VibeTrack) => playTrack(t);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={[styles.logo, { color: accent }]}>Vibe</Text>
        <Pressable style={styles.avatar} onPress={() => (navigation as any).navigate('Settings')}>
          <Ionicons name="person" size={18} color={BaseColors.text2} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BaseColors.text3} />}
      >
        <Text style={styles.greeting}>{greetByTime()}</Text>
        <Text style={styles.subGreeting}>What sounds good right now?</Text>

        <SectionHeader title="FOR YOU" onSeeAll={() => {}} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {(data?.forYou ?? []).slice(0, 10).map(t => (
            <SongCard
              key={t.id}
              title={t.title}
              artist={t.artist}
              image={t.image}
              onPress={() => playVibe(t)}
            />
          ))}
        </ScrollView>

        <SectionHeader title="WORLDWIDE CHARTS" onSeeAll={() => (navigation as any).navigate('Charts')} />
        <View style={styles.countries}>
          {Object.entries({
            US: '🇺🇸',
            GB: '🇬🇧',
            JP: '🇯🇵',
            KR: '🇰🇷',
          }).map(([key, flag]) => (
            <Pressable
              key={key}
              onPress={() => setCountry(key)}
              style={[styles.countryPill, country === key && { backgroundColor: hexToRgba(accent, 0.15), borderColor: hexToRgba(accent, 0.5) }]}
            >
              <Text style={styles.countryFlag}>{flag}</Text>
              <Text style={[styles.countryLabel, country === key && { color: BaseColors.text1 }]}>{key}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.chartList}>
          {countryChart.slice(0, 10).map((t, i) => (
            <SongRow
              key={`${t.id}-${i}`}
              title={t.title}
              artist={t.artist}
              image={t.image}
              index={i}
              showIndex
              onPress={() => playVibe(t)}
            />
          ))}
        </View>

        <SectionHeader title="TRENDING NOW" onSeeAll={() => {}} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {(data?.trending ?? []).slice(0, 10).map((a, i) => (
            <AlbumCard
              key={`${a.id}-${i}`}
              name={a.name}
              image={a.image}
              onPress={() => (navigation as any).navigate('Album', { album: a })}
            />
          ))}
        </ScrollView>

        <SectionHeader title="MOODS & GENRES" onSeeAll={() => {}} />
        <View style={styles.moodGrid}>
          {MOODS.map(m => (
            <Pressable
              key={m.label}
              onPress={() => (navigation as any).navigate('Mood', { mood: m.label, emoji: m.emoji })}
              style={[styles.mood, { backgroundColor: hexToRgba(m.color, 0.18) }]}
            >
              <Text style={styles.moodEmoji}>{m.emoji}</Text>
              <Text style={styles.moodLabel}>{m.label}</Text>
            </Pressable>
          ))}
        </View>

        <SectionHeader title="FEATURED ARTISTS" onSeeAll={() => {}} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {(data?.artists ?? []).slice(0, 10).map((a, i) => (
            <ArtistCard
              key={`${a.id}-${i}`}
              name={a.name}
              image={a.image}
              onPress={() => (navigation as any).navigate('Artist', { artist: a })}
            />
          ))}
        </ScrollView>

        {(!data || (!data.forYou.length && !data.charts.length)) && (
          <EmptyState
            icon="cloud-offline-outline"
            title="Couldn't load content"
            subtitle="Pull to refresh and try again."
          />
        )}
      </ScrollView>
    </View>
  );
};

const loadChartTracks = async (charts: any[]): Promise<VibeTrack[]> => {
  if (!charts.length) return [];
  try {
    const first = charts.find(c => c.id) ?? charts[0];
    return await saavn.getChartSongs(first.id);
  } catch {
    return [];
  }
};

const fetchTrendingAlbums = async (): Promise<VibeAlbum[]> => {
  try {
    const res = await lastfm.getTopTracks(20);
    return res.slice(0, 10).map((t: any, i: number) => ({
      id: `alb-${i}`,
      name: t.name,
      image: t.image,
    }));
  } catch {
    return [];
  }
};

const fetchFeaturedArtists = async (): Promise<VibeArtist[]> => {
  try {
    const res = await lastfm.getTopArtists(10);
    return res.map((a: any, i: number) => ({
      id: `artist-${i}`,
      name: a.name,
      image: a.image,
    }));
  } catch {
    return [];
  }
};

const SectionHeader: React.FC<{ title: string; onSeeAll: () => void }> = ({ title, onSeeAll }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Pressable onPress={onSeeAll}>
      <Text style={styles.seeAll}>See all</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BaseColors.bg0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.lg,
    paddingTop: 16,
    paddingBottom: S.sm,
  },
  logo: { ...Type.d1, color: BaseColors.text1, fontWeight: '900' },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BaseColors.bg2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: S.lg, paddingBottom: 120 },
  loading: { padding: S.lg, gap: S.lg },
  greeting: { ...Type.d2, color: BaseColors.text1, marginTop: S.xl },
  subGreeting: { ...Type.body, color: BaseColors.text2, marginTop: 4, marginBottom: S.xl },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: S.xxl,
    marginBottom: S.md,
  },
  sectionTitle: { ...Type.label, color: BaseColors.text2 },
  seeAll: { ...Type.sm, color: BaseColors.text3 },
  row: { paddingRight: S.lg },
  countries: { flexDirection: 'row', gap: S.sm, marginBottom: S.md },
  countryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
    borderRadius: R.pill,
    borderWidth: 1,
    borderColor: BaseColors.border,
  },
  countryFlag: { fontSize: 14 },
  countryLabel: { ...Type.xs, color: BaseColors.text2, fontWeight: '700' },
  chartList: { gap: 2 },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: S.md,
  },
  mood: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
    borderRadius: R.pill,
  },
  moodEmoji: { fontSize: 18 },
  moodLabel: { ...Type.h3, color: BaseColors.text1 },
});

export default HomeScreen;