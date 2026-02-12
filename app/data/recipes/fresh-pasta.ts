export const freshPastaRecipe = {
  id: 'fresh-pasta',
  title: 'Fresh Pasta Pomodoro',
  description: 'Silky fresh pasta with bright tomato sauce and basil',
  cuisine: 'Italian',
  vibe: 'quick',
  emoji: '🍝',
  servings: 4,
  totalTimeMinutes: 45,
  prepTimeMinutes: 30,
  cookTimeMinutes: 15,
  difficulty: 'Easy',
  
  sections: {
    main: [
      {
        id: 'make-pasta-dough',
        title: 'Make pasta dough',
        instructions: ['Create well in flour. Add eggs, salt, olive oil. Mix with fork, then knead until smooth. Rest 20 minutes.'],
        durationMinutes: 25,
        active: true,
      },
      {
        id: 'roll-pasta',
        title: 'Roll and cut pasta',
        instructions: ['Feed dough through pasta machine, gradually thinning. Cut into fettuccine or preferred shape.'],
        durationMinutes: 15,
        active: true,
      },
      {
        id: 'make-sauce',
        title: 'Make pomodoro sauce',
        instructions: ['Sauté garlic in olive oil. Add crushed tomatoes, salt, sugar. Simmer 15 minutes. Finish with fresh basil.'],
        durationMinutes: 20,
        active: true,
      },
      {
        id: 'cook-pasta',
        title: 'Cook the pasta',
        instructions: ['Boil salted water. Cook fresh pasta 2-3 minutes until al dente. Toss with sauce.'],
        durationMinutes: 5,
        active: true,
      },
    ],
  },
  
  ingredients: {
    main: [
      { item: '00 flour', amount: '300g', category: 'pantry' },
      { item: 'Eggs', amount: '3 large', category: 'dairy' },
      { item: 'Olive oil', amount: '1 tbsp', category: 'pantry' },
      { item: 'Salt', amount: '1 tsp', category: 'spices' },
      { item: 'San Marzano tomatoes', amount: '1 can (800g)', category: 'pantry' },
      { item: 'Garlic', amount: '3 cloves', category: 'produce' },
      { item: 'Fresh basil', amount: '1 bunch', category: 'produce' },
      { item: 'Parmesan cheese', amount: 'for serving', category: 'dairy' },
      { item: 'Sugar', amount: '1/2 tsp', category: 'pantry' },
    ],
  },
  
  chefNotes: [
    'Use 00 flour for silky texture, all-purpose works too',
    'Sauce can be made ahead and reheated',
    'Fresh pasta cooks much faster than dried',
    'Reserve pasta water for silkier sauce',
  ],
  
  tags: ['italian', 'pasta', 'quick', 'vegetarian'],
};
