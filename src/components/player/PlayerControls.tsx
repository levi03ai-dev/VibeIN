import React from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BaseColors, hexToRgba } from '../../theme/colors';
import { Springs, Timings } from '../../theme/animations';
import { haptics } from '../../utils/haptics';
import type { RepeatMode } from '../../types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PlayerControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  shuffleEnabled: boolean;
  onToggleShuffle: () => void;
  repeatMode: RepeatMode;
  onCycleRepeat: () => void;
  accent?: string;
  big?: boolean;
}

const ControlButton: React.FC<{
  onPress?: () => void;
  onLongPress?: () => void;
  children: React.ReactNode;
  size?: number;
}> = ({ onPress, onLongPress, children, size = 48 }) => {
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.85, Springs.snappy);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, Springs.snappy);
      }}
      onPress={() => {
        haptics.selection();
        onPress?.();
      }}
      onLongPress={onLongPress}
      style={[styles.controlBtn, { width: size, height: size }, style]}
    >
      {children}
    </AnimatedPressable>
  );
};

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onNext,
  onPrevious,
  shuffleEnabled,
  onToggleShuffle,
  repeatMode,
  onCycleRepeat,
  accent = '#FFFFFF',
  big = false,
}) => {
  const repeatRotate = useSharedValue(0);

  const repeatStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${repeatRotate.value}deg` }],
  }));

  const shuffleStyle = useAnimatedStyle(() => ({
    opacity: shuffleEnabled ? 1 : 0.45,
  }));

  const toggleShuffle = () => {
    repeatRotate.value = 0;
    haptics.light();
    onToggleShuffle();
  };

  const cycleRepeat = () => {
    repeatRotate.value = withTiming(360, { duration: Timings.normal });
    haptics.selection();
    onCycleRepeat();
  };


  return (
    <View style={styles.row}>
      <ControlButton onPress={toggleShuffle} size={big ? 52 : 48}>
        <Animated.View style={shuffleStyle}>
          <Ionicons
            name="shuffle"
            size={big ? 22 : 18}
            color={shuffleEnabled ? accent : BaseColors.text2}
          />
        </Animated.View>
      </ControlButton>

      <ControlButton onPress={onPrevious} onLongPress={() => {}} size={big ? 60 : 52}>
        <Ionicons name="play-skip-back" size={big ? 30 : 26} color={BaseColors.text1} />
      </ControlButton>

      <ControlButton onPress={onTogglePlay} size={big ? 80 : 64}>
        <View
          style={[
            styles.playBtn,
            { width: big ? 80 : 64, height: big ? 80 : 64 },
            { borderColor: hexToRgba(accent, 0.6), backgroundColor: accent },
          ]}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={big ? 34 : 28}
            color={BaseColors.textInverse}
            style={!isPlaying && styles.playIconOffset}
          />
        </View>
      </ControlButton>

      <ControlButton onPress={onNext} size={big ? 60 : 52}>
        <Ionicons name="play-skip-forward" size={big ? 30 : 26} color={BaseColors.text1} />
      </ControlButton>

      <ControlButton onPress={cycleRepeat} size={big ? 52 : 48}>
        <Animated.View style={repeatStyle}>
          <Ionicons
            name={
              repeatMode === 'track'
                ? 'repeat'
                : repeatMode === 'queue'
                ? 'repeat'
                : 'repeat-outline'
            }
            size={big ? 22 : 18}
            color={
              repeatMode === 'off'
                ? BaseColors.text2
                : repeatMode === 'track'
                ? accent
                : accent
            }
          />
          {repeatMode === 'track' && (
            <View style={styles.repeatBadge}>
              <Text style={styles.repeatBadgeText}>1</Text>
            </View>
          )}
        </Animated.View>
      </ControlButton>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  controlBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  playIconOffset: {
    marginLeft: 3,
  },
  repeatBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: BaseColors.bg3,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  repeatBadgeText: {
    color: BaseColors.text1,
    fontSize: 9,
    fontWeight: '700',
  },
});

export default PlayerControls;
