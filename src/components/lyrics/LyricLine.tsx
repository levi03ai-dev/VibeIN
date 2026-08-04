import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Springs } from '../../theme/animations';
import { Type } from '../../theme/typography';

export type LyricState = 'active' | 'near' | 'far';

interface LyricLineProps {
  text: string;
  state: LyricState;
  onPress: () => void;
}

const AnimatedText = Animated.createAnimatedComponent(Animated.Text);

const config: Record<LyricState, {
  fontSize: number;
  fontWeight: string;
  color: string;
  opacity: number;
  scale: number;
}> = {
  active: {
    fontSize: Type.lyricActive.fontSize,
    fontWeight: '700',
    color: '#FFFFFF',
    opacity: 1,
    scale: 1,
  },
  near: {
    fontSize: Type.lyricNear.fontSize,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.65)',
    opacity: 1,
    scale: 0.95,
  },
  far: {
    fontSize: Type.lyricFar.fontSize,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.30)',
    opacity: 0.8,
    scale: 0.9,
  },
};

const LyricLine: React.FC<LyricLineProps> = ({ text, state, onPress }) => {
  const target = config[state];

  const animatedStyle = useAnimatedStyle(() => ({
    fontSize: withSpring(target.fontSize, Springs.gentle),
    color: withSpring(target.color as string, Springs.gentle),
    opacity: withSpring(target.opacity, Springs.gentle),
    transform: [{ scale: withSpring(target.scale, Springs.gentle) }],
  }));

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <AnimatedText style={[styles.text, animatedStyle]} selectable={false}>
        {text}
      </AnimatedText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  text: {
    textAlign: 'center',
    includeFontPadding: false,
  },
});

export default LyricLine;