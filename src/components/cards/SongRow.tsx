import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BaseColors } from '../../theme/colors';
import { Type } from '../../theme/typography';
import { R, S } from '../../theme/spacing';
import { formatDuration } from '../../utils/format';
import IconButton from '../ui/IconButton';

interface SongRowProps {
  title: string;
  artist: string;
  image?: string;
  duration?: number;
  index?: number;
  playing?: boolean;
  onPress?: () => void;
  onMenuPress?: () => void;
  onLongPress?: () => void;
  showIndex?: boolean;
}

const SongRow: React.FC<SongRowProps> = ({
  title,
  artist,
  image,
  duration,
  index,
  playing,
  onPress,
  onMenuPress,
  onLongPress,
  showIndex,
}) => (
  <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.row}>
    {image ? (
      <FastImage source={{ uri: image }} style={styles.art} resizeMode={FastImage.resizeMode.cover} />
    ) : (
      <View style={[styles.art, styles.placeholder]}>
        {playing ? (
          <Ionicons name="volume-high" size={18} color={BaseColors.text1} />
        ) : (
          <Ionicons name="musical-note" size={18} color={BaseColors.text3} />
        )}
      </View>
    )}
    {showIndex ? (
      <Text style={styles.index}>{String((index ?? 0) + 1).padStart(2, '0')}</Text>
    ) : null}
    <View style={styles.info}>
      <Text numberOfLines={1} style={[styles.title, playing && styles.titlePlaying]}>
        {title}
      </Text>
      <Text numberOfLines={1} style={styles.artist}>
        {artist}
      </Text>
    </View>
    {duration ? <Text style={styles.duration}>{formatDuration(duration)}</Text> : null}
    {onMenuPress ? (
      <IconButton onPress={onMenuPress} size={32}>
        <Ionicons name="ellipsis-horizontal" size={18} color={BaseColors.text2} />
      </IconButton>
    ) : null}
  </Pressable>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingVertical: S.sm,
  },
  art: {
    width: 48,
    height: 48,
    borderRadius: R.sm,
    backgroundColor: BaseColors.bg2,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  index: {
    ...Type.mono,
    color: BaseColors.text3,
    width: 26,
    textAlign: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...Type.body,
    color: BaseColors.text1,
    fontWeight: '600',
  },
  titlePlaying: {
    color: '#FFFFFF',
  },
  artist: {
    ...Type.sm,
    color: BaseColors.text2,
  },
  duration: {
    ...Type.sm,
    color: BaseColors.text3,
    fontVariant: ['tabular-nums'],
  },
});

export default SongRow;
