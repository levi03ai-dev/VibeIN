import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BaseColors, hexToRgba } from '../../theme/colors';
import { R, S } from '../../theme/spacing';

interface VolumeBarProps {
  volume: number;
  onChange: (v: number) => void;
  accent?: string;
}

const VolumeBar: React.FC<VolumeBarProps> = ({ volume, onChange, accent = '#FFFFFF' }) => {
  const [width, setWidth] = useState(0);
  const level = useSharedValue(volume);

  useEffect(() => {
    level.value = volume;
  }, [volume, level]);

  const clamp = (p: number) => Math.max(0, Math.min(1, p));

  const emit = (v: number) => {
    onChange(v);
  };

  const pan = Gesture.Pan()
    .minDistance(0)
    .onUpdate(e => {
      const v = width > 0 ? clamp(e.x / width) : 0;
      level.value = v;
    })
    .onEnd(() => {
      runOnJS(emit)(level.value);
    });

  const fillStyle = useAnimatedStyle(() => ({
    width: `${level.value * 100}%`,
  }));

  const onLayout = (e: { nativeEvent: { layout: { width: number } } }) => {
    setWidth(e.nativeEvent.layout.width);
  };

  return (
    <View style={styles.row}>
      <Ionicons name="volume-medium" size={20} color={BaseColors.text2} />
      <GestureDetector gesture={pan}>
        <View style={styles.trackWrap} onLayout={onLayout}>
<View style={styles.track}>
            <Animated.View style={[StyleSheet.absoluteFill, fillStyle, { backgroundColor: accent }]} />
          </View>
        </View>
      </GestureDetector>
      <Ionicons name="volume-high" size={20} color={BaseColors.text2} />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
  },
  trackWrap: {
    flex: 1,
    height: 24,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    borderRadius: R.pill,
    backgroundColor: hexToRgba(BaseColors.text1, 0.18),
    overflow: 'hidden',
  },
});

export default VolumeBar;