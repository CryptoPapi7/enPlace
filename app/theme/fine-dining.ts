/**
 * Michelin Theme — Fine Dining Aesthetic
 * White tablecloth. French cuisine. Michelin star.
 * For the discerning palate.
 */

export const fineDiningColors = {
  // The foundation — deep, moody, intimate
  background: {
    primary: '#1A1A1F',      // Charcoal — like a dimly lit dining room
    secondary: '#25252C',    // Slightly lighter for cards
    tertiary: '#2D2D36',     // Elevated surfaces
  },

  // The tablecloth — crisp, clean, premium
  cream: {
    50: '#FAF9F6',   // Starched white tablecloth
    100: '#F5F3EE',  // Candlelight on linen
    200: '#E8E4DC',  // Shadowed folds
  },

  // The wine — deep burgundy, bordeaux, sophistication
  primary: {
    400: '#B8545F',  // Rose gold undertone
    500: '#8B2635',  // Classic burgundy — the star
    600: '#6B1A26',  // Deep wine, pressed velvet
    700: '#4A1219',  // Almost black-red
  },

  // Gold accents — flatware, candle holders, Michelin stars
  gold: {
    300: '#D4AF37',  // Bright gold
    400: '#C5A028',  // Satin brass
    500: '#B8941F',  // Antiqued gold
    600: '#8B6914',  // Bronze
  },

  // Neutrals — like a well-set table
  neutral: {
    900: '#FFFFFF',  // Sharp white text
    700: '#C9C5BD',  // Soft silver
    500: '#8A8680',  // Polished pewter
    300: '#4A4844',  // Graphite
    200: '#2E2C2A',  // Dark wood
    100: '#1A1918',  // Near black
  },

  // Functional
  success: '#2D5A3D',  // Forest green — herbs, freshness
  error: '#9B2C2C',    // Deeper red for errors
  warning: '#B8860B',  // Old gold

  // Pure
  white: '#FAF9F6',
  black: '#0D0D0F',
} as const;

export type FineDiningColors = typeof fineDiningColors;
