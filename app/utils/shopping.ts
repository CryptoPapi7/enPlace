// Multi-recipe shopping list logic with smart consolidation

export interface RecipePlan {
  recipeId: string;
  recipeName: string;
  servings: number;
  defaultServings: number;
  ingredients: {
    item: string;
    amount: string;
    category: 'curry' | 'roti' | 'main' | 'side';
  }[];
}

export interface ConsolidatedItem {
  id: string;
  item: string;
  totalAmount: string;
  breakdown: {
    recipeId: string;
    recipeName: string;
    amount: string;
    category: string;
  }[];
  checked: boolean;
  hasAtHome: boolean;
  category: 'produce' | 'pantry' | 'dairy' | 'meat' | 'spices' | 'other';
}

// Normalize ingredient names for consolidation
function normalizeItemName(name: string): string {
  return name.toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/,$/, '')
    .replace(/\s+\([^)]*\)/g, '') // remove parentheticals
    .trim();
}

// Scale amount based on servings ratio
function scaleAmount(amountStr: string, ratio: number): string {
  if (ratio === 1) return amountStr;
  
  // Try to find a number at the start
  const match = amountStr.match(/^([\d./]+)\s*(.*)$/);
  if (!match) return amountStr; // Can't parse, return original
  
  let value: number;
  const numStr = match[1];
  const unit = match[2].trim(); // Remove leading space
  
  // Handle fractions like "1/2"
  if (numStr.includes('/')) {
    const [num, den] = numStr.split('/').map(Number);
    value = num / den;
  } else {
    value = parseFloat(numStr);
  }
  
  if (isNaN(value)) return amountStr;
  
  const scaled = value * ratio;
  
  // Format nicely
  let formatted: string;
  if (scaled >= 10) {
    formatted = Math.round(scaled).toString();
  } else if (scaled % 1 === 0) {
    formatted = scaled.toFixed(0);
  } else if (scaled % 0.5 === 0) {
    formatted = scaled.toFixed(1).replace('.0', '');
  } else {
    formatted = scaled.toFixed(2).replace(/\.?0+$/, '');
  }
  
  // No space between number and unit for parser compatibility
  return unit ? `${formatted}${unit}` : formatted;
}

// Categorize ingredients
function categorizeItem(item: string): ConsolidatedItem['category'] {
  const name = item.toLowerCase();
  
  if (/chicken|beef|pork|meat|fish|shrimp|protein|cod|salmon|tuna|tilapia|halibut/i.test(name)) {
    return 'meat';
  }
  if (/onion|garlic|tomato|potato|pepper|scallion|shadon|cilantro|culantro|ginger|produce/i.test(name)) {
    return 'produce';
  }
  if (/milk|butter|ghee|cream|yogurt|dairy|cheese/i.test(name)) {
    return 'dairy';
  }
  if (/salt|pepper|spice|cumin|turmeric|masala|thyme|seasoning|powder/i.test(name)) {
    return 'spices';
  }
  if (/flour|sugar|rice|oil|vinegar|water|stock|broth/i.test(name)) {
    return 'pantry';
  }
  return 'other';
}

// Consolidate ingredients from multiple recipes
export function consolidateShoppingList(recipes: RecipePlan[]): ConsolidatedItem[] {
  const itemMap = new Map<string, ConsolidatedItem>();
  
  recipes.forEach(recipe => {
    // Calculate scaling ratio for this recipe
    const ratio = recipe.servings / recipe.defaultServings;
    
    recipe.ingredients.forEach(ing => {
      const normalizedName = normalizeItemName(ing.item);
      const scaledAmount = scaleAmount(ing.amount, ratio);
      
      if (itemMap.has(normalizedName)) {
        // Add to existing item
        const existing = itemMap.get(normalizedName)!;
        existing.breakdown.push({
          recipeId: recipe.recipeId,
          recipeName: recipe.recipeName,
          amount: scaledAmount,
          category: ing.category,
        });
        // Update total (approximate - just appending for now)
        existing.totalAmount += ` + ${scaledAmount}`;
      } else {
        // Create new item
        itemMap.set(normalizedName, {
          id: `${recipe.recipeId}_${normalizedName}`,
          item: ing.item, // keep original display name
          totalAmount: scaledAmount,
          breakdown: [{
            recipeId: recipe.recipeId,
            recipeName: recipe.recipeName,
            amount: scaledAmount,
            category: ing.category,
          }],
          checked: false,
          hasAtHome: false,
          category: categorizeItem(ing.item),
        });
      }
    });
  });
  
  // Sort by category then alphabetically
  return Array.from(itemMap.values()).sort((a, b) => {
    if (a.category !== b.category) {
      const catOrder = ['produce', 'meat', 'dairy', 'pantry', 'spices', 'other'];
      return catOrder.indexOf(a.category) - catOrder.indexOf(b.category);
    }
    return a.item.localeCompare(b.item);
  });
}

// Get items that need to be bought
export function getNeedToBuy(items: ConsolidatedItem[]): ConsolidatedItem[] {
  return items.filter(i => !i.hasAtHome && !i.checked);
}

// Get items grouped by store section (category)
export function getItemsByCategory(items: ConsolidatedItem[]): Record<string, ConsolidatedItem[]> {
  return items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ConsolidatedItem[]>);
}

// Calculate shopping stats
export function getShoppingStats(items: ConsolidatedItem[]) {
  const total = items.length;
  const needToBuy = items.filter(i => !i.hasAtHome).length;
  const atHome = items.filter(i => i.hasAtHome).length;
  const checked = items.filter(i => i.checked).length;
  
  return {
    total,
    needToBuy,
    atHome,
    checked,
    progress: total > 0 ? checked / total : 0,
  };
}
