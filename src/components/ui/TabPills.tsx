import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { BaseColors, hexToRgba } from '../../theme/colors';
import { R, S } from '../../theme/spacing';
import { Type } from '../../theme/typography';
import { Springs } from '../../theme/animations';

export interface Pill {
  key: string;
  label: string;
  emoji?: string;
}

interface TabPillsProps {
  pills: Pill[];
  activeKey: string;
  onChange: (key: string) => void;
  scrollable?: boolean;
}

const TabPills: React.FC<TabPillsProps> = ({ pills, activeKey, onChange, scrollable = true }) => {
  const activeX = useSharedValue(0);
  const activeWidth = useSharedValue(0);
  const containerRef = useRef<View>(null);

  useEffect(() => {
    const idx = pills.findIndex(p => p.key === activeKey);
    if (idx >= 0) {
      activeX.value = withSpring(idx * (PILL_W + S.sm), Springs.snappy);
      activeWidth.value = withSpring(PILL_W, Springs.snappy);
    }
  }, [activeKey, pills.length]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: activeX.value }],
    width: activeWidth.value,
  }));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={scrollable ? styles.scroll : undefined}
    >
      <View ref={containerRef} style={styles.track}>
        <Animated.View style={[styles.indicator, indicatorStyle]} />
        {pills.map(pill => {
          const active = pill.key === activeKey;
          return (
            <Pressable key={pill.key} onPress={() => onChange(pill.key)} style={styles.pill}>
              {pill.emoji ? <Text style={styles.emoji}>{pill.emoji}</Text> : null}
              <Text style={[styles.label, active && styles.labelActive]}>{pill.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
};

const PILL_W = 84;

const styles = StyleSheet.create({
  scroll: {
    marginHorizontal: -S.lg,
  },
  content: {
    paddingHorizontal: S.lg,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    backgroundColor: hexToRgba(BaseColors.bg1, 0.6),
    borderRadius: R.pill,
    padding: 4,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 0,
    borderRadius: R.pill,
    backgroundColor: hexToRgba(BaseColors.text1, 0.14),
  },
  pill: {
    width: PILL_W,
    height: 34,
    borderRadius: R.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
    zIndex: 1,
  },
  emoji: {
    fontSize: 14,
  },
  label: {
    ...Type.sm,
    color: BaseColors.text2,
    fontWeight: '600',
  },
  labelActive: {
    color: BaseColors.text1,
  },
});

export default TabPills;
