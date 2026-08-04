import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import FastImage from 'react-native-fast-image';
import { BaseColors } from '../../theme/colors';
import { Type } from '../../theme/typography';
import { R, S } from '../../theme/spacing';

interface SongCardProps {
  title: string;
  artist: string;
  image?: string;
  width?: number;
  onPress?: () => void;
}

const SongCard: React.FC<SongCardProps> = ({ title, artist, image, width = 160, onPress }) => (
  <Pressable onPress={onPress} style={[styles.card, { width }]}>
    <FastImage
      source={{ uri: image ?? undefined }}
      style={{ width, height: width, borderRadius: R.md }}
      resizeMode={FastImage.resizeMode.cover}
    />
    <Text numberOfLines={1} style={styles.title}>
      {title}
    </Text>
    <Text numberOfLines={1} style={styles.artist}>
      {artist}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    gap: S.xs,
    marginRight: S.lg,
  },
  title: {
    ...Type.h3,
    color: BaseColors.text1,
    marginTop: S.sm,
  },
  artist: {
    ...Type.sm,
    color: BaseColors.text2,
  },
});

export default SongCard;
