import React, { useState } from 'react';
import { StyleSheet, View, Text, LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { BaseColors, hexToRgba } from '../../theme/colors';
import { Springs } from '../../theme/animations';
import { formatDuration } from '../../utils/format';
import { R } from '../../theme/spacing';
import { haptics } from '../../utils/haptics';

interface SeekBarProps {
  position: number;
  duration: number;
  accent?: string;
  onSeek?: (position: number) => void;
  height?: number;
  showTimes?: boolean;
}

const SeekBar: React.FC<SeekBarProps> = ({
  position,
  duration,
  accent = '#FFFFFF',
  onSeek,
  height = 5,
  showTimes = true,
}) => {
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(0);
  const thumbScale = useSharedValue(1);
  const dragging = useSharedValue(false);

  const clamp = (p: number) => Math.max(0, Math.min(1, p));

  const emitSeek = (p: number) => {
    if (onSeek && duration > 0) onSeek(p * duration);
  };

  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin(() => {
      dragging.value = true;
      thumbScale.value = withSpring(1.6, Springs.snappy);
    })
    .onUpdate(e => {
      const p = width > 0 ? clamp(e.x / width) : 0;
      progress.value = p;
    })
    .onEnd(() => {
      thumbScale.value = withSpring(1, Springs.snappy);
      const p = progress.value;
      dragging.value = false;
      haptics.light();
      runOnJS(emitSeek)(p);
    })
    .onFinalize(() => {
      dragging.value = false;
    });

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: thumbScale.value }],
    left: `${progress.value * 100}%`,
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  // Sync shared value from props when not dragging
  React.useEffect(() => {
    if (!dragging.value && duration > 0) {
      progress.value = clamp(position / duration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, duration]);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={pan}>
        <View style={[styles.trackWrap, { height: height + 18 }]} onLayout={onLayout}>
          <View style={[styles.track, { height }]}>
            <Animated.View style={[StyleSheet.absoluteFill, styles.trackFillBase, fillStyle]}>
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={[hexToRgba(accent, 0.7), accent]}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
          <Animated.View
            style={[
              styles.thumb,
              { backgroundColor: accent },
              thumbStyle,
            ]}
          />
        </View>
      </GestureDetector>
      {showTimes && (
        <View style={styles.times}>
          <Text style={styles.time}>{formatDuration(position)}</Text>
          <Text style={styles.time}>{formatDuration(duration)}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  trackWrap: {
    justifyContent: 'center',
  },
  track: {
    width: '100%',
    borderRadius: R.pill,
    backgroundColor: hexToRgba(BaseColors.text1, 0.18),
    overflow: 'hidden',
  },
  trackFillBase: {
    overflow: 'hidden',
    borderRadius: R.pill,
  },
  thumb: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: -5,
  },
  times: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    color: BaseColors.text2,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
});

export default SeekBar;
