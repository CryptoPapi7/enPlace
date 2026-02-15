/**
 * EnPlace Theme - Global Color Constants
 * Warm, premium, calm cooking experience
 */

import { colors } from '../theme/colors';

export const Colors = {
  light: {
    text: colors.neutral[900],
    background: colors.cream[50],
    tint: colors.primary[500],
    icon: colors.neutral[500],
    tabIconDefault: colors.neutral[500],
    tabIconSelected: colors.primary[500],
  },
  dark: {
    text: colors.neutral[100],
    background: colors.neutral[900],
    tint: colors.primary[500],
    icon: colors.neutral[500],
    tabIconDefault: colors.neutral[500],
    tabIconSelected: colors.primary[500],
  },
};

export type ColorTheme = typeof Colors.light;
