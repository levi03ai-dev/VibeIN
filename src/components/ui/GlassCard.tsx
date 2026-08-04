import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { BaseColors, hexToRgba } from '../../theme/colors';
import { R } from '../../theme/spacing';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 20,
  tint,
  tintOpacity = 0.08,
  blur = true,
}) => {
  const overlay = tint ? { backgroundColor: hexToRgba(tint, tintOpacity) } : null;

  return (
    <View style={[styles.container, style]}>
      {blur && (
        <BlurView
          blurType="dark"
          blurAmount={intensity}
          reducedTransparencyFallbackColor={BaseColors.bg1}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={[styles.overlay, overlay]} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: R.lg,
    backgroundColor: hexToRgba(BaseColors.bg1, 0.85),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BaseColors.border,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
  },
});

export default GlassCard;
