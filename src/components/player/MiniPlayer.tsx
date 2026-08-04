import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BaseColors, hexToRgba } from '../../theme/colors';
import { Springs } from '../../theme/animations';
import { Type } from '../../theme/typography';
import { R, S } from '../../theme/spacing';
import type { VibeTrack } from '../../types';

interface MiniPlayerProps {
  track: VibeTrack;
  isPlaying: boolean;
  position: number;
  duration: number;
  accent?: string;
  isFavorite: boolean;
  onPress: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleFavorite: () => void;
}

const THRESHOLD = 2000;

const MiniPlayer: React.FC<MiniPlayerProps> = ({
  track,
  isPlaying,
  position,
  duration,
  accent = '#FFFFFF',
  isFavorite,
  onPress,
  onTogglePlay,
  onNext,
  onPrevious,
  onToggleFavorite,
}) => {
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withSpring(0, Springs.gentle);
    opacity.value = withSpring(1, Springs.gentle);
  }, [opacity, translateY]);

  const pan = Gesture.Pan()
    .minDistance(30)
    .onUpdate(e => {
      if (Math.abs(e.velocityX) > 400) return;
      translateX.value = e.translationX;
    })
    .onEnd(e => {
      const vx = e.velocityX;
      if (vx < -THRESHOLD) {
        runOnJS(onNext)();
      } else if (vx > THRESHOLD) {
        runOnJS(onPrevious)();
      }
      translateX.value = withSpring(0, Springs.snappy);
    });

  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;
  const swipeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  const enterStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.wrap, enterStyle]}>
        <Animated.View style={[styles.container, swipeStyle]}>
          <Pressable style={styles.main} onPress={onPress}>
            <FastImage source={{ uri: track.image }} style={styles.art} resizeMode={FastImage.resizeMode.cover} />
            <View style={styles.info}>
              <Text numberOfLines={1} style={styles.title}>
                {track.title}
              </Text>
              <Text numberOfLines={1} style={styles.artist}>
                {track.artist}
              </Text>
            </View>
            <View style={styles.actions}>
              <Pressable onPress={onToggleFavorite} hitSlop={10}>
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={22}
                  color={isFavorite ? accent : BaseColors.text2}
                />
              </Pressable>
              <Pressable onPress={onTogglePlay} hitSlop={10} style={styles.playBtn}>
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={24}
                  color={BaseColors.text1}
                  style={!isPlaying && styles.playOffset}
                />
              </Pressable>
              <Pressable onPress={onNext} hitSlop={10}>
                <Ionicons name="play-skip-forward" size={24} color={BaseColors.text1} />
              </Pressable>
            </View>
          </Pressable>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: accent }]} />
          </View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: S.sm,
    paddingBottom: S.xs,
  },
  container: {
    borderRadius: R.lg,
    overflow: 'hidden',
    backgroundColor: hexToRgba('#111111', 0.98),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BaseColors.border,
  },
  main: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: S.sm,
    gap: S.md,
  },
  art: {
    width: 44,
    height: 44,
    borderRadius: R.sm,
  },
  info: {
    flex: 1,
    gap: 1,
  },
  title: {
    ...Type.body,
    fontWeight: '600',
    color: BaseColors.text1,
  },
  artist: {
    ...Type.sm,
    color: BaseColors.text2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.lg,
  },
  playBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playOffset: {
    marginLeft: 2,
  },
  progressTrack: {
    height: 2,
    backgroundColor: hexToRgba(BaseColors.text1, 0.15),
  },
  progressFill: {
    height: 2,
  },
});

export default MiniPlayer;