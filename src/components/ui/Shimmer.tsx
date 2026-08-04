import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { BaseColors } from '../../theme/colors';
import { R } from '../../theme/spacing';

const W = Dimensions.get('window').width;

interface ShimmerProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

const Shimmer: React.FC<ShimmerProps> = ({ width = '100%', height = 60, borderRadius = R.md, style }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.linear }),
      -1,
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [-W * 1.5, W * 1.5]) }],
  }));

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          overflow: 'hidden',
          backgroundColor: BaseColors.bg2,
        },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={['transparent', 'rgba(255,255,255,0.08)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

export const ShimmerList: React.FC<{ count?: number; height?: number }> = ({
  count = 6,
  height = 60,
}) => (
  <View>
    {Array.from({ length: count }).map((_, i) => (
      <Shimmer key={i} height={height} style={{ marginBottom: 12 }} />
    ))}
  </View>
);

export default Shimmer;
