/**
 * EnPlace Typography System
 * Custom fonts: Playfair Display (serif) + Inter (sans)
 * Premium, editorial feel
 */

export const fonts = {
  serif: 'PlayfairDisplay-Regular',
  serifBold: 'PlayfairDisplay-Bold',
  sans: 'Inter_18pt-Regular',
  sansMedium: 'Inter_18pt-Medium',
  sansSemiBold: 'Inter_18pt-SemiBold',
} as const;

export const typography = {
  display: {
    fontWeight: '700',
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  h1: {
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  h2: {
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.1,
  },
  h3: {
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
  },
  body: {
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 25,
    letterSpacing: 0,
  },
  bodyMedium: {
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 25,
    letterSpacing: 0,
  },
  caption: {
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  label: {
    fontWeight: '500',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  micro: {
    fontWeight: '400',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
} as const;

export type Typography = typeof typography;