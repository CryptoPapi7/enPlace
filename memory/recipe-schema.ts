// EnPlace Recipe Schema (Zod)
// All recipes must conform to this structure

export const IngredientSchema = z.object({
  // Original text from source
  original: z.string(),
  
  // Normalized/canonical name
  canonical: z.string().min(1),
  
  // Parsed amount
  amount: z.number().positive(),
  unit: z.enum(['g', 'kg', 'ml', 'l', 'tsp', 'tbs', 'tbsp', 'cup', 'cups', 'oz', 'lb', 'lbs', 'floz', 'whole', 'clove', 'cloves', 'bunch', 'piece', 'pieces', 'slice', 'slices', 'pinch', 'dash']),
  
  // Categories
  category: z.enum(['produce', 'meat', 'seafood', 'dairy', 'pantry', 'spices', 'other']),
  shoppingCategory: z.string(), // "Oils & Vinegars", "Fresh Herbs", etc.
  
  // Optional notes from original ("plus more for garnish")
  notes: z.string().optional(),
});

export const StepSchema = z.object({
  id: z.string(),
  instruction: z.string().min(10), // Must be descriptive
  durationMinutes: z.number().int().min(1),
  active: z.boolean(), // true = hands-on, false = passive (resting, baking)
  ingredients: z.array(z.string()).optional(), // Which ingredients are used in this step
});

export const SectionSchema = z.object({
  id: z.string(),
  title: z.string().min(2),
  emoji: z.string().optional(),
  steps: z.array(StepSchema).min(1),
});

export const EnPlaceRecipeSchema = z.object({
  // Required IDs
  id: z.string().regex(/^[a-z0-9-]+$/), // slug format
  title: z.string().min(3).max(100),
  
  // Display
  emoji: z.string(),
  cuisine: z.string(), // "Italian", "Thai", "American"
  vibe: z.enum(['quick', 'cozy', 'impressive', 'special', 'project']),
  
  // Servings & Time
  servings: z.number().int().min(1).max(50),
  totalTimeMinutes: z.number().int().min(5),
  prepTimeMinutes: z.number().int().min(0),
  cookTimeMinutes: z.number().int().min(0),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  
  // Equipment (for filtering)
  equipment: z.array(z.string()),
  
  // Structured data
  ingredients: z.record(z.array(IngredientSchema)), // keyed by section
  sections: z.record(z.array(StepSchema)), // keyed by section ID
  
  // AI-generated metadata
  tags: z.array(z.string()),
  dietary: z.object({
    vegetarian: z.boolean(),
    vegan: z.boolean(),
    glutenFree: z.boolean(),
    dairyFree: z.boolean(),
  }),
  
  // Source tracking
  source: z.object({
    type: z.enum(['imported', 'ai-generated', 'manual', 'community']),
    url: z.string().url().optional(),
    author: z.string().optional(),
    importedAt: z.string().datetime().optional(),
  }),
});

// Type inference
export type EnPlaceIngredient = z.infer<typeof IngredientSchema>;
export type EnPlaceStep = z.infer<typeof StepSchema>;
export type EnPlaceSection = z.infer<typeof SectionSchema>;
export type EnPlaceRecipe = z.infer<typeof EnPlaceRecipeSchema>;

// Validation helper
export function validateRecipe(data: unknown): { success: true; recipe: EnPlaceRecipe } | { success: false; errors: string[] } {
  const result = EnPlaceRecipeSchema.safeParse(data);
  if (result.success) {
    return { success: true, recipe: result.data };
  }
  return { success: false, errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`) };
}
