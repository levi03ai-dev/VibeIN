import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Pressable,
  ScrollView,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import { BaseColors, hexToRgba } from '../../theme/colors';
import { Springs } from '../../theme/animations';
import { Type } from '../../theme/typography';
import { R, S } from '../../theme/spacing';
import AlbumArtwork from './AlbumArtwork';
import SeekBar from './SeekBar';
import PlayerControls from './PlayerControls';
import VolumeBar from './VolumeBar';
import LyricsView from '../lyrics/LyricsView';
import IconButton from '../ui/IconButton';
import GlassCard from '../ui/GlassCard';
import { formatDuration } from '../../utils/format';
import type { VibeTrack } from '../../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DISMISS_THRESHOLD = 120;

interface NowPlayingSheetProps {
  visible: boolean;
  onClose: () => void;
  track: VibeTrack | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  accent?: string;
  paletteBg?: string;
  shuffleEnabled: boolean;
  repeatMode: 'off' | 'track' | 'queue';
  isFavorite: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (p: number) => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onToggleFavorite: () => void;
  onChangeVolume: (v: number) => void;
  volume: number;
  onQueuePlay: (t: VibeTrack) => void;
  queue: VibeTrack[];
  related: VibeTrack[];
}

type TabKey = 'lyrics' | 'queue' | 'related';

const NowPlayingSheet: React.FC<NowPlayingSheetProps> = ({
  visible,
  onClose,
  track,
  isPlaying,
  position,
  duration,
  accent = '#FFFFFF',
  paletteBg,
  shuffleEnabled,
  repeatMode,
  isFavorite,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onToggleShuffle,
  onCycleRepeat,
  onToggleFavorite,
  onChangeVolume,
  volume,
  onQueuePlay,
  queue,
  related,
}) => {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const [tab, setTab] = useState<TabKey>('lyrics');

  const onPlayFromList = (t: VibeTrack) => {
    onQueuePlay(t);
  };

  const open = () => {
    translateY.value = withSpring(0, Springs.slow);
    backdropOpacity.value = withTiming(1, { duration: 300 });
  };

  const close = () => {
    translateY.value = withSpring(SCREEN_HEIGHT, Springs.slow);
    backdropOpacity.value = withTiming(0, { duration: 300 });
    setTimeout(onClose, 250);
  };

  React.useEffect(() => {
    if (visible) open();
    else {
      translateY.value = SCREEN_HEIGHT;
      backdropOpacity.value = 0;
    }
  }, [visible]);

  const pan = Gesture.Pan()
    .activateAfterLongPress(200)
    .activeOffsetY(-10)
    .failOffsetY(10)
    .onUpdate(e => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
        backdropOpacity.value = interpolate(
          e.translationY,
          [0, SCREEN_HEIGHT],
          [1, 0],
        );
      }
    })
    .onEnd(e => {
      if (e.translationY > DISMISS_THRESHOLD || e.velocityY > 800) {
        runOnJS(close)();
      } else {
        translateY.value = withSpring(0, Springs.slow);
        backdropOpacity.value = withTiming(1, { duration: 200 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'lyrics', label: 'Lyrics' },
    { key: 'queue', label: 'Queue' },
    { key: 'related', label: 'Related' },
  ];

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close}>
          <Animated.View style={[styles.backdrop, backdropStyle, { backgroundColor: backdropColor(paletteBg) }]}>
            {track?.image ? (
              <BlurView
                blurType="dark"
                blurAmount={60}
                reducedTransparencyFallbackColor="#000"
                style={StyleSheet.absoluteFill}
              >
                <FastImage source={{ uri: track.image }} style={StyleSheet.absoluteFill} resizeMode={FastImage.resizeMode.cover} />
              </BlurView>
            ) : null}
          </Animated.View>
        </Pressable>

        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.sheet, sheetStyle]}>
            <LinearGradient
              colors={[hexToRgba(paletteBg ?? '#0A0A0A', 0.65), '#0A0A0A', '#080808']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.handle} />

            <View style={styles.header}>
              <IconButton onPress={close} size={40}>
                <Ionicons name="chevron-down" size={24} color={BaseColors.text1} />
              </IconButton>
              <Text style={styles.headerTitle}>Now Playing</Text>
              <IconButton onPress={() => {}} size={40}>
                <Ionicons name="ellipsis-horizontal" size={22} color={BaseColors.text1} />
              </IconButton>
            </View>

            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
            >
              <AlbumArtwork
                image={track?.image}
                isPlaying={isPlaying}
                size={Math.min(SCREEN_HEIGHT * 0.3, 300)}
                accent={accent}
              />

              <View style={styles.trackInfo}>
                <Text numberOfLines={1} style={styles.songTitle}>
                  {track?.title}
                </Text>
                <View style={styles.metaRow}>
                  <Text numberOfLines={1} style={styles.artistName}>
                    {track?.artist}
                  </Text>
                  {track?.album ? <Text style={styles.dot}>·</Text> : null}
                  {track?.album ? (
                    <Text numberOfLines={1} style={styles.artistName}>
                      {track.album}
                    </Text>
                  ) : null}
                  <IconButton onPress={onToggleFavorite} size={32}>
                    <Ionicons
                      name={isFavorite ? 'heart' : 'heart-outline'}
                      size={22}
                      color={isFavorite ? accent : BaseColors.text2}
                    />
                  </IconButton>
                </View>
              </View>

              <SeekBar
                position={position}
                duration={duration}
                accent={accent}
                onSeek={onSeek}
                showTimes
              />

              <PlayerControls
                isPlaying={isPlaying}
                onTogglePlay={onTogglePlay}
                onNext={onNext}
                onPrevious={onPrevious}
                shuffleEnabled={shuffleEnabled}
                onToggleShuffle={onToggleShuffle}
                repeatMode={repeatMode}
                onCycleRepeat={onCycleRepeat}
                accent={accent}
                big
              />

              <VolumeBar volume={volume} onChange={onChangeVolume} accent={accent} />

              <View style={styles.tabs}>
                {tabs.map(t => {
                  const active = t.key === tab;
                  return (
                    <Pressable key={t.key} onPress={() => setTab(t.key)} style={styles.tabPill}>
                      <View style={[styles.tabIndicator, active && { backgroundColor: accent }]} />
                      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t.label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {tab === 'lyrics' && <LyricsTrack track={track} accent={accent} />}
              {tab === 'queue' && <QueueList queue={queue} />}
              {tab === 'related' && (
                <RelatedList tracks={related} accent={accent} onPlay={onPlayFromList} />
              )}
            </ScrollView>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
};

const backdropColor = (paletteBg?: string, fallback = '#000000') => paletteBg || fallback;

const LyricsTrack: React.FC<{ track: VibeTrack | null; accent?: string }> = ({ track, accent }) => (
  <View style={{ minHeight: 300 }}>
    <LyricsView track={track} accent={accent} />
  </View>
);

const QueueList: React.FC<{ queue: VibeTrack[] }> = ({ queue }) => (
  <View style={styles.panel}>
    {queue.slice(0, 30).map((t, i) => (
      <View key={`${t.id}-${i}`} style={styles.queueRow}>
        <FastImage source={{ uri: t.image }} style={styles.queueArt} resizeMode={FastImage.resizeMode.cover} />
        <View style={styles.queueInfo}>
          <Text numberOfLines={1} style={styles.queueTitle}>{t.title}</Text>
          <Text numberOfLines={1} style={styles.queueArtist}>{t.artist}</Text>
        </View>
        <Text style={styles.queueDur}>{formatDuration(t.duration)}</Text>
      </View>
    ))}
  </View>
);

const RelatedList: React.FC<{ tracks: VibeTrack[]; accent?: string; onPlay: (t: VibeTrack) => void }> = ({
  tracks,
  accent,
  onPlay,
}) => (
  <View style={styles.panel}>
    <Pressable
      onPress={() => tracks.length && onPlay(tracks[0])}
      style={[styles.playAllBtn, { backgroundColor: hexToRgba(accent ?? '#FFFFFF', 0.15) }]}
    >
      <Ionicons name="play" size={18} color={accent ?? '#FFFFFF'} />
      <Text style={styles.playAllText}>Play All</Text>
    </Pressable>
    {tracks.slice(0, 20).map((t, i) => (
      <Pressable key={`${t.id}-${i}`} style={styles.queueRow} onPress={() => onPlay(t)}>
        <FastImage source={{ uri: t.image }} style={styles.qthumb} resizeMode="cover" />
        <View style={styles.queueInfo}>
          <Text numberOfLines={1} style={styles.queueTitle}>{t.title}</Text>
          <Text numberOfLines={1} style={styles.queueArtist}>{t.artist}</Text>
        </View>
        <Ionicons name="play-circle-outline" size={22} color={BaseColors.text2} />
      </Pressable>
    ))}
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFill },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    overflow: 'hidden',
    backgroundColor: '#0A0A0A',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: hexToRgba(BaseColors.text1, 0.3),
    alignSelf: 'center',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
  },
  headerTitle: { ...Type.h3, color: BaseColors.text1 },
  content: { paddingHorizontal: S.lg, paddingBottom: 40, gap: S.lg },
  trackInfo: { gap: S.xs },
  songTitle: { ...Type.d2, color: BaseColors.text1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: S.xs },
  artistName: { ...Type.body, color: BaseColors.text2, flexShrink: 1 },
  dot: { color: BaseColors.text3 },
  tabs: { flexDirection: 'row', gap: S.md, marginTop: S.md },
  tabPill: { alignItems: 'center', gap: 6, paddingVertical: 4 },
  tabIndicator: { width: 20, height: 3, borderRadius: 2, backgroundColor: hexToRgba('#FFFFFF', 0.2) },
  tabLabel: { ...Type.label, color: BaseColors.text2 },
  tabLabelActive: { color: BaseColors.text1 },
  panel: { paddingVertical: S.sm, gap: 2, minHeight: 200 },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingVertical: S.sm,
  },
  qthumb: { width: 40, height: 40, borderRadius: R.sm },
  queueArt: { width: 48, height: 48, borderRadius: R.sm },
  queueInfo: { flex: 1, gap: 1 },
  queueTitle: { ...Type.body, color: BaseColors.text1, fontWeight: '600' },
  queueArtist: { ...Type.sm, color: BaseColors.text2 },
  queueDur: { ...Type.sm, color: BaseColors.text3 },
  playAllBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    paddingHorizontal: S.lg,
    paddingVertical: S.sm,
    borderRadius: R.pill,
    marginVertical: S.sm,
  },
  playAllText: { ...Type.h3, color: BaseColors.text1 },
});

export default NowPlayingSheet;