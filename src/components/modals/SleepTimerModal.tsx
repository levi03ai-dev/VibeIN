import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BaseColors, hexToRgba } from '../../theme/colors';
import { Type } from '../../theme/typography';
import { R, S } from '../../theme/spacing';
import { useSettingsStore } from '../../store/settingsStore';
import TrackPlayer from 'react-native-track-player';
import { haptics } from '../../utils/haptics';
import { formatDuration } from '../../utils/format';

interface SleepTimerModalProps {
  visible: boolean;
  onClose: () => void;
}

const OPTIONS = [5, 10, 15, 30, 45, 60];

const SleepTimerModal: React.FC<SleepTimerModalProps> = ({ visible, onClose }) => {
  const timer = useSettingsStore(s => s.sleepTimer);
  const setTimer = useSettingsStore(s => s.setSleepTimer);

  const select = (minutes: number) => {
    setTimer({ type: 'duration', endAt: Date.now() + minutes * 60 * 1000 });
    haptics.medium();
    onClose();
  };

  const selectEndOfSong = () => {
    setTimer({ type: 'endOfSong' });
    haptics.medium();
    onClose();
  };

  const stop = () => {
    setTimer({ type: 'none' });
    TrackPlayer.pause();
    haptics.light();
    onClose();
  };

  const remaining = timer.type === 'duration' && timer.endAt
    ? Math.max(0, Math.round((timer.endAt - Date.now()) / 1000))
    : null;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.header}>
            <Ionicons name="moon" size={22} color="#FFD740" />
            <Text style={styles.heading}>Sleep Timer</Text>
          </View>

          {remaining !== null && (
            <Text style={styles.activeText}>
              Timer active · {formatDuration(remaining)} remaining
            </Text>
          )}

          <View style={styles.grid}>
            {OPTIONS.map(m => (
              <Pressable key={m} onPress={() => select(m)} style={styles.option}>
                <Text style={styles.optionLabel}>{m} min</Text>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={selectEndOfSong} style={styles.optionRow}>
            <Ionicons name="musical-note" size={20} color={BaseColors.text2} />
            <Text style={styles.optionRowText}>End of current song</Text>
          </Pressable>

          <Pressable onPress={stop} style={styles.optionRow}>
            <Ionicons name="stop-circle-outline" size={20} color={BaseColors.error} />
            <Text style={[styles.optionRowText, { color: BaseColors.error }]}>Stop playback now</Text>
          </Pressable>

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
    justifyContent: 'center',
    alignItems: 'center',
    padding: S.xl,
  },
  sheet: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: BaseColors.bg2,
    borderRadius: R.xl,
    padding: S.xl,
    gap: S.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  heading: { ...Type.h1, color: BaseColors.text1 },
  activeText: { ...Type.body, color: '#FFD740' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: S.sm,
  },
  option: {
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
    borderRadius: R.md,
    backgroundColor: hexToRgba(BaseColors.text1, 0.07),
  },
  optionLabel: { ...Type.h3, color: BaseColors.text1 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingVertical: S.sm,
  },
  optionRowText: { ...Type.body, color: BaseColors.text2 },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: S.md,
    borderRadius: R.md,
    backgroundColor: hexToRgba(BaseColors.text1, 0.06),
  },
  cancelText: { ...Type.h3, color: BaseColors.text2 },
});

export default SleepTimerModal;