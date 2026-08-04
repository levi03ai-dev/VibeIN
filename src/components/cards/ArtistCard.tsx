import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { BaseColors } from '../../theme/colors';
import { Type } from '../../theme/typography';
import { S } from '../../theme/spacing';

interface ArtistCardProps {
  name: string;
  image?: string;
  size?: number;
  onPress?: () => void;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ name, image, size = 72, onPress }) => (
  <Pressable onPress={onPress} style={{ alignItems: 'center', width: size + 8, marginRight: S.md }}>
    <FastImage
      source={{ uri: image ?? undefined }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      resizeMode={FastImage.resizeMode.cover}
    />
    <Text numberOfLines={1} style={styles.name}>
      {name}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  name: {
    ...Type.sm,
    color: BaseColors.text2,
    marginTop: S.sm,
    textAlign: 'center',
  },
});

export default ArtistCard;