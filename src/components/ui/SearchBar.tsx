import React, { useState, useRef, useEffect } from 'react';
import {
  TextInput,
  Pressable,
  StyleSheet,
  View,
  Text,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BaseColors, hexToRgba } from '../../theme/colors';
import { R, S } from '../../theme/spacing';
import { Springs } from '../../theme/animations';
import { Type } from '../../theme/typography';

interface SearchBarProps {
  value: string;
  onChangeText: (t: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void;
  placeholder?: string;
  style?: ViewStyle;
  inputProps?: TextInputProps;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onFocus,
  onBlur,
  onClear,
  placeholder = 'Search songs, artists, albums…',
  style,
  inputProps,
}) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const cancelWidth = useSharedValue(0);
  const cancelOpacity = useSharedValue(0);

  useEffect(() => {
    cancelWidth.value = withSpring(focused ? 64 : 0, Springs.gentle);
    cancelOpacity.value = withSpring(focused ? 1 : 0, Springs.gentle);
  }, [focused]);

  const cancelStyle = useAnimatedStyle(() => ({
    width: cancelWidth.value,
    opacity: cancelOpacity.value,
  }));

  return (
    <View style={[styles.row, style]}>
      <View style={styles.inputWrap}>
        <Ionicons name="search" size={18} color={BaseColors.text2} />
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          placeholder={placeholder}
          placeholderTextColor={BaseColors.text3}
          style={styles.input}
          {...inputProps}
        />
        {value.length > 0 && (
          <Pressable
            onPress={() => {
              onChangeText('');
              onClear?.();
            }}
            hitSlop={10}
          >
            <Ionicons name="close-circle" size={18} color={BaseColors.text3} />
          </Pressable>
        )}
      </View>
      <Animated.View style={[styles.cancel, cancelStyle]}>
        <Pressable onPress={() => inputRef.current?.blur()} hitSlop={8}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    backgroundColor: hexToRgba(BaseColors.bg1, 0.9),
    borderRadius: R.pill,
    paddingHorizontal: S.lg,
    height: 44,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BaseColors.border,
  },
  input: {
    flex: 1,
    color: BaseColors.text1,
    fontSize: Type.body.fontSize,
    paddingVertical: 0,
  },
  cancel: {
    overflow: 'hidden',
    marginLeft: S.sm,
  },
  cancelText: {
    color: BaseColors.text2,
    fontSize: Type.sm.fontSize,
    fontWeight: '600',
  },
});

export default SearchBar;
