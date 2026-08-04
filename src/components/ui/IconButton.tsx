import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Springs } from '../../theme/animations';
import { BaseColors } from '../../theme/colors';
import { haptics } from '../../utils/haptics';

interface IconButtonProps {
  onPress?: () => void;
  onLongPress?: () => void;
  children: React.ReactNode;
  size?: number;
  style?: ViewStyle;
  disabled?: boolean;
  haptic?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  onLongPress,
  children,
  size = 44,
  style,
  disabled,
  haptic = true,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.85, Springs.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Springs.snappy);
  };

  const handlePress = () => {
    if (haptic) haptics.selection();
    onPress?.();
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      onLongPress={onLongPress}
      disabled={disabled}
      style={[styles.button, { width: size, height: size }, animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
});

export default IconButton;
