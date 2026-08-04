import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BaseColors } from '../../theme/colors';
import { Type } from '../../theme/typography';
import GlassCard from './GlassCard';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  accent?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'musical-notes-outline',
  title,
  subtitle,
  action,
  accent = BaseColors.text3,
}) => (
  <View style={styles.container}>
    <GlassCard style={styles.iconWrap} blur={false}>
      <Ionicons name={icon} size={34} color={accent} />
    </GlassCard>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    {action}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 32,
    gap: 12,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Type.h1,
    color: BaseColors.text1,
    textAlign: 'center',
  },
  subtitle: {
    ...Type.body,
    color: BaseColors.text2,
    textAlign: 'center',
  },
});

export default EmptyState;