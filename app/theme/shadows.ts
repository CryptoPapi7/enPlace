/**
 * EnPlace Shadows / Elevation
 * Subtle, premium feel
 * Only on cards and floating elements
 */

export const shadows = {
  // Small - cards, buttons
  sm: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  // Medium - elevated cards, modals
  md: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  // Large - floating elements, sheets
  lg: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
} as const;

export type Shadows = typeof shadows;