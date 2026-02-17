/**
 * EnPlace Theme
 * Unified design system with multi-theme support
 */

export { colors } from './colors';
export { spacing, layout } from './spacing';
export { typography } from './typography';
export { shadows } from './shadows';
export {
  defaultTheme,
  michelinTheme,
  getThemeColors,
  getNavigationTheme,
} from './unified';
export type { UnifiedColors, ThemeMode } from './unified';

// Re-export for convenience
export * from './colors';
export * from './spacing';
export * from './typography';
export * from './shadows';