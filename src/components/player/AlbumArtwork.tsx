import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  interpolate,
} from 'react-native-reanimated';
import { Springs, Timings } from '../../theme/animations';

interface AlbumArtworkProps {
  image?: string;
  isPlaying: boolean;
  size?: number;
  accent?: string;
  rotating?: boolean;
}

const AlbumArtwork: React.FC<AlbumArtworkProps> = ({
  image,
  isPlaying,
  size = 300,
  accent = '#FFFFFF',
  rotating = false,
}) => {
  const scale = useSharedValue(0.88);
  const opacity = useSharedValue(0);
  const glow = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(isPlaying ? 1 : 0.88, Springs.gentle);
    glow.value = withTiming(isPlaying ? 1 : 0, { duration: Timings.normal });
  }, [isPlaying, scale, glow]);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: Timings.normal });
  }, [opacity]);

  useEffect(() => {
    if (rotating) {
      if (isPlaying) {
        rotation.value = withRepeat(
          withSpring(360, { damping: 20, stiffness: 40, mass: 1 }),
          -1,
        );
      }
    }
  }, [rotating, isPlaying, rotation]);

  const artStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(glow.value, [0, 1], [0, 0.5]),
  }));

  return (
    <View style={[styles.wrap, { width: size + 16, height: size + 16 }]}>
      <Animated.View
        style={[
          styles.glow,
          { width: size, height: size, shadowColor: accent },
          glowStyle,
        ]}
      >
        <Animated.View style={artStyle}>
          <FastImage
            source={{ uri: image ?? undefined }}
            style={{ width: size, height: size, borderRadius: 12 }}
            resizeMode={FastImage.resizeMode.cover}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    borderRadius: 12,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 10 },
    shadowColor: '#FFFFFF',
  },
});

export default AlbumArtwork;