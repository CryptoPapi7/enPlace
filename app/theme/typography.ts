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
  mono: 'JetBrainsMono-Regular',
} as const;

export const typography = {
  display: {
    fontFamily: fonts.serifBold,
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  h1: {
    fontFamily: fonts.serifBold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.1,
  },
  h3: {
    fontFamily: fonts.sansMedium,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 25,
    letterSpacing: 0,
  },
  bodyMedium: {
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    lineHeight: 25,
    letterSpacing: 0,
  },
  caption: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  micro: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
  mono: {
    fontFamily: fonts.mono,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
} as const;

export type Typography = typeof typography;