import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { BaseColors, hexToRgba } from '../../theme/colors';
import { Type } from '../../theme/typography';
import { R, S } from '../../theme/spacing';
import { useLibraryStore } from '../../store/libraryStore';
import type { VibeTrack } from '../../types';
import { haptics } from '../../utils/haptics';

interface AddToPlaylistModalProps {
  visible: boolean;
  track: VibeTrack | null;
  onClose: () => void;
}

const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ visible, track, onClose }) => {
  const playlists = useLibraryStore(s => s.playlists);
  const createPlaylist = useLibraryStore(s => s.createPlaylist);
  const addToPlaylist = useLibraryStore(s => s.addToPlaylist);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  const reset = () => {
    setCreating(false);
    setName('');
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    const id = createPlaylist(name.trim());
    if (track) addToPlaylist(id, track);
    haptics.success();
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.heading}>Add to Playlist</Text>

          {creating ? (
            <View style={styles.createRow}>
              <TextInput
                autoFocus
                value={name}
                onChangeText={setName}
                placeholder="Playlist name"
                placeholderTextColor={BaseColors.text3}
                style={styles.input}
                onSubmitEditing={handleCreate}
              />
              <Pressable onPress={handleCreate} style={styles.createBtn}>
                <Ionicons name="checkmark" size={20} color={BaseColors.textInverse} />
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => setCreating(true)} style={styles.newPlaylist}>
              <View style={styles.newIcon}>
                <Ionicons name="add" size={22} color={BaseColors.text2} />
              </View>
              <Text style={styles.newText}>New Playlist</Text>
            </Pressable>
          )}

          <ScrollView style={{ maxHeight: 300 }} bounces={false}>
            {playlists.map(p => (
              <Pressable
                key={p.id}
                style={styles.playlistRow}
                onPress={() => {
                  if (track) {
                    addToPlaylist(p.id, track);
                    haptics.medium();
                  }
                  onClose();
                }}
              >
                <View style={styles.thumb}>
                  <Ionicons name="musical-notes" size={18} color={BaseColors.text3} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.playlistName}>{p.name}</Text>
                  <Text style={styles.playlistMeta}>{(p.tracks ?? []).length} songs</Text>
                </View>
                <Ionicons name="add-circle-outline" size={20} color={BaseColors.text2} />
              </Pressable>
            ))}
          </ScrollView>

          <Pressable onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
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
  sheet: {
    backgroundColor: BaseColors.bg2,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    padding: S.lg,
    paddingBottom: 36,
    gap: S.md,
  },
  heading: { ...Type.h1, color: BaseColors.text1 },
  createRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: hexToRgba(BaseColors.bg3, 0.6),
    borderRadius: R.md,
    paddingHorizontal: S.md,
    color: BaseColors.text1,
  },
  createBtn: {
    width: 44,
    height: 44,
    borderRadius: R.md,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newPlaylist: { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingVertical: S.sm },
  newIcon: {
    width: 44,
    height: 44,
    borderRadius: R.sm,
    backgroundColor: BaseColors.bg3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newText: { ...Type.body, color: BaseColors.text1, fontWeight: '600' },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingVertical: S.sm,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: R.sm,
    backgroundColor: BaseColors.bg1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistName: { ...Type.body, color: BaseColors.text1, fontWeight: '600' },
  playlistMeta: { ...Type.sm, color: BaseColors.text3 },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: S.md,
    borderRadius: R.md,
    backgroundColor: hexToRgba(BaseColors.text1, 0.06),
  },
  cancelText: { ...Type.h3, color: BaseColors.text2 },
});

export default AddToPlaylistModal;