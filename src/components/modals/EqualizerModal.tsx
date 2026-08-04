import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Slider from './Slider';
import { BaseColors, hexToRgba } from '../../theme/colors';
import { Type } from '../../theme/typography';
import { R, S } from '../../theme/spacing';
import { useSettingsStore } from '../../store/settingsStore';
import { eq, EQ_PRESETS, isEqAvailable } from '../../native/EqualizerModule';
import { haptics } from '../../utils/haptics';
import { isAndroid } from '../../utils/platform';

interface EqualizerModalProps {
  visible: boolean;
  onClose: () => void;
}

const NUM_BANDS = 5;
const BAND_NAMES = ['60 Hz', '230 Hz', '910 Hz', '3.6 kHz', '14 kHz'];
const LEVEL_RANGE = 1500;

const EqualizerModal: React.FC<EqualizerModalProps> = ({ visible, onClose }) => {
  const eqEnabled = useSettingsStore(s => s.eqEnabled);
  const setEqEnabled = useSettingsStore(s => s.setEqEnabled);
  const eqBands = useSettingsStore(s => s.eqBands);
  const setEqBands = useSettingsStore(s => s.setEqBands);
  const eqPreset = useSettingsStore(s => s.eqPreset);
  const setEqPreset = useSettingsStore(s => s.setEqPreset);
  const [ready, setReady] = useState(false);
  const [presets, setPresets] = useState<string[]>(EQ_PRESETS);

  useEffect(() => {
    if (visible && isAndroid) {
      eq.init().then(() => {
        setReady(true);
        eq.getPresets().then(p => {
          if (p && p.length) setPresets(p);
        });
        if (eqEnabled) eq.enabled(true);
      });
    }
  }, [visible]);

  const toggle = async () => {
    haptics.medium();
    const next = !eqEnabled;
    setEqEnabled(next);
    if (isAndroid) await eq.enabled(next);
    if (next) await eq.setBands(eqBands);
  };

  const setBand = async (index: number, millibels: number) => {
    const next = [...eqBands];
    next[index] = millibels;
    setEqBands(next);
    if (isAndroid) await eq.setBandLevel(index, millibels);
  };

  const applyPreset = async (index: number) => {
    haptics.selection();
    setEqPreset(index);
    if (isAndroid && index > 0) {
      await eq.usePreset(index);
      const bands = await Promise.all(
        Array.from({ length: NUM_BANDS }, (_, i) => eq.getBandLevel(i)),
      );
      setEqBands(bands);
    }
  };

  const reset = async () => {
    haptics.light();
    setEqPreset(0);
    const flat = Array(NUM_BANDS).fill(0);
    setEqBands(flat);
    if (isAndroid) await eq.setBands(flat);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.header}>
            <Ionicons name="options" size={22} color={BaseColors.text1} />
            <Text style={styles.heading}>Equalizer</Text>
          </View>

          {!isEqAvailable || !isAndroid ? (
            <Text style={styles.unavailable}>
              Equalizer requires the Android native module.
            </Text>
          ) : (
            <>
              <Pressable onPress={toggle} style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Enabled</Text>
                <View style={[styles.switch, eqEnabled && styles.switchOn]}>
                  <View style={[styles.knob, eqEnabled && styles.knobOn]} />
                </View>
              </Pressable>

              <View style={styles.bands}>
                {BAND_NAMES.map((name, i) => (
                  <View key={name} style={styles.band}>
                    <Text style={styles.bandName}>{name}</Text>
                    <Slider
                      min={-LEVEL_RANGE}
                      max={LEVEL_RANGE}
                      value={eqBands[i] ?? 0}
                      onValueChange={v => setBand(i, v)}
                      height={120}
                      vertical
                    />
                    <Text style={styles.bandLevel}>{((eqBands[i] ?? 0) / 100).toFixed(1)} dB</Text>
                  </View>
                ))}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {presets.map((p, i) => (
                  <Pressable
                    key={p}
                    onPress={() => applyPreset(i)}
                    style={[styles.preset, eqPreset === i && styles.presetActive]}
                  >
                    <Text style={[styles.presetText, eqPreset === i && styles.presetTextActive]}>{p}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Pressable onPress={reset} style={styles.resetBtn}>
                <Text style={styles.resetText}>Reset to Flat</Text>
              </Pressable>
            </>
          )}

          <Pressable onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Done</Text>
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
    padding: S.lg,
  },
  sheet: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: BaseColors.bg2,
    borderRadius: R.xl,
    padding: S.xl,
    gap: S.lg,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  heading: { ...Type.h1, color: BaseColors.text1 },
  unavailable: { ...Type.body, color: BaseColors.text2 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLabel: { ...Type.h3, color: BaseColors.text1 },
  switch: {
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: hexToRgba(BaseColors.text1, 0.15),
    padding: 3,
  },
  switchOn: { backgroundColor: '#FFFFFF' },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: BaseColors.text2,
  },
  knobOn: { backgroundColor: BaseColors.textInverse, alignSelf: 'flex-end' },
  bands: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 170,
  },
  band: { alignItems: 'center', flex: 1, gap: S.xs },
  bandName: { ...Type.xs, color: BaseColors.text3 },
  bandLevel: { ...Type.xs, color: BaseColors.text2, fontVariant: ['tabular-nums'] },
  preset: {
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
    borderRadius: R.pill,
    backgroundColor: hexToRgba(BaseColors.text1, 0.07),
    marginRight: S.sm,
  },
  presetActive: { backgroundColor: '#FFFFFF' },
  presetText: { ...Type.sm, color: BaseColors.text2, fontWeight: '600' },
  presetTextActive: { color: BaseColors.textInverse },
  resetBtn: { alignItems: 'center', paddingVertical: S.sm },
  resetText: { ...Type.h3, color: BaseColors.text2 },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: S.md,
    borderRadius: R.md,
    backgroundColor: hexToRgba(BaseColors.text1, 0.06),
  },
  cancelText: { ...Type.h3, color: BaseColors.text2 },
});

export default EqualizerModal;
