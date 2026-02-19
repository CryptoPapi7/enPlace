/**
 * EnPlace Color System
 * Warm, premium, calm cooking experience
 */

export const colors = {
  // Base - Cream backgrounds (warmer whites)
  cream: {
    50: '#FAFAF7',    // Main app background (was #FFF8E7)
    100: '#F5F4F0',   // Card backgrounds (was #F6EFDD)
    200: '#ECEAE4',   // Subtle sections (was #EDE6D3)
  },

  // Primary - Bronze/taupe accent (was orange)
  primary: {
    400: '#A08B72',   // Hover/secondary (was #FFB37A)
    500: '#8B7355',   // Primary actions (was #FF8C42)
    600: '#74604A',   // Pressed states (was #E6752F)
  },

  // Neutrals - Critical for premium feel
  neutral: {
    900: '#1A1A18',   // Primary text (was #1F1F1F)
    700: '#5A5A55',   // Secondary text (was #4A4A4A)
    500: '#8A8A84',   // Meta text (was #8A8A8A)
    300: '#C8C6C0',   // Disabled (was #C4C4C4)
    200: '#E5E3DD',   // Dividers (was #E6E1D8)
    100: '#F0EEE8',   // Outlined surfaces (was #F1ECE2)
  },

  // Functional
  success: '#5C7A5C',   // Muted green (was #4CAF50)
  error: '#9E4B4B',     // Muted red (was #E5533D)
  warning: '#B8943D',   // Muted yellow (was #F2B705)

  // Pure
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type Colors = typeof colors;