export const cacioEPepeRecipe = {
  id: 'cacio-e-pepe',
  title: 'Cacio e Pepe',
  description: 'The Roman classic — pasta coated in silky pecorino and cracked black pepper. Three ingredients, centuries of perfection.',
  cuisine: 'Italian',
  vibe: 'comfort',
  emoji: '🧀',
  imageUrl: 'https://vsyibvjpwjjyvnsnyjmk.supabase.co/storage/v1/object/public/enPlace/Recipe-Images/Cacio%20e%20Pepe.avif',
  servings: 4,
  totalTimeMinutes: 20,
  prepTimeMinutes: 5,
  cookTimeMinutes: 15,
  difficulty: 'Medium',

  sections: {
    pasta: [
      {
        id: 'boil-water',
        title: 'Boil the water',
        instructions: [
          'Bring a large pot of water to a rolling boil.',
          'Add salt — it should taste like the sea.',
        ],
        durationMinutes: 8,
        active: false,
      },
      {
        id: 'cook-pasta',
        title: 'Cook the pasta',
        instructions: [
          'Add spaghetti and cook until al dente (1-2 minutes less than package time).',
          'Do not drain — you need that starchy pasta water.',
        ],
        durationMinutes: 8,
        active: false,
      },
      {
        id: 'toast-pepper',
        title: 'Toast the pepper',
        instructions: [
          'While pasta cooks, crack black pepper into a large dry pan.',
          'Toast over medium heat until fragrant — about 30 seconds.',
        ],
        durationMinutes: 1,
        active: true,
      },
      {
        id: 'make-sauce',
        title: 'Create the magic sauce',
        instructions: [
          'Grate pecorino into a bowl.',
          'Add a splash of cold water and mash into a thick paste.',
          'This prevents the cheese from clumping when it hits heat.',
        ],
        durationMinutes: 3,
        active: true,
      },
      {
        id: 'combine',
        title: 'Toss everything together',
        instructions: [
          'Transfer pasta directly from pot to pepper pan with tongs.',
          'Add a splash of pasta water and toss vigorously.',
          'Remove from heat, add cheese paste, toss constantly.',
          'The heat from pasta melts cheese into silky sauce.',
        ],
        durationMinutes: 2,
        active: true,
      },
    ],
  },

  ingredients: {
    pasta: [
      { item: 'Spaghetti', amount: '400 g', category: 'pantry' },
      { item: 'Pecorino Romano', amount: '200 g', category: 'dairy' },
      { item: 'Black peppercorns', amount: '2 tbsp', category: 'spices' },
      { item: 'Sea salt', amount: 'for pasta water', category: 'spices' },
    ],
  },

  chefNotes: [
    'Use Pecorino Romano, not Parmigiano — the sharp saltiness is crucial',
    'Freshly cracked pepper is non-negotiable — pre-ground loses its magic',
    'If sauce clumps, add more pasta water and keep tossing off heat',
    'Cold water in the cheese paste is the secret to silkiness',
    'Eat immediately — this does not wait for anyone',
  ],

  equipment: [
    'Large pot',
    'Tongs for tossing',
    'Microplane or fine grater',
    'Pepper mill',
  ],

  storage: 'Not recommended — cacio e pepe is a dish of the moment',
  
  reheating: 'If you must: splash of water, gentle low heat, constant stirring',
  
  scalingNotes: 'Doubles well. For triple batch, work in two pans to maintain tossing motion.',
  
  dietary: ['vegetarian'],
};
