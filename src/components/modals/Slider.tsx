import React, { useState } from 'react';
import { StyleSheet, View, LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { BaseColors, hexToRgba } from '../../theme/colors';
import { R } from '../../theme/spacing';

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onValueChange: (v: number) => void;
  height?: number;
  width?: number;
  vertical?: boolean;
}

const Slider: React.FC<SliderProps> = ({
  min,
  max,
  value,
  onValueChange,
  height = 140,
  width = 24,
  vertical = true,
}) => {
  const [size, setSize] = useState({ w: width, h: height });
  const progress = useSharedValue((value - min) / (max - min));

  const clamp = (p: number) => Math.max(0, Math.min(1, p));

  const emit = (p: number) => {
    onValueChange(min + p * (max - min));
  };

  const pan = Gesture.Pan()
    .minDistance(0)
    .onUpdate(e => {
      let p: number;
      if (vertical) {
        p = clamp(1 - e.y / size.h);
      } else {
        p = clamp(e.x / size.w);
      }
      progress.value = p;
    })
    .onEnd(() => emit(progress.value));

  const fillStyle = useAnimatedStyle(() => {
    if (vertical) return { height: `${progress.value * 100}%` };
    return { width: `${progress.value * 100}%` };
  });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setSize({ w, h });
  };

  return (
    <GestureDetector gesture={pan}>
      <View
        onLayout={onLayout}
        style={[vertical ? styles.vTrack : styles.hTrack, vertical ? { height } : { width }]}
      >
        <Animated.View style={[styles.fill, fillStyle]} />
        <View style={[styles.marker, { top: (1 - (value - min) / (max - min)) * (height - 4) }]} />
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  vTrack: {
    width: 4,
    borderRadius: R.pill,
    backgroundColor: hexToRgba(BaseColors.text1, 0.15),
    justifyContent: 'flex-end',
  },
  hTrack: {
    height: 4,
    borderRadius: R.pill,
    backgroundColor: hexToRgba(BaseColors.text1, 0.15),
  },
  fill: {
    width: '100%',
    borderRadius: R.pill,
    backgroundColor: BaseColors.text1,
  },
  marker: {
    position: 'absolute',
    alignSelf: 'center',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: BaseColors.text1,
  },
});

export default Slider;
