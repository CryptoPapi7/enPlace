// Flexible unit conversion system
// Users can set preferences per category rather than just metric/imperial

type UnitSystem = 'metric' | 'imperial';
type MeasurementType = 'weight' | 'volume' | 'count';

interface UnitPreference {
  dryGoods: 'grams' | 'cups' | 'oz';      // flour, sugar, etc
  liquids: 'ml' | 'cups' | 'fl_oz';        // water, milk, oil
  smallAmounts: 'tsp' | 'grams' | 'ml';    // spices, baking powder
  fats: 'grams' | 'tbs' | 'cups';          // butter, oil
  produce: 'grams' | 'count' | 'cups';     // onions, potatoes
}

interface Conversion {
  toBase: (val: number) => number;  // convert to grams or ml
  fromBase: (val: number) => number; // convert from grams or ml
  display: string;
}

// Base units: grams for weight, ml for volume
const CONVERSIONS: Record<string, Conversion> = {
  // Weight
  g: { toBase: v => v, fromBase: v => v, display: 'g' },
  grams: { toBase: v => v, fromBase: v => v, display: 'g' },
  kg: { toBase: v => v * 1000, fromBase: v => v / 1000, display: 'kg' },
  oz: { toBase: v => v * 28.35, fromBase: v => v / 28.35, display: 'oz' },
  lb: { toBase: v => v * 453.59, fromBase: v => v / 453.59, display: 'lb' },
  lbs: { toBase: v => v * 453.59, fromBase: v => v / 453.59, display: 'lb' },
  
  // Volume
  ml: { toBase: v => v, fromBase: v => v, display: 'ml' },
  l: { toBase: v => v * 1000, fromBase: v => v / 1000, display: 'L' },
  tsp: { toBase: v => v * 4.93, fromBase: v => v / 4.93, display: 'tsp' },
  tbs: { toBase: v => v * 14.79, fromBase: v => v / 14.79, display: 'tbs' },
  tbsp: { toBase: v => v * 14.79, fromBase: v => v / 14.79, display: 'tbs' },
  cup: { toBase: v => v * 236.59, fromBase: v => v / 236.59, display: 'cup' },
  cups: { toBase: v => v * 236.59, fromBase: v => v / 236.59, display: 'cups' },
  floz: { toBase: v => v * 29.57, fromBase: v => v / 29.57, display: 'fl oz' },
  pint: { toBase: v => v * 473.18, fromBase: v => v / 473.18, display: 'pint' },
  quart: { toBase: v => v * 946.35, fromBase: v => v / 946.35, display: 'quart' },
};

// Ingredient density for weight <-> volume conversion (g per cup)
const DENSITIES: Record<string, number> = {
  // Flours
  'all-purpose flour': 120,
  'flour': 120,
  'bread flour': 127,
  'cake flour': 114,
  
  // Sugars
  'granulated sugar': 200,
  'sugar': 200,
  'brown sugar': 213,
  'powdered sugar': 125,
  
  // Fats
  'butter': 227,
  'ghee': 216,
  'oil': 218,
  'vegetable oil': 218,
  'olive oil': 216,
  
  // Liquids
  'water': 236,
  'milk': 244,
  'coconut milk': 241,
  
  // Other
  'rice': 185,
  'salt': 273,
  'baking powder': 192,
  'baking soda': 272,
};

// Default user preferences
export const DEFAULT_PREFERENCES: UnitPreference = {
  dryGoods: 'grams',      // Weight is more accurate for baking
  liquids: 'ml',          // Metric for liquids
  smallAmounts: 'tsp',    // Spoons are practical for small amounts
  fats: 'grams',          // Weight for butter consistency
  produce: 'count',       // "1 onion" is clearer than "150g"
};

// Parse an amount string into value and unit
export function parseAmount(amountStr: string): { value: number; unit: string; original: string } {
  // Handle "to taste", "as needed", etc.
  if (/to taste|as needed|for garnish|optional/i.test(amountStr)) {
    return { value: 0, unit: '', original: amountStr };
  }
  
  // Extract number and unit
  const match = amountStr.match(/^([\d./]+)\s*(-?\s*[\d./]+)?\s*(.+)?$/);
  if (!match) {
    // Try to find any number in the string
    const numMatch = amountStr.match(/([\d.]+)/);
    if (numMatch) {
      return { 
        value: parseFloat(numMatch[1]), 
        unit: amountStr.replace(numMatch[1], '').trim(),
        original: amountStr 
      };
    }
    return { value: 0, unit: '', original: amountStr };
  }
  
  // Parse the number (handle fractions)
  let value: number;
  const mainNum = match[1];
  const fractionPart = match[2];
  
  if (mainNum.includes('/')) {
    const [num, den] = mainNum.split('/').map(Number);
    value = num / den;
  } else {
    value = parseFloat(mainNum);
  }
  
  if (fractionPart) {
    const cleanFrac = fractionPart.replace(/[-\s]/g, '');
    if (cleanFrac.includes('/')) {
      const [num, den] = cleanFrac.split('/').map(Number);
      value += num / den;
    }
  }
  
  const unit = (match[3] || '').trim().toLowerCase();
  
  return { value, unit, original: amountStr };
}

// Determine ingredient category
function getIngredientCategory(ingredientName: string): keyof UnitPreference {
  const name = ingredientName.toLowerCase();
  
  // Small amounts (spices, etc)
  if (/salt|pepper|spice|cumin|turmeric|masala|powder|thyme|garlic|ginger/i.test(name) && 
      !/garlic cloves|garlic bulb/i.test(name)) {
    return 'smallAmounts';
  }
  
  // Fats
  if (/butter|ghee|oil|margarine|shortening/i.test(name)) {
    return 'fats';
  }
  
  // Liquids
  if (/milk|water|stock|broth|juice|vinegar|wine|oil.*for|coconut milk/i.test(name)) {
    return 'liquids';
  }
  
  // Produce
  if (/onion|garlic cloves|potato|tomato|pepper|chili|scallion|shadon beni|culantro|cilantro/i.test(name)) {
    return 'produce';
  }
  
  // Default to dry goods
  return 'dryGoods';
}

// Convert ingredient amount based on user preferences
export function convertIngredient(
  amountStr: string, 
  ingredientName: string,
  preferences: UnitPreference = DEFAULT_PREFERENCES
): string {
  const parsed = parseAmount(amountStr);
  
  // Can't convert non-numeric amounts
  if (parsed.value === 0) {
    return amountStr;
  }
  
  const category = getIngredientCategory(ingredientName);
  const targetUnit = preferences[category];
  
  // Get current unit conversion
  const currentConv = CONVERSIONS[parsed.unit] || CONVERSIONS[parsed.unit + 's'];
  if (!currentConv) {
    // Unknown unit, return original
    return amountStr;
  }
  
  // Convert to base (grams or ml)
  const baseValue = currentConv.toBase(parsed.value);
  
  // Check if we need density conversion
  const density = DENSITIES[ingredientName.toLowerCase()];
  
  let finalValue: number;
  let finalUnit: string;
  
  if (targetUnit === 'grams' || targetUnit === 'oz') {
    // Target is weight
    if (currentConv.display === 'g' || currentConv.display === 'oz' || currentConv.display === 'lb') {
      // Already weight, just convert
      const targetConv = CONVERSIONS[targetUnit];
      finalValue = targetConv.fromBase(baseValue);
    } else if (density) {
      // Volume to weight conversion needed
      const mlValue = currentConv.toBase(parsed.value);
      const gramsValue = (mlValue / 236.59) * density; // Convert via cup standard
      const targetConv = CONVERSIONS[targetUnit];
      finalValue = targetConv.fromBase(gramsValue);
    } else {
      // No density data, can't convert
      return amountStr;
    }
    finalUnit = targetUnit === 'grams' ? 'g' : 'oz';
  } else {
    // Target is volume/count
    const targetConv = CONVERSIONS[targetUnit];
    if (!targetConv) {
      return amountStr;
    }
    
    if (targetUnit === 'cups' || targetUnit === 'tbs' || targetUnit === 'tsp' || targetUnit === 'ml') {
      if (currentConv.display === 'g' || currentConv.display === 'oz') {
        // Weight to volume, need density
        if (density) {
          const cupValue = (baseValue / density);
          const mlValue = cupValue * 236.59;
          finalValue = targetConv.fromBase(mlValue);
        } else {
          return amountStr;
        }
      } else {
        // Volume to volume
        finalValue = targetConv.fromBase(baseValue);
      }
      finalUnit = targetConv.display;
    } else {
      // Count (like "1 onion") - keep as is
      return amountStr;
    }
  }
  
  // Format nicely
  let formatted: string;
  if (finalValue < 0.25) {
    formatted = (Math.round(finalValue * 32) / 32).toString();
  } else if (finalValue < 1) {
    formatted = (Math.round(finalValue * 8) / 8).toString();
  } else if (finalValue < 10) {
    formatted = (Math.round(finalValue * 2) / 2).toString();
  } else {
    formatted = Math.round(finalValue).toString();
  }
  
  // Clean up
  formatted = formatted.replace(/\.0$/, '');
  
  return `${formatted} ${finalUnit}`;
}

// Quick toggle presets
export const UNIT_PRESETS = {
  metric: {
    dryGoods: 'grams' as const,
    liquids: 'ml' as const,
    smallAmounts: 'tsp' as const,
    fats: 'grams' as const,
    produce: 'grams' as const,
  },
  imperial: {
    dryGoods: 'cups' as const,
    liquids: 'cups' as const,
    smallAmounts: 'tsp' as const,
    fats: 'tbs' as const,
    produce: 'count' as const,
  },
  baker_friendly: {
    dryGoods: 'grams' as const,      // Weight for accuracy
    liquids: 'ml' as const,          // Weight/volume equivalence
    smallAmounts: 'grams' as const,  // Precise measurements
    fats: 'grams' as const,          // Consistent
    produce: 'count' as const,       // Practical
  },
} as const;
