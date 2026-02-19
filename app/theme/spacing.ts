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
  xxl: 48,      // was 40
  xxxl: 64,     // was 48
  section: 80,  // NEW
} as const;

// Common layout values
export const layout = {
  screenGutter: 24,         // was 16 — THE BIG ONE
  cardPadding: 20,          // was 16
  cardPaddingLarge: 24,     // was 20
  sectionGap: 48,           // was 24
  elementGap: 12,           // was 8
  elementGapLarge: 20,      // was 16
} as const;

export type Spacing = typeof spacing;
export type Layout = typeof layout;