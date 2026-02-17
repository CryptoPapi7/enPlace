# Recipe Architecture Proposal

## Current Pain Points

### 1. Ingredient Standardization
**Problem:** "Extra virgin olive oil", "EVOO", "olive oil" treated as different items
**Impact:** Shopping list shows duplicates, consolidation fails

### 2. Hardcoded Categorization
**Problem:** Regex patterns miss edge cases (cod, tofu, tempeh)
**Impact:** Shopping categories wrong, user frustration

### 3. No Recipe Validation
**Problem:** Each recipe added has slightly different format
**Impact:** UI inconsistencies, broken features

### 4. Import/AI Recipes Inconsistent
**Problem:** Scraped/generated recipes don't match hand-crafted quality
**Impact:** Poor UX in cook mode, missing metadata

---

## Proposed Solutions

### Phase 1: AI-Powered Ingredient Pipeline

When ANY recipe is added (import, AI gen, manual):

```typescript
interface IngredientNormalization {
  original: string;           // "Extra virgin olive oil"
  canonical: string;          // "Olive oil"
  category: 'pantry' | 'produce' | 'dairy' | 'meat' | 'spices' | 'other';
  unit: string;               // "tbsp"
  amount: number;             // 2
  shoppingCategory: string;   // "Oils & Vinegars"
}

async function normalizeIngredient(raw: string): Promise<IngredientNormalization> {
  // GPT call:
  // "Normalize '2 tbsp extra virgin olive oil' to standard format"
  // Returns structured data
}
```

**Benefits:**
- Consistent naming across all recipes
- AI determines category (better than regex)
- Shopping categories match store layout
- Works for ANY input source

---

### Phase 2: Strict Recipe Schema

All recipes MUST conform to:

```typescript
interface EnPlaceRecipe {
  // Required metadata
  id: string;
  title: string;
  emoji: string;
  cuisine: string;
  servings: number;
  
  // Structured ingredients (AI-normalized)
  ingredients: {
    section: string;           // "For the sauce"
    items: Ingredient[];       // Normalized, canonical names
  }[];
  
  // Structured instructions
  sections: {
    id: string;
    title: string;
    steps: {
      id: string;
      instruction: string;
      durationMinutes: number;
      active: boolean;
    }[];
  }[];
  
  // AI-generated metadata
  tags: string[];              // ["weeknight", "italian", "seafood"]
  difficulty: 'Easy' | 'Medium' | 'Hard';
  equipment: string[];         // ["stand mixer", "pasta roller"]
  dietary: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
  };
}
```

**Validation:**
```typescript
function validateRecipe(recipe: unknown): EnPlaceRecipe {
  // Zod or Joi schema validation
  // Throws if missing required fields
  // Normalizes all ingredients
  // Returns clean, guaranteed-valid recipe
}
```

---

### Phase 3: Recipe Creation Pipeline

**For Import (Web Scraper):**
1. Scrape raw HTML/JSON-LD
2. Extract messy ingredient strings
3. **AI normalize** each ingredient
4. Validate against schema
5. Save clean EnPlaceRecipe

**For AI Generation:**
1. User prompt → GPT generates recipe
2. GPT outputs JSON matching EnPlaceRecipe schema
3. Validate schema
4. AI normalize all ingredients (double-check)
5. Save

**For Manual Creation:**
1. User fills form (ingredients per section)
2. On save: AI normalize all ingredients
3. Validate
4. Save clean recipe

---

### Phase 4: Shopping List Intelligence

With normalized ingredients:

```typescript
// Before: Messy consolidation
"Extra virgin olive oil" !== "Olive oil"  // Duplicate!

// After: Clean consolidation
"Olive oil" (from: 2 recipes, total: 4 tbsp)
```

**Smart Grouping:**
```typescript
const SHOPPING_AISLES = {
  produce: ['vegetables', 'fruits', 'fresh herbs'],
  meat: ['chicken', 'beef', 'pork', 'fish', 'seafood'],
  dairy: ['milk', 'cheese', 'yogurt', 'butter', 'eggs'],
  pantry: ['oils', 'vinegars', 'canned goods', 'pasta', 'rice'],
  spices: ['spices', 'herbs', 'seasonings'],
  frozen: ['frozen vegetables', 'frozen proteins'],
  bakery: ['bread', 'tortillas', 'buns'],
};

// AI assigns aisle based on canonical ingredient name
```

---

## Implementation Plan

### Week 1: Foundation
- [ ] Define EnPlaceRecipe schema (TypeScript + Zod)
- [ ] Create ingredient normalization API
- [ ] Build validation pipeline

### Week 2: Import Pipeline
- [ ] Update web scraper to use normalization
- [ ] Update AI generation to output schema-compliant JSON
- [ ] Add validation step to both

### Week 3: Shopping List
- [ ] Replace hardcoded categorization with AI categories
- [ ] Implement smart consolidation using canonical names
- [ ] Add aisle-based shopping view

### Week 4: Manual Creation
- [ ] Build recipe creation UI
- [ ] Integrate normalization on save
- [ ] Test all three input methods

---

## Technical Details

### Ingredient Normalization Prompt

```
You are a recipe ingredient parser. Given a raw ingredient string, extract and normalize:

Input: "2 tbsp extra virgin olive oil, plus more for drizzling"

Output JSON:
{
  "original": "2 tbsp extra virgin olive oil, plus more for drizzling",
  "amount": 2,
  "unit": "tbsp",
  "canonical": "Olive oil",
  "category": "pantry",
  "shoppingCategory": "Oils & Vinegars",
  "notes": "Plus more for drizzling"
}

Rules:
1. Use standard pantry names ("Olive oil" not "Extra virgin olive oil")
2. Category: pantry, produce, dairy, meat, seafood, spices, other
3. Shopping category should match typical grocery store aisles
4. Convert all amounts to numeric values
5. Standard unit abbreviations (tbsp, tsp, g, ml, cup, lb, oz)
```

### Cost Estimate
- Ingredient normalization: ~$0.01 per recipe (GPT-4-mini)
- For 1000 recipes: ~$10
- For 10,000 recipes: ~$100
- Negligible for individual imports

---

## Success Metrics

1. **Zero duplicates** in shopping list for same ingredient
2. **95%+ accuracy** on AI category assignment (vs regex)
3. **All recipes** pass schema validation before saving
4. **Consistent UX** regardless of input method (import, AI, manual)

---

## Open Questions

1. Do we cache normalization results to save AI costs?
2. How do we handle user corrections? ("That's not olive oil, it's grapeseed")
3. Should we support multiple languages for international users?
4. What about seasonal ingredients? ("Tomatoes" vs "Canned tomatoes")

---

*This architecture makes enPlace scalable and maintainable.*
