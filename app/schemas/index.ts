import { z } from 'zod';

// Ingredient schema
export const IngredientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required').max(200, 'Ingredient name too long'),
  amount: z.string().optional(),
  unit: z.string().optional(),
  optional: z.boolean().optional(),
});

// Step schema
export const StepSchema = z.object({
  instruction: z.string().min(1, 'Step instruction is required').max(1000, 'Instruction too long'),
  duration: z.string().optional(),
});

// Main Recipe schema
export const RecipeSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Recipe title is required').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  emoji: z.string().max(2, 'Use a single emoji').optional(),
  cuisine: z.string().max(50).optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  totalTime: z.string().optional(),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  servings: z.string().optional(),
  ingredients: z.array(z.string().min(1)).min(1, 'At least one ingredient is required'),
  instructions: z.array(z.string().min(1)).min(1, 'At least one instruction is required'),
  tags: z.array(z.string()).optional(),
  image: z.string().optional(),
  source: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Schema for AI-generated recipes (with partial info)
export const AISchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  emoji: z.string().optional(),
  cuisine: z.string().optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  totalTime: z.string().optional(),
  servings: z.string().optional(),
  ingredients: z.array(z.string()).min(1),
  instructions: z.array(z.string()).min(1),
  tags: z.array(z.string()).optional(),
});

// Type exports from schemas
export type Recipe = z.infer<typeof RecipeSchema>;
export type Ingredient = z.infer<typeof IngredientSchema>;
export type Step = z.infer<typeof StepSchema>;
export type AIGeneratedRecipe = z.infer<typeof AISchema>;

// Validation helper functions
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
  
  return {
    success: false,
    errors: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`),
  };
}

export function validateAIGeneratedRecipe(data: unknown): {
  success: true;
  data: AIGeneratedRecipe;
} | {
  success: false;
  errors: string[];
} {
  const result = AISchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return {
    success: false,
    errors: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`),
  };
}

// Sanitize function for imported recipes (normalizes data before validation)
export function sanitizeRecipeData(rawData: unknown): unknown {
  if (typeof rawData !== 'object' || rawData === null) {
    return rawData;
  }
  
  const data = rawData as Record<string, unknown>;
  
  return {
    ...data,
    // Ensure arrays
    ingredients: Array.isArray(data.ingredients) 
      ? data.ingredients.filter((i): i is string => typeof i === 'string' && i.length > 0)
      : [],
    instructions: Array.isArray(data.instructions)
      ? data.instructions.filter((i): i is string => typeof i === 'string' && i.length > 0)
      : [],
    tags: Array.isArray(data.tags) 
      ? data.tags.filter((t): t is string => typeof t === 'string')
      : undefined,
    // Ensure strings
    title: typeof data.title === 'string' ? data.title.trim() : 'Untitled Recipe',
    description: typeof data.description === 'string' ? data.description.trim() : undefined,
  };
}
