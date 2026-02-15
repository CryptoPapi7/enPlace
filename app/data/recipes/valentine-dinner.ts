export const valentineDinnerRecipe = {
  id: 'valentine-dinner',
  title: 'Valentine\'s Dinner: Cod Piccata + Fresh Pappardelle + Broccolini',
  description: 'Elegant homemade pappardelle with buttery cod piccata and charred broccolini',
  cuisine: 'Italian-American',
  vibe: 'special',
  emoji: '🥂',
  servings: 4,
  totalTimeMinutes: 120,
  prepTimeMinutes: 45,
  cookTimeMinutes: 30,
  difficulty: 'Medium',
  
  equipment: ['KitchenAid stand mixer', 'Pasta roller attachment'],
  
  sections: {
    'pasta-dough': [
      {
        id: 'mix-dough',
        title: 'Make pasta dough',
        instructions: ['In KitchenAid bowl, combine flour, semolina, and salt. Make well in center. Add eggs, yolks, and olive oil. Use paddle on low (speed 2) for 2 minutes until shaggy. Switch to dough hook, knead 5 minutes until smooth.'],
        durationMinutes: 10,
        active: true,
      },
      {
        id: 'rest-dough',
        title: 'Rest the dough',
        instructions: ['Wrap dough tightly in plastic wrap. Rest at room temperature for 30 minutes. Do not refrigerate.'],
        durationMinutes: 30,
        active: false,
      },
    ],
    'prep-mise': [
      {
        id: 'prep-all',
        title: 'Mise en place',
        instructions: ['Pat cod completely dry. Season flour with salt and pepper in shallow dish. Zest and juice lemons. Mince garlic. Drain and rinse capers. Chop parsley. Prep broccolini by trimming ends.'],
        durationMinutes: 15,
        active: true,
      },
    ],
    'pasta-roll-cut': [
      {
        id: 'roll-sheets',
        title: 'Roll pasta sheets',
        instructions: ['Divide dough into 4 pieces. Flatten one piece. Feed through pasta roller on setting 1. Fold in thirds, rotate 90°, feed through again. Continue through settings 2, 3, 4, 5 until sheets are ~2mm thick. Flour as needed.'],
        durationMinutes: 20,
        active: true,
      },
      {
        id: 'cut-pappardelle',
        title: 'Cut pappardelle',
        instructions: ['Roll each sheet loosely like a cigar. Cut into ¾-inch (2cm) wide ribbons. Unroll gently. Toss with semolina flour to prevent sticking. Loop into loose nests. Let dry 15 minutes while cooking fish.'],
        durationMinutes: 10,
        active: true,
      },
    ],
    'fish-sauce': [
      {
        id: 'sear-cod',
        title: 'Sear the cod',
        instructions: ['Heat 2 tbsp butter + olive oil in large skillet over medium-high. Dredge cod in seasoned flour, shake off excess. Sear 3 minutes per side until golden and just cooked through. Remove to warm plate.'],
        durationMinutes: 10,
        active: true,
      },
      {
        id: 'make-sauce',
        title: 'Make piccata sauce',
        instructions: ['In same pan, add garlic. Cook 30 seconds until fragrant. Add wine, scraping browned bits. Add stock, lemon juice, lemon zest, capers. Simmer 3 minutes to reduce slightly.'],
        durationMinutes: 5,
        active: true,
      },
      {
        id: 'finish-sauce',
        title: 'Finish sauce',
        instructions: ['Remove pan from heat. Swirl in remaining 2 tbsp cold butter until melted and sauce is silky. Taste and adjust salt/lemon.'],
        durationMinutes: 2,
        active: true,
      },
    ],
    'pasta-cook': [
      {
        id: 'boil-pasta',
        title: 'Boil the pappardelle',
        instructions: ['Bring large pot of salted water to boil. Add pappardelle. Cook 2-3 minutes until tender but with bite. Reserve 1 cup pasta water, then drain.'],
        durationMinutes: 3,
        active: true,
      },
      {
        id: 'toss-pasta',
        title: 'Toss pasta with sauce',
        instructions: ['Add pasta to piccata sauce. Toss gently, adding pasta water as needed to loosen. Let sauce coat pasta for 1 minute.'],
        durationMinutes: 2,
        active: true,
      },
    ],
    'broccolini': [
      {
        id: 'blanch-broccolini',
        title: 'Blanch broccolini',
        instructions: ['Bring salted water to boil. Add broccolini. Cook 2 minutes until bright green. Transfer to ice bath immediately to stop cooking. Drain well.'],
        durationMinutes: 5,
        active: true,
      },
      {
        id: 'sauté-broccolini',
        title: 'Sauté broccolini',
        instructions: ['Heat olive oil in large pan. Add garlic, cook until golden (dont burn!). Add drained broccolini. Sauté 2 minutes until charred in spots. Add red pepper, lemon zest. Finish with lemon juice.'],
        durationMinutes: 5,
        active: true,
      },
    ],
    'serve': [
      {
        id: 'plate',
        title: 'Plate and serve',
        instructions: ['Place pappardelle on warm plates. Top with cod fillet. Spoon extra sauce over. Arrange broccolini alongside. Sprinkle with fresh parsley. Serve immediately with lemon wedges.'],
        durationMinutes: 5,
        active: false,
      },
    ],
  },
  
  ingredients: {
    'pasta-dough': [
      { item: '00 flour or all-purpose', amount: '300g', category: 'pantry' },
      { item: 'Fine semolina', amount: '50g', category: 'pantry' },
      { item: 'Large eggs', amount: '3 whole', category: 'dairy' },
      { item: 'Egg yolks', amount: '2 extra', category: 'dairy' },
      { item: 'Fine sea salt', amount: '1 tsp', category: 'spices' },
      { item: 'Extra virgin olive oil', amount: '1 tsp', category: 'pantry' },
    ],
    'prep-mise': [
      { item: 'Cod fillets skinless', amount: '500g (4 pieces)', category: 'protein' },
      { item: 'All-purpose flour', amount: '½ cup', category: 'pantry' },
      { item: 'Lemons', amount: '2', category: 'produce' },
      { item: 'Garlic', amount: '7 cloves', category: 'produce' },
      { item: 'Capers', amount: '3 tbsp', category: 'pantry' },
      { item: 'Fresh parsley', amount: '2 tbsp chopped', category: 'produce' },
    ],
    'pasta-roll-cut': [
      { item: 'Semolina flour', amount: 'for dusting', category: 'pantry' },
    ],
    'fish-sauce': [
      { item: 'Unsalted butter', amount: '4 tbsp', category: 'dairy' },
      { item: 'Olive oil', amount: '2 tbsp', category: 'pantry' },
      { item: 'Dry white wine', amount: '½ cup', category: 'pantry' },
      { item: 'Vegetable or chicken stock', amount: '½ cup', category: 'pantry' },
      { item: 'Salt and pepper', amount: 'to taste', category: 'spices' },
    ],
    'pasta-cook': [
      { item: 'Salt', amount: 'for pasta water', category: 'spices' },
    ],
    'broccolini': [
      { item: 'Broccolini', amount: '2 bunches (~300g)', category: 'produce' },
      { item: 'Olive oil', amount: '2 tbsp', category: 'pantry' },
      { item: 'Red pepper flakes', amount: 'pinch', category: 'spices' },
    ],
    'serve': [],
  },
  
  chefNotes: [
    'Make pasta dough first—resting is essential for gluten relaxation',
    'Pat cod VERY dry before dredging for golden crust',
    'Cold butter at the end makes the sauce silky and glossy',
    'Blanch broccolini ahead, then quick sauté before serving',
    'Reserve pasta water—its starch helps sauce cling',
    'This is a "flow" meal—prep everything before cooking starts',
  ],
  
  tags: ['special', 'italian', 'pasta', 'fish', 'valentine', 'family'],
};
