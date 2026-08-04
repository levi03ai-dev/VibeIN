import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BaseColors, hexToRgba } from '../theme/colors';
import { Type } from '../theme/typography';
import { S, R } from '../theme/spacing';
import { useSettingsStore } from '../store/settingsStore';
import { useListenHistoryStore } from '../store/listenHistoryStore';
import { usePlayerStore } from '../store/playerStore';
import SleepTimerModal from '../components/modals/SleepTimerModal';
import EqualizerModal from '../components/modals/EqualizerModal';
import { isEqAvailable } from '../native/EqualizerModule';

const SettingsScreen: React.FC = () => {
  const quality = useSettingsStore(s => s.quality);
  const setQuality = useSettingsStore(s => s.setQuality);
  const showDynamicColors = useSettingsStore(s => s.showDynamicColors);
  const setShowDynamicColors = useSettingsStore(s => s.setShowDynamicColors);
  const clearHistory = useListenHistoryStore(s => s.clear);
  const updatePalette = usePlayerStore(s => s.updatePalette);

  const [showTimer, setShowTimer] = useState(false);
  const [showEq, setShowEq] = useState(false);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Settings</Text>

      <Section title="PLAYBACK">
        <SettingRow
          icon="options-outline"
          label="Equalizer"
          caption={isEqAvailable ? '5-band equalizer' : 'Not available'}
          onPress={() => setShowEq(true)}
        />
        <SettingRow icon="moon-outline" label="Sleep Timer" caption="Auto-pause playback" onPress={() => setShowTimer(true)} />
        <View style={styles.row}>
          <Icon name="library-outline" />
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Audio Quality</Text>
            <Text style={styles.rowCaption}>Higher quality uses more data</Text>
          </View>
          <View style={styles.segment}>
            {(['high', 'medium', 'low'] as const).map(q => (
              <Pressable key={q} onPress={() => setQuality(q)} style={[styles.segBtn, quality === q && styles.segActive]}>
                <Text style={[styles.segText, quality === q && styles.segTextActive]}>{q === 'high' ? 'High' : q === 'medium' ? 'Med' : 'Low'}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Section>

      <Section title="APPEARANCE">
        <View style={styles.row}>
          <Icon name="color-palette-outline" />
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Dynamic Colors</Text>
            <Text style={styles.rowCaption}>Theme from album artwork</Text>
          </View>
          <Switch
            value={showDynamicColors}
            onValueChange={async v => {
              setShowDynamicColors(v);
              if (!v) await updatePalette(undefined);
            }}
            thumbColor={showDynamicColors ? '#0A0A0A' : '#9E9E9E'}
            trackColor={{ false: '#333', true: '#FFFFFF' }}
          />
        </View>
      </Section>

      <Section title="DATA">
        <Row icon="time-outline" label="Clear Play History" danger onPress={clearHistory} />
      </Section>

      <Section title="ABOUT">
        <Row icon="information-circle-outline" label="Vibe" caption="v1.0.0 · Free music player" />
        <Row icon="git-branch-outline" label="Open Source" caption="MIT License" />
      </Section>

      <SleepTimerModal visible={showTimer} onClose={() => setShowTimer(false)} />
      <EqualizerModal visible={showEq} onClose={() => setShowEq(false)} />
    </View>
  );
};

const Icon: React.FC<{ name: string }> = ({ name }) => (
  <View style={styles.iconWrap}>
    <Ionicons name={name} size={20} color={BaseColors.text1} />
  </View>
);

const SettingRow: React.FC<{ icon: string; label: string; caption?: string; onPress?: () => void; accent?: string; danger?: boolean }> = ({ icon, label, caption, onPress, accent, danger }) => (
  <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
    <View style={[styles.iconWrap, accent && { borderColor: hexToRgba(accent, 0.5) }]}>
      <Ionicons name={icon} size={20} color={danger ? BaseColors.error : accent ?? BaseColors.text1} />
    </View>
    <View style={styles.rowText}>
      <Text style={[styles.rowLabel, danger && { color: BaseColors.error }]}>{label}</Text>
      {caption ? <Text style={styles.rowCaption}>{caption}</Text> : null}
    </View>
    {onPress ? <Ionicons name="chevron-forward" size={18} color={BaseColors.text3} /> : null}
  </Pressable>
);

const Row: React.FC<{ icon?: string; label: string; caption?: string; onPress?: () => void; danger?: boolean }> = ({ icon, label, caption, onPress, danger }) => (
  <SettingRow icon={icon ?? 'ellipse-outline'} label={label} caption={caption} onPress={onPress} danger={danger} />
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BaseColors.bg0, paddingHorizontal: S.lg, paddingTop: 16 },
  title: { ...Type.d2, color: BaseColors.text1, marginBottom: S.lg },
  section: { marginBottom: S.xxl },
  sectionTitle: { ...Type.label, color: BaseColors.text3, marginBottom: S.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingVertical: S.md },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: R.sm,
    backgroundColor: hexToRgba(BaseColors.text1, 0.06),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { ...Type.body, color: BaseColors.text1, fontWeight: '600' },
  rowCaption: { ...Type.sm, color: BaseColors.text3 },
  segment: { flexDirection: 'row', borderRadius: 8, backgroundColor: hexToRgba(BaseColors.text1, 0.06) },
  segBtn: { paddingHorizontal: S.sm, paddingVertical: 6, borderRadius: 6 },
  segActive: { backgroundColor: '#FFFFFF' },
  segText: { ...Type.sm, color: BaseColors.text2, fontWeight: '600' },
  segTextActive: { color: BaseColors.textInverse },
});

export default SettingsScreen;