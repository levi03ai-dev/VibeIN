import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { BaseColors, hexToRgba } from '../theme/colors';
import { Type } from '../theme/typography';
import { S, R } from '../theme/spacing';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import SongRow from '../components/cards/SongRow';
import EmptyState from '../components/ui/EmptyState';
import type { VibeTrack } from '../types';

const PlaylistScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const playlist = route.params?.playlist;
  const playQueue = usePlayerStore(s => s.playQueue);
  const playTrack = usePlayerStore(s => s.playTrack);
  const removeFromPlaylist = useLibraryStore(s => s.removeFromPlaylist);
  const renamePlaylist = useLibraryStore(s => s.renamePlaylist);
  const deletePlaylist = useLibraryStore(s => s.deletePlaylist);
  const playlists = useLibraryStore(s => s.playlists);

  const live = playlists.find(p => p.id === playlist?.id) ?? playlist;
  const tracks = live?.tracks ?? [];

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(live?.name ?? '');

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={BaseColors.text1} />
        </Pressable>
        <Text style={styles.headerTitle}>Playlist</Text>
        <Pressable onPress={() => setEditing(true)} style={styles.backBtn}>
          <Ionicons name="create-outline" size={20} color={BaseColors.text1} />
        </Pressable>
      </View>

      {editing ? (
        <View style={styles.editRow}>
          <TextInput
            autoFocus
            value={name}
            onChangeText={setName}
            placeholder="Playlist name"
            placeholderTextColor={BaseColors.text3}
            style={styles.input}
          />
          <Pressable
            onPress={() => {
              if (name.trim()) {
                renamePlaylist(live?.id ?? '', name.trim());
              }
              setEditing(false);
            }}
            style={styles.saveBtn}
          >
            <Ionicons name="checkmark" size={20} color={BaseColors.textInverse} />
          </Pressable>
          <Pressable
            onPress={() => {
              deletePlaylist(live?.id ?? '');
              navigation.goBack();
            }}
            style={styles.deleteBtn}
          >
            <Ionicons name="trash-outline" size={20} color={BaseColors.error} />
          </Pressable>
        </View>
      ) : (
        <View style={styles.hero}>
          {live?.image ? (
            <FastImage source={{ uri: live.image }} style={styles.heroArt} resizeMode="cover" />
          ) : (
            <View style={[styles.heroArt, styles.placeholder]}>
              <Ionicons name="musical-notes" size={40} color={BaseColors.text3} />
            </View>
          )}
          <Text style={styles.name}>{live?.name ?? 'Playlist'}</Text>
          <Text style={styles.meta}>{tracks.length} songs</Text>
        </View>
      )}

      {tracks.length === 0 ? (
        <EmptyState icon="list-outline" title="Empty playlist" subtitle="Add songs from Search or a song menu." />
      ) : (
        <View>
          <Pressable onPress={() => playQueue(tracks, 0)} style={styles.playAll}>
            <View style={styles.playAllIcon}>
              <Ionicons name="play" size={18} color={BaseColors.textInverse} />
            </View>
            <Text style={styles.playAllText}>Play All</Text>
          </Pressable>
          {tracks.map((t: VibeTrack, i: number) => (
            <SongRow
              key={`${t.id}-${i}`}
              title={t.title}
              artist={t.artist}
              image={t.image}
              duration={t.duration}
              onPress={() => playTrack(t)}
              onMenuPress={() => removeFromPlaylist(live?.id ?? '', t.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BaseColors.bg0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.lg,
    paddingTop: 16,
    paddingBottom: S.sm,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: hexToRgba(BaseColors.text1, 0.06) },
  headerTitle: { ...Type.h3, color: BaseColors.text1 },
  hero: { alignItems: 'center', paddingVertical: S.lg, gap: S.sm },
  heroArt: { width: 200, height: 200, borderRadius: 16 },
  placeholder: { backgroundColor: BaseColors.bg2, alignItems: 'center', justifyContent: 'center' },
  name: { ...Type.d2, color: BaseColors.text1, textAlign: 'center' },
  meta: { ...Type.sm, color: BaseColors.text3 },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm, paddingHorizontal: S.lg, paddingVertical: S.md },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: hexToRgba(BaseColors.bg1, 0.9),
    borderRadius: R.md,
    paddingHorizontal: S.md,
    color: BaseColors.text1,
  },
  saveBtn: {
    width: 44,
    height: 44,
    borderRadius: R.md,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: 44,
    height: 44,
    borderRadius: R.md,
    backgroundColor: hexToRgba(BaseColors.error, 0.12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  playAll: { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingHorizontal: S.lg, paddingVertical: S.md },
  playAllIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playAllText: { ...Type.h2, color: BaseColors.text1 },
});

export default PlaylistScreen;