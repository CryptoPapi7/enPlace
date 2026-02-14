/**
 * EnPlace Spacing System
 * 8px grid for consistent rhythm
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
} as const;

// Common layout values
export const layout = {
  screenGutter: spacing.md,      // 16
  cardPadding: spacing.md,       // 16
  cardPaddingLarge: 20,          // 20
  sectionGap: spacing.lg,        // 24
  elementGap: spacing.sm,        // 8
  elementGapLarge: spacing.md,   // 16
} as const;

export type Spacing = typeof spacing;
export type Layout = typeof layout;