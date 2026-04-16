/**
 * Spacing scale for MediTrack
 * Based on 4px unit (1 = 4px)
 */

export const Spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
} as const;

/**
 * Border radius scale
 */
export const BorderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  base: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

/**
 * Common spacing combinations for layouts
 */
export const SpacingPresets = {
  // Padding
  paddingXs: Spacing[2],
  paddingSm: Spacing[3],
  paddingMd: Spacing[4],
  paddingLg: Spacing[6],
  paddingXl: Spacing[8],

  // Gap/Margins
  gapXs: Spacing[2],
  gapSm: Spacing[3],
  gapMd: Spacing[4],
  gapLg: Spacing[6],
  gapXl: Spacing[8],

  // Screen padding
  screenPaddingHorizontal: Spacing[4],
  screenPaddingVertical: Spacing[6],

  // Component sizes
  buttonHeight: 44,
  buttonHeightSmall: 36,
  inputHeight: 44,
  touchableMinHeight: 48,
} as const;

export type SpacingKey = keyof typeof Spacing;
export type BorderRadiusKey = keyof typeof BorderRadius;
