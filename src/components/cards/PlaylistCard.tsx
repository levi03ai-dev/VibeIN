import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BaseColors } from '../../theme/colors';
import { Type } from '../../theme/typography';
import { R, S } from '../../theme/spacing';

interface PlaylistCardProps {
  name: string;
  image?: string;
  count?: number;
  width?: number;
  onPress?: () => void;
  onLongPress?: () => void;
  dashed?: boolean;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({
  name,
  image,
  count,
  width = 140,
  onPress,
  onLongPress,
  dashed,
}) => (
  <Pressable
    onPress={onPress}
    onLongPress={onLongPress}
    style={[styles.card, { width }]}
  >
    {dashed ? (
      <View style={[styles.art, styles.dashed]}>
        <Ionicons name="add" size={36} color={BaseColors.text3} />
      </View>
    ) : (
      <FastImage
        source={{ uri: image ?? undefined }}
        style={[styles.art]}
        resizeMode={FastImage.resizeMode.cover}
      />
    )}
    <Text numberOfLines={1} style={styles.name}>
      {name}
    </Text>
    {count !== undefined ? <Text style={styles.count}>{count} songs</Text> : null}
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    gap: S.xs,
    marginRight: S.lg,
  },
  art: {
    width: 140,
    height: 140,
    borderRadius: R.md,
    backgroundColor: BaseColors.bg2,
  },
  dashed: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: BaseColors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    ...Type.h3,
    color: BaseColors.text1,
    marginTop: S.sm,
  },
  count: {
    ...Type.sm,
    color: BaseColors.text3,
  },
});

export default PlaylistCard;