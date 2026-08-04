import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayer } from '../../hooks/usePlayer';
import { usePlayerStore } from '../../store/playerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useLibraryStore } from '../../store/libraryStore';
import { useRecommendations } from '../../hooks/useRecommendations';
import MiniPlayer from './MiniPlayer';
import NowPlayingSheet from './NowPlayingSheet';
import type { VibeTrack } from '../../types';

const PlayerBar: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    accentColor,
    togglePlay,
    skipNext,
    skipPrevious,
    seekTo,
    toggleShuffle,
    cycleRepeat,
    queue,
  } = usePlayer();
  const shuffleEnabled = usePlayerStore(s => s.shuffleEnabled);
  const repeatMode = usePlayerStore(s => s.repeatMode);
  const palette = usePlayerStore(s => s.palette);
  const volume = useSettingsStore(s => s.volume);
  const setVolume = useSettingsStore(s => s.setVolume);
  const favorites = useLibraryStore(s => s.favorites);
  const toggleFavorite = useLibraryStore(s => s.toggleFavorite);
  const [sheetVisible, setSheetVisible] = useState(false);
  const { similar } = useRecommendations(currentTrack);

  if (!currentTrack) return null;

  const isFavorite = favorites.some(t => t.id === currentTrack.id);

  return (
    <View
      style={[
        styles.container,
        {
          bottom: insets.bottom + 64,
          position: 'absolute',
          left: 0,
          right: 0,
        },
      ]}
      pointerEvents="box-none"
    >
      <MiniPlayer
        track={currentTrack}
        isPlaying={isPlaying}
        position={position}
        duration={duration}
        accent={accentColor}
        isFavorite={isFavorite}
        onPress={() => setSheetVisible(true)}
        onTogglePlay={togglePlay}
        onNext={skipNext}
        onPrevious={skipPrevious}
        onToggleFavorite={() => toggleFavorite(currentTrack)}
      />
      <NowPlayingSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        track={currentTrack}
        isPlaying={isPlaying}
        position={position}
        duration={duration}
        accent={accentColor}
        paletteBg={palette.background}
        shuffleEnabled={shuffleEnabled}
        repeatMode={repeatMode}
        isFavorite={isFavorite}
        onTogglePlay={togglePlay}
        onNext={skipNext}
        onPrevious={skipPrevious}
        onSeek={seekTo}
        onToggleShuffle={toggleShuffle}
        onCycleRepeat={cycleRepeat}
        onToggleFavorite={() => toggleFavorite(currentTrack)}
        onChangeVolume={setVolume}
        volume={volume}
        onQueuePlay={(t: VibeTrack) => {
          usePlayerStore.getState().playTrack(t, queue);
        }}
        queue={queue}
        related={similar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 50,
    elevation: 50,
  },
});

export default PlayerBar;