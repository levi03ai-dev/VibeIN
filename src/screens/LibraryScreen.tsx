import React, { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, Pressable, FlatList, ScrollView, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BaseColors, hexToRgba } from '../theme/colors';
import { Type } from '../theme/typography';
import { S, R } from '../theme/spacing';
import { useLibraryStore } from '../store/libraryStore';
import { useListenHistoryStore } from '../store/listenHistoryStore';
import { usePlayerStore } from '../store/playerStore';
import TabPills from '../components/ui/TabPills';
import SongRow from '../components/cards/SongRow';
import PlaylistCard from '../components/cards/PlaylistCard';
import EmptyState from '../components/ui/EmptyState';
import SongMenuModal from '../components/modals/SongMenuModal';
import AddToPlaylistModal from '../components/modals/AddToPlaylistModal';
import type { VibeTrack } from '../types';

type TabKey = 'favorites' | 'history' | 'playlists';

const LibraryScreen: React.FC = () => {
  const navigation = useNavigation();
  const favorites = useLibraryStore(s => s.favorites);
  const history = useListenHistoryStore(s => s.history);
  const playlists = useLibraryStore(s => s.playlists);
  const createPlaylist = useLibraryStore(s => s.createPlaylist);
  const playTrack = usePlayerStore(s => s.playTrack);
  const currentTrack = usePlayerStore(s => s.currentTrack);

  const [tab, setTab] = useState<TabKey>('favorites');
  const [menuTrack, setMenuTrack] = useState<VibeTrack | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const groupedHistory = useMemo(() => {
    const groups: { title: string; items: VibeTrack[] }[] = [];
    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = today - 86400000;
    const week = today - 7 * 86400000;
    const buckets: Record<string, VibeTrack[]> = {};
    for (const t of history) {
      const time = t as any as { addedAt?: number };
      const ts = time.addedAt ?? Date.now();
      let key = 'Earlier';
      if (ts >= today) key = 'Today';
      else if (ts >= yesterday) key = 'Yesterday';
      else if (ts >= week) key = 'This week';
      (buckets[key] = buckets[key] || []).push(t);
    }
    const order = ['Today', 'Yesterday', 'This week', 'Earlier'];
    for (const key of order) {
      if (buckets[key]?.length) groups.push({ title: key, items: buckets[key] });
    }
    return groups;
  }, [history]);

  const pills = [
    { key: 'favorites', label: 'Favorites' },
    { key: 'history', label: 'History' },
    { key: 'playlists', label: 'Playlists' },
  ];

  const handleCreate = () => {
    if (newName.trim()) {
      createPlaylist(newName.trim());
      setNewName('');
      setCreating(false);
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Library</Text>

      <TabPills pills={pills} activeKey={tab} onChange={k => setTab(k as TabKey)} />

      {tab === 'favorites' && (
        favorites.length === 0 ? (
          <EmptyState
            icon="heart-outline"
            title="No favorites yet"
            subtitle="Tap the heart on any song to save it here."
          />
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={t => t.id}
            renderItem={({ item }) => (
              <SongRow
                title={item.title}
                artist={item.artist}
                image={item.image}
                duration={item.duration}
                playing={currentTrack?.id === item.id}
                onPress={() => playTrack(item)}
                onMenuPress={() => {
                  setMenuTrack(item);
                  setShowMenu(true);
                }}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flat}
          />
        )
      )}

      {tab === 'history' && (
        history.length === 0 ? (
          <EmptyState icon="time-outline" title="No play history" subtitle="Songs you play will appear here." />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.flat}>
            {groupedHistory.map(group => (
              <View key={group.title}>
                <Text style={styles.groupTitle}>{group.title}</Text>
                {group.items.map((item, i) => (
                  <SongRow
                    key={`${item.id}-${i}`}
                    title={item.title}
                    artist={item.artist}
                    image={item.image}
                    duration={item.duration}
                    onPress={() => playTrack(item)}
                    onMenuPress={() => {
                      setMenuTrack(item);
                      setShowMenu(true);
                    }}
                  />
                ))}
              </View>
            ))}
          </ScrollView>
        )
      )}

      {tab === 'playlists' && (
        <View style={styles.playlistContent}>
          {creating ? (
            <View style={styles.createRow}>
              <TextInput
                autoFocus
                value={newName}
                onChangeText={setNewName}
                onSubmitEditing={handleCreate}
                placeholder="Playlist name"
                placeholderTextColor={BaseColors.text3}
                style={styles.createInput}
              />
              <Pressable onPress={handleCreate} style={styles.createBtn}>
                <Ionicons name="checkmark" size={20} color={BaseColors.textInverse} />
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.newPlaylist} onPress={() => setCreating(true)}>
              <View style={styles.newIcon}>
                <Ionicons name="add" size={26} color={BaseColors.text3} />
              </View>
              <Text style={styles.newText}>New Playlist</Text>
            </Pressable>
          )}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.playlistRow}>
            {playlists.map(p => (
              <PlaylistCard
                key={p.id}
                name={p.name}
                count={(p.tracks ?? []).length}
                onPress={() => (navigation as any).navigate('Playlist', { playlist: p })}
                onLongPress={() => {}}
              />
            ))}
          </ScrollView>

          {playlists.length === 0 && !creating && (
            <EmptyState icon="list-outline" title="No playlists yet" subtitle="Create your first playlist." />
          )}
        </View>
      )}

      <SongMenuModal
        visible={showMenu}
        track={menuTrack}
        onClose={() => setShowMenu(false)}
        onAddToPlaylist={() => {
          setShowMenu(false);
          setShowAddToPlaylist(true);
        }}
      />
      <AddToPlaylistModal visible={showAddToPlaylist} track={menuTrack} onClose={() => setShowAddToPlaylist(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BaseColors.bg0, paddingHorizontal: S.lg, paddingTop: 16 },
  title: { ...Type.d2, color: BaseColors.text1, marginBottom: S.lg },
  flat: { paddingBottom: 120 },
  groupTitle: { ...Type.label, color: BaseColors.text3, marginTop: S.lg, marginBottom: S.sm },
  playlistContent: { flex: 1, paddingTop: S.lg },
  newPlaylist: { alignItems: 'center', gap: S.sm, marginBottom: S.lg },
  newIcon: {
    width: 120,
    height: 120,
    borderRadius: R.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: BaseColors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newText: { ...Type.body, color: BaseColors.text2 },
  playlistRow: { paddingRight: S.lg },
  createRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginBottom: S.lg },
  createInput: {
    flex: 1,
    height: 44,
    backgroundColor: hexToRgba(BaseColors.bg1, 0.9),
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
});

export default LibraryScreen;