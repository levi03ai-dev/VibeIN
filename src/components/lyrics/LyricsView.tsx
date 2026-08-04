import React, { useEffect, useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useLyrics } from '../../hooks/useLyrics';
import { usePlayerStore } from '../../store/playerStore';
import LyricLine from './LyricLine';
import EmptyState from '../ui/EmptyState';
import Shimmer from '../ui/Shimmer';
import { BaseColors, hexToRgba } from '../../theme/colors';
import { Type } from '../../theme/typography';
import type { VibeTrack } from '../../types';

interface LyricsViewProps {
  track: VibeTrack | null;
  accent?: string;
}

const CENTER_FACTOR = 0.4;

const LyricsView: React.FC<LyricsViewProps> = ({ track, accent = '#FFFFFF' }) => {
  const { lines, activeIndex, plain, isSynced, loading, noLyrics } = useLyrics(track);
  const scrollRef = useRef<ScrollView>(null);
  const lineYs = useRef<number[]>([]);
  const allowScroll = useRef(true);
  const lastAutoScroll = useRef(0);
  const seekTo = usePlayerStore(s => s.seekTo);

  useEffect(() => {
    lineYs.current = [];
    allowScroll.current = true;
    lastAutoScroll.current = 0;
  }, [track?.id, isSynced]);

  useEffect(() => {
    if (!isSynced || activeIndex < 0) return;
    const now = Date.now();
    if (!allowScroll.current) return;
    if (now - lastAutoScroll.current < 500) return;
    lastAutoScroll.current = now;
    const y = lineYs.current[activeIndex];
    if (y !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y: Math.max(0, y - 140), animated: true });
    }
  }, [activeIndex, isSynced]);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerCol}>
          <Shimmer height={200} style={{ alignSelf: 'stretch' }} />
        </View>
      );
    }
    if (noLyrics && !plain) {
      return (
        <EmptyState
          icon="disc-outline"
          title="No lyrics available"
          subtitle="Lyrics for this track couldn't be found."
          accent={accent}
        />
      );
    }
    if (plain) {
      return (
        <ScrollView contentContainerStyle={styles.plainWrap} showsVerticalScrollIndicator={false} overScrollMode="never">
          {plain.split('\n').map((line, i) => (
            <Text key={i} style={styles.plainLine}>
              {line}
            </Text>
          ))}
        </ScrollView>
      );
    }
    if (!isSynced) {
      return (
        <EmptyState
          icon="musical-notes"
          title="No synced lyrics"
          subtitle="Try playing a track with synced lyrics."
          accent={accent}
        />
      );
    }

    const getState = (i: number) => {
      if (activeIndex < 0) return 'far' as const;
      const dist = Math.abs(i - activeIndex);
      if (dist === 0) return 'active' as const;
      if (dist <= 1) return 'near' as const;
      return 'far' as const;
    };

    return (
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.lyricContent}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <View style={{ height: 140 }} />
        {lines.map((line, i) => (
          <View
            key={i}
            onLayout={e => {
              lineYs.current[i] = e.nativeEvent.layout.y;
            }}
          >
            <LyricLine
              text={line.text}
              state={getState(i)}
              onPress={() => {
                allowScroll.current = false;
                seekTo(line.time);
                setTimeout(() => {
                  allowScroll.current = true;
                }, 2000);
              }}
            />
          </View>
        ))}
        <View style={{ height: 160 }} />
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, isSynced ? styles.lyricBg : null]}>
      <Text style={styles.sectionLabel}>Lyrics</Text>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 220,
    marginTop: 4,
  },
  centerCol: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  scroll: {
    flexGrow: 0,
  },
  lyricContent: {
    paddingBottom: 40,
  },
  plainWrap: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 16,
    gap: 14,
  },
  plainLine: {
    ...Type.body,
    color: BaseColors.text2,
    textAlign: 'center',
  },
  sectionLabel: {
    ...Type.label,
    color: BaseColors.text3,
    marginBottom: 8,
  },
  lyricBg: {
    backgroundColor: hexToRgba(BaseColors.bg0, 0.4),
    borderRadius: 16,
    paddingHorizontal: 12,
  },
});

export default LyricsView;