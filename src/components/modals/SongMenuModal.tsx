import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { BaseColors, hexToRgba } from '../../theme/colors';
import { Springs } from '../../theme/animations';
import { Type } from '../../theme/typography';
import { R, S } from '../../theme/spacing';
import { usePlayerStore } from '../../store/playerStore';
import { useLibraryStore } from '../../store/libraryStore';
import type { VibeTrack } from '../../types';
import { haptics } from '../../utils/haptics';

interface SongMenuModalProps {
  visible: boolean;
  track: VibeTrack | null;
  onClose: () => void;
  onAddToPlaylist: () => void;
}

interface MenuItem {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

const SongMenuModal: React.FC<SongMenuModalProps> = ({
  visible,
  track,
  onClose,
  onAddToPlaylist,
}) => {
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);
  const playTrack = usePlayerStore(s => s.playTrack);
  const addToQueue = usePlayerStore(s => s.addToQueue);
  const toggleFavorite = useLibraryStore(s => s.toggleFavorite);
  const isFavorite = useLibraryStore(s => s.isFavorite);

  React.useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, Springs.bouncy);
      opacity.value = withSpring(1, Springs.bouncy);
    }
  }, [visible, opacity, scale]);

  const menuStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!track) return null;

  const fav = isFavorite(track.id);

  const items: MenuItem[] = [
    {
      icon: fav ? 'heart' : 'heart-outline',
      label: fav ? 'Remove from Favorites' : 'Add to Favorites',
      onPress: () => {
        toggleFavorite(track);
        haptics.medium();
        onClose();
      },
    },
    {
      icon: 'add-circle-outline',
      label: 'Add to Playlist',
      onPress: () => {
        onAddToPlaylist();
      },
    },
    {
      icon: 'play',
      label: 'Play',
      onPress: () => {
        playTrack(track);
        onClose();
      },
    },
    {
      icon: 'play-forward-outline',
      label: 'Play Next',
      onPress: () => {
        addToQueue(track);
        haptics.selection();
        onClose();
      },
    },
    {
      icon: 'share-social-outline',
      label: 'Share',
      onPress: () => onClose(),
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View style={[styles.menu, menuStyle]}>
          <Pressable onPress={() => {}} style={styles.inner}>
            <View style={styles.header}>
              {track.image ? (
                <FastImage source={{ uri: track.image }} style={styles.art} resizeMode="cover" />
              ) : null}
              <View style={styles.headerInfo}>
                <Text numberOfLines={1} style={styles.title}>
                  {track.title}
                </Text>
                <Text numberOfLines={1} style={styles.artist}>
                  {track.artist}
                </Text>
              </View>
            </View>
            <ScrollView bounces={false}>
              {items.map(item => (
                <Pressable key={item.label} onPress={item.onPress} style={styles.item}>
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.danger ? BaseColors.error : BaseColors.text1}
                  />
                  <Text style={[styles.itemLabel, item.danger && { color: BaseColors.error }]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable onPress={onClose} style={styles.cancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  menu: {
    backgroundColor: BaseColors.bg2,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    paddingBottom: 32,
  },
  inner: {
    paddingHorizontal: S.lg,
    paddingTop: S.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    marginBottom: S.lg,
  },
  art: { width: 56, height: 56, borderRadius: R.sm },
  headerInfo: { flex: 1, gap: 2 },
  title: { ...Type.h2, color: BaseColors.text1 },
  artist: { ...Type.body, color: BaseColors.text2 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.lg,
    paddingVertical: S.md,
  },
  itemLabel: { ...Type.body, color: BaseColors.text1, fontSize: 15 },
  cancel: {
    marginTop: S.sm,
    alignItems: 'center',
    paddingVertical: S.md,
    borderRadius: R.md,
    backgroundColor: hexToRgba(BaseColors.text1, 0.06),
  },
  cancelText: { ...Type.h3, color: BaseColors.text2 },
});

export default SongMenuModal;