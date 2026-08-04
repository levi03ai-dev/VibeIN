import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BaseColors, hexToRgba } from '../theme/colors';
import { Type } from '../theme/typography';
import { S, R } from '../theme/spacing';
import { lastfm } from '../api/lastfm';
import { usePlayerStore } from '../store/playerStore';
import SongRow from '../components/cards/SongRow';
import Shimmer from '../components/ui/Shimmer';
import EmptyState from '../components/ui/EmptyState';
import type { VibeTrack } from '../types';

const MOOD_COLORS: Record<string, string[]> = {
  Chill: ['#4FC3F7', '#0288D1'],
  Hype: ['#FF5252', '#B71C1C'],
  Focus: ['#7E57C2', '#4527A0'],
  Workout: ['#FF7043', '#E64A19'],
  Sad: ['#42A5F5', '#1565C0'],
  Party: ['#FFD740', '#FF8F00'],
  Sleep: ['#455A64', '#263238'],
  Romance: ['#FF4081', '#C2185B'],
};

const TAG_MAP: Record<string, string> = {
  Chill: 'chill',
  Hype: 'hype',
  Focus: 'focus',
  Workout: 'workout',
  Sad: 'sad',
  Party: 'party',
  Sleep: 'sleep',
  Romance: 'romance',
};

const toVibeTrack = (t: any): VibeTrack => ({
  id: `lf-${t.name}-${t.artist}`.toLowerCase(),
  title: t.name,
  artist: t.artist,
  image: t.image,
  duration: t.duration ?? 0,
  source: 'lastfm',
});

const MoodScreen: React.FC<{ route: any }> = ({ route }) => {
  const mood: string = route.params?.mood ?? 'Chill';
  const emoji: string = route.params?.emoji ?? '';
  const playQueue = usePlayerStore(s => s.playQueue);
  const playTrack = usePlayerStore(s => s.playTrack);
  const [tracks, setTracks] = useState<VibeTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const load = async () => {
      try {
        const data = await lastfm.getTagTopTracks(TAG_MAP[mood] ?? mood.toLowerCase(), 50);
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
  }, [mood]);

  const colors = MOOD_COLORS[mood] ?? MOOD_COLORS.Chill;

  return (
    <View style={styles.root}>
      <LinearGradient colors={[hexToRgba(colors[0], 0.25), BaseColors.bg0]} style={styles.bg} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          {emoji} {mood}
        </Text>
        <Text style={styles.subtitle}>Hand-picked for this mood</Text>

        {loading ? (
          <View>
            {Array.from({ length: 8 }).map((_, i) => (
              <Shimmer key={i} height={56} style={{ marginBottom: 12 }} />
            ))}
          </View>
        ) : tracks.length === 0 ? (
          <EmptyState icon="musical-note-outline" title="No tracks found" subtitle={`No "${mood}" tracks available.`} />
        ) : (
          <>
            <View style={styles.actions}>
              <Pressable onPress={() => tracks.length && playQueue(tracks, 0)} style={styles.actionBtn}>
                <Ionicons name="play" size={18} color={BaseColors.textInverse} />
                <Text style={styles.actionText}>Play All</Text>
              </Pressable>
              <Pressable onPress={() => tracks.length && playQueue(tracks, Math.floor(Math.random() * tracks.length))} style={styles.actionBtn}>
                <Ionicons name="shuffle" size={18} color={BaseColors.textInverse} />
                <Text style={styles.actionText}>Shuffle</Text>
              </Pressable>
            </View>
            {tracks.map((t, i) => (
              <SongRow key={`${t.id}-${i}`} title={t.title} artist={t.artist} image={t.image} duration={t.duration} onPress={() => playTrack(t)} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BaseColors.bg0 },
  bg: { ...StyleSheet.absoluteFill },
  content: { paddingHorizontal: S.lg, paddingTop: 64, paddingBottom: 120 },
  title: { ...Type.d1, color: BaseColors.text1 },
  subtitle: { ...Type.body, color: BaseColors.text2, marginTop: 4, marginBottom: S.xl },
  actions: { flexDirection: 'row', gap: S.md, marginBottom: S.lg },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: R.pill,
    paddingHorizontal: S.lg,
    paddingVertical: S.sm,
  },
  actionText: { ...Type.h3, color: BaseColors.textInverse },
});

export default MoodScreen;