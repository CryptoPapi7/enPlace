/**
 * EnPlace Color System
 * Warm, premium, calm cooking experience
 */

export const colors = {
  // Base - Cream backgrounds
  cream: {
    50: '#FFF8E7',   // Main app background
    100: '#F6EFDD',  // Card backgrounds
    200: '#EDE6D3',  // Subtle sections
  },

  // Primary - Orange accent (softened)
  primary: {
    400: '#FFB37A',  // Hover/secondary
    500: '#FF8C42',  // Primary actions
    600: '#E6752F',  // Pressed states
  },

  // Neutrals - Critical for premium feel
  neutral: {
    900: '#1F1F1F',  // Primary text
    700: '#4A4A4A',  // Secondary text
    500: '#8A8A8A',  // Meta text
    300: '#C4C4C4',  // Disabled
    200: '#E6E1D8',  // Dividers
    100: '#F1ECE2',  // Outlined surfaces
  },

  // Functional
  success: '#4CAF50',
  error: '#E5533D',
  warning: '#F2B705',

  // Pure
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type Colors = typeof colors;