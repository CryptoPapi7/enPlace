# enPlace Recipe Schema

Formal documentation for the enPlace recipe data structure. All new recipes must follow this schema for consistency across the app.

## File Location

Recipes are stored as individual TypeScript files in:
```
/data/recipes/[recipe-name].ts
```

Each recipe is exported as a named constant and registered in `/data/recipes/index.ts`.

## Complete Schema

```typescript
export const recipeName = {
  // ───────────────────────────────────────────────────────────
  // REQUIRED FIELDS
  // ───────────────────────────────────────────────────────────

  /** Unique identifier (kebab-case) */
  id: 'recipe-name',

  /** Recipe title (displayed in headers, cards) */
  title: 'Recipe Title',

  /** One-sentence description for recipe cards */
  description: 'A delicious dish that...',

  /** Cuisine type for filtering */
  cuisine: 'Trinidadian / Guyanese', // or 'Italian', 'Japanese', etc.

  /** Cooking experience vibe */
  vibe: 'comfort', // 'comfort' | 'elegant' | 'quick' | 'project'

  /** Emoji for visual identification (recipe cards, lists) */
  emoji: '🍛',

  /** Base number of servings */
  servings: 4,

  /** Total time from start to finish */
  totalTimeMinutes: 120,

  /** Hands-on prep time */
  prepTimeMinutes: 30,

  /** Active cooking time */
  cookTimeMinutes: 90,

  /** Overall difficulty level */
  difficulty: 'Medium', // 'Easy' | 'Medium' | 'Hard'

  // ───────────────────────────────────────────────────────────
  // SECTIONS (Cooking Steps)
  // ───────────────────────────────────────────────────────────

  sections: {
    // Section names are lowercase, descriptive
    curry: [
      {
        id: 'step-identifier',        // unique within recipe (kebab-case)
        title: 'Step Title',          // displayed as step header
        instructions: [               // array of instruction strings
          'First, do this.',
          'Then, do that.',
        ],
        durationMinutes: 15,          // estimated time for this step
        active: true,                 // true = hands-on, false = passive
      },
      // more steps...
    ],
    roti: [
      // another section...
    ],
  },

  // ───────────────────────────────────────────────────────────
  // INGREDIENTS
  // ───────────────────────────────────────────────────────────

  ingredients: {
    // Keys match section names from above
    curry: [
      {
        item: 'Ingredient Name',      // singular, lowercase except proper nouns
        amount: '1.5 kg',             // include unit (g, kg, cups, tbsp, etc.)
        category: 'meat',             // see CATEGORY values below
      },
      // more ingredients...
    ],
    roti: [
      // ingredients for this section...
    ],
  },

  // ───────────────────────────────────────────────────────────
  // OPTIONAL FIELDS
  // ───────────────────────────────────────────────────────────

  /** Chef's pro tips and secrets */
  chefNotes: [
    'Marinate overnight for best flavor',
    'Use room temperature ingredients',
  ],

  /** Special equipment needed */
  equipment: [
    'Stand mixer',
    'Candy thermometer',
  ],

  /** Storage instructions */
  storage: 'Refrigerate in airtight container for up to 3 days',

  /** Reheating instructions */
  reheating: 'Reheat gently in microwave or stovetop with splash of water',

  /** Notes on scaling (doubling, halving) */
  scalingNotes: 'Doubling works well. Triple the spice but only double the salt.',

  /** Dietary tags for filtering */
  dietary: ['gluten-free', 'dairy-free'], // or ['vegetarian', 'vegan', etc.]
};
```

## Valid Values

### Vibe
- `'comfort'` — Homey, warming, familiar
- `'elegant'` — Special occasion, refined
- `'quick'` — Weeknight, under 30 min
- `'project'` — Weekend cooking, involved

### Difficulty
- `'Easy'` — Beginner friendly
- `'Medium'` — Some technique required
- `'Hard'` — Advanced skills needed

### Ingredient Categories
- `'produce'` — Vegetables, fruits, herbs
- `'meat'` — Chicken, beef, pork, fish
- `'dairy'` — Milk, cheese, butter, yogurt
- `'pantry'` — Flour, oil, canned goods, dry goods
- `'spices'` — Salt, pepper, curry powder, etc.

## Complete Example

See `/data/recipes/chicken-curry.ts` for a fully populated example with:
- Multiple sections (curry + roti)
- Full ingredient lists
- Active/passive step timing
- Chef notes, scaling tips

## Quick Template

```typescript
export const tonkotsuRamenRecipe = {
  id: 'tonkotsu-ramen',
  title: 'Tonkotsu Ramen',
  description: 'Creamy pork bone broth with hand-pulled noodles',
  cuisine: 'Japanese',
  vibe: 'project',
  emoji: '🍜',
  servings: 4,
  totalTimeMinutes: 480,
  prepTimeMinutes: 60,
  cookTimeMinutes: 420,
  difficulty: 'Hard',

  sections: {
    broth: [/* steps */],
    noodles: [/* steps */],
    toppings: [/* steps */],
  },

  ingredients: {
    broth: [/* ingredients */],
    noodles: [/* ingredients */],
    toppings: [/* ingredients */],
  },

  chefNotes: [
    'Blanch bones first for clearer broth',
    'Fat emulsion is key to creamy texture',
  ],
};
```

## Validation Checklist

Before committing a new recipe:

- [ ] `id` is unique across all recipes
- [ ] `sections` keys match `ingredients` keys
- [ ] All steps have unique `id` within recipe
- [ ] `emoji` is appropriate for cuisine
- [ ] `totalTimeMinutes` equals `prepTimeMinutes + cookTimeMinutes`
- [ ] `servings` is a reasonable number (2-12)
- [ ] All ingredients have valid `category`
- [ ] Recipe is exported and added to `index.ts`

## Notes

- **Section names** should be lowercase, descriptive (not "step1")
- **Instructions** should be actionable, imperative sentences
- **Amounts** should use units that make sense for the ingredient
- **Active steps** are hands-on time; mark simmering/passive as `active: false`
- **Chef notes** are pro tips, not instructions

---

*Last updated: 2026-02-17*
