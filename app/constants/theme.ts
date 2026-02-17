/**
 * EnPlace Theme - Global Color Constants
 * Supports multiple themes: default and michelin (fine dining)
 */

import { getThemeColors, ThemeMode } from '../theme';

// These are kept for backwards compatibility
// New code should use useTheme() and getThemeColors() directly
export const Colors = {
  light: {
    text: '#1F1F1F',
    background: '#FFF8E7',
    tint: '#FF8C42',
    icon: '#8A8A8A',
    tabIconDefault: '#8A8A8A',
    tabIconSelected: '#FF8C42',
  },
  dark: {
    text: '#F1F1F1',
    background: '#1F1F1F',
    tint: '#FF8C42',
    icon: '#8A8A8A',
    tabIconDefault: '#8A8A8A',
    tabIconSelected: '#FF8C42',
  },
};

export type ColorTheme = typeof Colors.light;

// Export helper to get colors for a specific theme mode
export { getThemeColors, ThemeMode };
