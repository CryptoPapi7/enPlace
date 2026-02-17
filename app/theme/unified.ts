/**
 * Unified Theme System for EnPlace
 * Supports multiple named themes with consistent structure
 */

import { colors as defaultColors } from './colors';
import { fineDiningColors } from './fine-dining';

export type ThemeMode = 'default' | 'michelin';

/**
 * Unified color structure that both themes conform to
 * This ensures any theme can be swapped in without breaking components
 */
export interface UnifiedColors {
  cream: {
    50: string;
    100: string;
    200: string;
  };
  primary: {
    400: string;
    500: string;
    600: string;
    700?: string;
  };
  neutral: {
    900: string;
    700: string;
    500: string;
    300: string;
    200: string;
    100: string;
  };
  success: string;
  error: string;
  warning: string;
  white: string;
  black: string;
  // Optional accent colors for special themes
  gold?: {
    300: string;
    400: string;
    500: string;
    600: string;
  };
  background?: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
}

/**
 * Default theme — warm, premium, calm cooking experience
 * Cream backgrounds with orange accents
 */
export const defaultTheme: UnifiedColors = {
  cream: defaultColors.cream,
  primary: defaultColors.primary,
  neutral: defaultColors.neutral,
  success: defaultColors.success,
  error: defaultColors.error,
  warning: defaultColors.warning,
  white: defaultColors.white,
  black: defaultColors.black,
};

/**
 * Michelin Star theme — fine dining aesthetic
 * White tablecloth, French cuisine, wine reds and gold accents
 */
export const michelinTheme: UnifiedColors = {
  // Cream becomes the "tablecloth" — crisp white
  cream: fineDiningColors.cream,
  // Primary becomes wine/burgundy
  primary: fineDiningColors.primary,
  // Neutrals inverted for dark elegance
  neutral: fineDiningColors.neutral,
  // Functional colors adapted for dark theme
  success: fineDiningColors.success,
  error: fineDiningColors.error,
  warning: fineDiningColors.warning,
  white: fineDiningColors.white,
  black: fineDiningColors.black,
  // Special accent
  gold: fineDiningColors.gold,
  // Background colors for dark theme
  background: fineDiningColors.background,
};

/**
 * Get theme colors by mode
 */
export function getThemeColors(mode: ThemeMode): UnifiedColors {
  switch (mode) {
    case 'michelin':
      return michelinTheme;
    case 'default':
    default:
      return defaultTheme;
  }
}

/**
 * Navigation theme colors for React Navigation
 */
export function getNavigationTheme(mode: ThemeMode) {
  const colors = getThemeColors(mode);
  const isMichelin = mode === 'michelin';

  return {
    dark: isMichelin,
    colors: {
      primary: colors.primary[500],
      background: isMichelin ? colors.background!.primary : colors.cream[50],
      card: isMichelin ? colors.background!.secondary : '#FFF',
      text: colors.neutral[900],
      border: colors.primary[500],
      notification: colors.primary[500],
    },
    fonts: {
      regular: {
        fontFamily: 'System',
        fontWeight: '400' as const,
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500' as const,
      },
      bold: {
        fontFamily: 'System',
        fontWeight: '700' as const,
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: '900' as const,
      },
    },
  };
}
