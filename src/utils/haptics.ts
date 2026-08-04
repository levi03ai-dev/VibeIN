import ReactNativeHapticFeedback, { HapticFeedbackTypes } from 'react-native-haptic-feedback';

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const haptics = {
  light: () => ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.impactLight, options),
  medium: () => ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.impactMedium, options),
  heavy: () => ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.impactHeavy, options),
  selection: () => ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.selection, options),
  success: () => ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.notificationSuccess, options),
  error: () => ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.notificationError, options),
};
