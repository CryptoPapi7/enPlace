// Multi-recipe shopping list logic with smart consolidation

export interface RecipePlan {
  recipeId: string;
  recipeName: string;
  servings: number;
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

// Categorize ingredients
function categorizeItem(item: string): ConsolidatedItem['category'] {
  const name = item.toLowerCase();
  
  if (/chicken|beef|pork|meat|fish|shrimp|protein/i.test(name)) {
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
    recipe.ingredients.forEach(ing => {
      const normalizedName = normalizeItemName(ing.item);
      
      if (itemMap.has(normalizedName)) {
        // Add to existing item
        const existing = itemMap.get(normalizedName)!;
        existing.breakdown.push({
          recipeId: recipe.recipeId,
          recipeName: recipe.recipeName,
          amount: ing.amount,
          category: ing.category,
        });
        // Update total (approximate - just appending for now)
        existing.totalAmount += ` + ${ing.amount}`;
      } else {
        // Create new item
        itemMap.set(normalizedName, {
          id: `${recipe.recipeId}_${normalizedName}`,
          item: ing.item, // keep original display name
          totalAmount: ing.amount,
          breakdown: [{
            recipeId: recipe.recipeId,
            recipeName: recipe.recipeName,
            amount: ing.amount,
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
