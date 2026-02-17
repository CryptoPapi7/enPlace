// Ingredient Normalization Service
// Uses GPT to standardize any ingredient string

import { EnPlaceIngredient } from './recipe-schema';

interface NormalizationResult {
  success: true;
  ingredient: EnPlaceIngredient;
} | {
  success: false;
  error: string;
  raw: string;
}

const NORMALIZATION_PROMPT = `You are a recipe ingredient parser for a cooking app.

Parse the ingredient and return ONLY a JSON object:
{
  "amount": number (just the number, e.g., 2.5),
  "unit": string (one of: g, kg, ml, l, tsp, tbs/tbsp, cup/cups, oz, lb/lbs, floz, whole, clove/cloves, bunch, piece/pieces, slice/slices, pinch, dash),
  "canonical": string (standard pantry name, lowercase except proper nouns),
  "category": string (one of: produce, meat, seafood, dairy, pantry, spices, other),
  "shoppingCategory": string (grocery store aisle like "Oils & Vinegars" or "Fresh Produce"),
  "original": string (the input exactly as provided),
  "notes": string or null (any qualifiers like "plus more for garnish", "divided", "room temperature")
}

STANDARDIZATION RULES:
- Olive oil, extra virgin olive oil, EVOO → "Olive oil"
- Salt, kosher salt, sea salt, fine sea salt → "Salt" 
- Butter, unsalted butter, sweet butter → "Butter"
- 00 flour, all-purpose flour, AP flour → "All-purpose flour"
- Garlic cloves, garlic, cloves of garlic → "Garlic" (unit: clove)
- Onion, yellow onion, white onion → "Onion" (unit: whole)

CATEGORY RULES:
- produce: fruits, vegetables, fresh herbs
- meat: beef, pork, chicken, lamb, turkey
- seafood: fish, shrimp, shellfish  
- dairy: milk, cheese, butter, yogurt, cream, eggs
- pantry: flour, sugar, oil, vinegar, canned goods, pasta, rice
- spices: salt, pepper, dried herbs, spice blends
- other: things that don't fit above

EXAMPLES:
"2 tbsp extra virgin olive oil" → {"amount": 2, "unit": "tbsp", "canonical": "Olive oil", "category": "pantry", "shoppingCategory": "Oils & Vinegars", "original": "2 tbsp extra virgin olive oil", "notes": null}

"3 large eggs, room temperature" → {"amount": 3, "unit": "whole", "canonical": "Eggs", "category": "dairy", "shoppingCategory": "Dairy & Eggs", "original": "3 large eggs, room temperature", "notes": "room temperature"}

"1/2 cup finely grated Parmesan cheese" → {"amount": 0.5, "unit": "cup", "canonical": "Parmesan cheese", "category": "dairy", "shoppingCategory": "Cheese", "original": "1/2 cup finely grated Parmesan cheese", "notes": "finely grated"}

"Kosher salt" → {"amount": 1, "unit": "pinch", "canonical": "Salt", "category": "spices", "shoppingCategory": "Spices & Seasonings", "original": "Kosher salt", "notes": null} [Assume 1 pinch if no amount given]

"500g (4 pieces) cod fillets skinless" → {"amount": 500, "unit": "g", "canonical": "Cod", "category": "seafood", "shoppingCategory": "Fresh Fish & Seafood", "original": "500g (4 pieces) cod fillets skinless", "notes": "4 pieces, skinless"}

Now parse: `;

export async function normalizeIngredient(rawIngredient: string): Promise<NormalizationResult> {
  try {
    // Call GPT API (you'll implement this with your LLM client)
    const response = await fetch('/api/normalize-ingredient', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingredient: rawIngredient,
        prompt: NORMALIZATION_PROMPT + rawIngredient + '`'
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const parsed = await response.json();
    
    // Validate the structure
    if (!parsed.canonical || !parsed.category) {
      throw new Error('Invalid normalization response');
    }

    return {
      success: true,
      ingredient: {
        original: rawIngredient,
        canonical: parsed.canonical,
        amount: parsed.amount || 1,
        unit: parsed.unit,
        category: parsed.category,
        shoppingCategory: parsed.shoppingCategory,
        notes: parsed.notes || undefined,
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      raw: rawIngredient
    };
  }
}

// Batch normalization for entire recipes
export async function normalizeRecipeIngredients(
  ingredientsBySection: Record<string, Array<{ item: string; amount?: string | number; category?: string }>>
): Promise<Record<string, EnPlaceIngredient[]>> {
  const normalized: Record<string, EnPlaceIngredient[]> = {};
  
  for (const [section, ingredients] of Object.entries(ingredientsBySection)) {
    normalized[section] = [];
    
    for (const ing of ingredients) {
      const rawAmount = ing.amount ? `${ing.amount} ` : '';
      const raw = `${rawAmount}${ing.item}`.trim();
      
      const result = await normalizeIngredient(raw);
      
      if (result.success) {
        normalized[section].push(result.ingredient);
      } else {
        // Fallback: create basic ingredient without normalization
        normalized[section].push({
          original: raw,
          canonical: ing.item,
          amount: typeof ing.amount === 'number' ? ing.amount : 1,
          unit: 'whole',
          category: (ing.category as any) || 'other',
          shoppingCategory: 'Other',
        });
      }
    }
  }
  
  return normalized;
}

// Cache for common ingredients (save API costs)
const ingredientCache = new Map<string, EnPlaceIngredient>();

export async function normalizeWithCache(rawIngredient: string): Promise<NormalizationResult> {
  const key = rawIngredient.toLowerCase().trim();
  
  if (ingredientCache.has(key)) {
    return {
      success: true,
      ingredient: ingredientCache.get(key)!
    };
  }
  
  const result = await normalizeIngredient(rawIngredient);
  
  if (result.success) {
    ingredientCache.set(key, result.ingredient);
  }
  
  return result;
}
