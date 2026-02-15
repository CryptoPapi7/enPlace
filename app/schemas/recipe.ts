import { z } from 'zod';

/**
 * Zod schema for validating recipe data
 * Used at boundaries: AI generation, imports, manual entry
 */

export const IngredientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required'),
  quantity: z.string().optional(),
  unit: z.string().optional(),
});

export const StepSchema = z.object({
  order: z.number().int().min(1, 'Step order must be at least 1'),
  text: z.string().min(1, 'Step text is required'),
  durationMinutes: z.number().int().min(0).optional(),
});

export const RecipeSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Recipe title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  emoji: z.string().emoji().max(2, 'Use a single emoji').optional().default('🍽️'),
  cuisine: z.string().optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional().default('Medium'),
  
  // Time fields - can be strings for now, can transform to numbers later
  prepTime: z.string().optional().default(''),
  cookTime: z.string().optional().default(''),
  totalTime: z.string().optional().default(''),
  
  servings: z.string().optional().default('4 servings'),
  
  // Core content - must have at least one ingredient and one step
  ingredients: z.array(z.string().min(1)).min(1, 'At least one ingredient required'),
  instructions: z.array(z.string().min(1)).min(1, 'At least one instruction required'),
  
  // Optional fields
  tags: z.array(z.string()).optional().default([]),
  image: z.string().url().or(z.string().length(0)).optional(),
  source: z.string().optional(),
  
  // Metadata
  createdAt: z.date().optional().default(() => new Date()),
  updatedAt: z.date().optional().default(() => new Date()),
});

// Type inference for TypeScript
type Recipe = z.infer<typeof RecipeSchema>;
type Ingredient = z.infer<typeof IngredientSchema>;
type Step = z.infer<typeof StepSchema>;

export type { Recipe, Ingredient, Step };

/**
 * Safely parse recipe data with Zod
 * Returns { success: true, data: Recipe } or { success: false, errors: string[] }
 */
export function validateRecipe(data: unknown): { 
  success: true; 
  data: Recipe; 
} | { 
  success: false; 
  errors: string[]; 
} {
  const result = RecipeSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  // Format errors nicely
  const errors = result.error.errors.map(err => 
    `${err.path.join('.')}: ${err.message}`
  );
  
  return { success: false, errors };
}

/**
 * Parse recipe from AI-generated JSON
 * More lenient - transforms common formats
 */
export function parseAIRecipe(data: unknown): { 
  success: true; 
  data: Recipe; 
} | { 
  success: false; 
  errors: string[]; 
} {
  // Normalize common AI output variations
  const normalized = normalizeRecipeData(data);
  return validateRecipe(normalized);
}

/**
 * Parse recipe from web import (JSON-LD or scraped)
 */
export function parseImportedRecipe(data: unknown): { 
  success: true; 
  data: Recipe; 
} | { 
  success: false; 
  errors: string[]; 
} {
  const normalized = normalizeRecipeData(data);
  return validateRecipe(normalized);
}

/**
 * Helper: Normalize different recipe formats to our schema
 */
function normalizeRecipeData(data: any): unknown {
  if (!data || typeof data !== 'object') {
    return data;
  }

  return {
    ...data,
    // Handle array vs string for ingredients
    ingredients: normalizeArray(data.ingredients || data.recipeIngredient),
    
    // Handle array vs string for instructions/steps
    instructions: normalizeArray(
      data.instructions || 
      data.recipeInstructions || 
      data.steps
    ),
    
    // Normalize time fields
    totalTime: data.totalTime || data.cookTime || '30 minutes',
    servings: data.servings || data.recipeYield || '4 servings',
    
    // Default emoji if none provided
    emoji: data.emoji || '🍽️',
  };
}

function normalizeArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(item => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object' && 'text' in item) {
        return String(item.text);
      }
      return String(item);
    }).filter(Boolean);
  }
  return [String(value)];
}
