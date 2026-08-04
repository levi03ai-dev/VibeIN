import type { WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

export const Springs = {
  snappy: { damping: 18, stiffness: 280, mass: 1 } as WithSpringConfig,
  gentle: { damping: 20, stiffness: 160, mass: 1 } as WithSpringConfig,
  bouncy: { damping: 12, stiffness: 200, mass: 0.8 } as WithSpringConfig,
  slow: { damping: 25, stiffness: 100, mass: 1 } as WithSpringConfig,
};

export const Timings = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
};