export const sourdoughRecipe = {
  id: 'sourdough',
  title: 'Weekend Sourdough',
  description: 'Crusty artisan sourdough with open crumb and tangy flavor',
  cuisine: 'Artisan Bread',
  vibe: 'mindful',
  emoji: '🍞',
  imageUrl: 'https://vsyibvjpwjjyvnsnyjmk.supabase.co/storage/v1/object/public/enPlace/Recipe-Images/Sourdough%20Bread.avif',
  servings: 1,
  totalTimeMinutes: 1440,
  prepTimeMinutes: 30,
  cookTimeMinutes: 45,
  difficulty: 'Hard',
  
  sections: {
    main: [
      {
        id: 'autolyse',
        title: 'Autolyse',
        instructions: ['Mix flour and water. Rest 1 hour. This develops gluten without kneading.'],
        durationMinutes: 60,
        active: false,
      },
      {
        id: 'mix',
        title: 'Add starter and salt',
        instructions: ['Add active sourdough starter and salt. Mix until incorporated.'],
        durationMinutes: 10,
        active: true,
      },
      {
        id: 'bulk-ferment',
        title: 'Bulk fermentation',
        instructions: ['Perform stretch and folds every 30 minutes for 2 hours. Let rise until doubled (6-8 hours total at room temp).'],
        durationMinutes: 480,
        active: false,
      },
      {
        id: 'shape',
        title: 'Shape and proof',
        instructions: ['Gently shape into round. Place in banneton or bowl. Cold proof in fridge overnight or 2-4 hours at room temp.'],
        durationMinutes: 720,
        active: true,
      },
      {
        id: 'bake',
        title: 'Bake',
        instructions: ['Preheat Dutch oven to 500°F. Score dough. Bake covered 20 min, uncovered 20-25 min until deep golden.'],
        durationMinutes: 50,
        active: false,
      },
    ],
  },
  
  ingredients: {
    main: [
      { item: 'Bread flour', amount: '500g', category: 'pantry' },
      { item: 'Water', amount: '350g', category: 'pantry' },
      { item: 'Sourdough starter', amount: '100g (active)', category: 'pantry' },
      { item: 'Salt', amount: '10g', category: 'spices' },
    ],
  },
  
  chefNotes: [
    'Starter should pass float test before using',
    'Temperature affects timing - watch the dough, not the clock',
    'Steam is crucial for crust development',
    'Let cool completely before slicing (at least 1 hour)',
  ],
  
  tags: ['bread', 'sourdough', 'weekend', 'fermentation'],
};
