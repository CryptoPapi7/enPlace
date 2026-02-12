import { Recipe } from './types';

export const pastaPomodoroRecipe: Recipe = {
  id: 'pasta-pomodoro',
  title: 'Pasta al Pomodoro',
  emoji: '🍝',
  description: 'Fresh pasta with simple, vibrant tomato sauce and basil',
  cuisine: 'Italian',
  difficulty: 'easy',
  totalTimeMinutes: 30,
  servings: 4,
  sections: {
    sauce: [
      {
        id: 'pomodoro-1',
        title: 'Garlic oil',
        instructions: ['Peel and lightly crush garlic cloves', 'Heat olive oil in large pan over medium-low', 'Add garlic, cook until fragrant but not brown', 'Remove garlic and discard'],
        durationMinutes: 5,
        active: true,
      },
      {
        id: 'pomodoro-2',
        title: 'Add tomatoes',
        instructions: ['Add canned tomatoes (crush by hand)', 'Season with salt and sugar', 'Simmer 20 minutes, stirring occasionally'],
        durationMinutes: 20,
        active: false,
      },
      {
        id: 'pomodoro-3',
        title: 'Finish sauce',
        instructions: ['Butter for richness (optional)', 'Tear and add fresh basil', 'Check seasoning'],
        durationMinutes: 5,
        active: true,
      },
    ],
    pasta: [
      {
        id: 'pomodoro-p1',
        title: 'Boil water',
        instructions: ['Large pot of salted water', 'Bring to rolling boil', 'Salt should taste like the sea'],
        durationMinutes: 10,
        active: false,
      },
      {
        id: 'pomodoro-p2',
        title: 'Cook pasta',
        instructions: ['Add fresh pasta', 'Cook 2-3 minutes until al dente', 'Reserve 1 cup pasta water', 'Drain well'],
        durationMinutes: 3,
        active: true,
      },
      {
        id: 'pomodoro-p3',
        title: 'Combine',
        instructions: ['Toss pasta with sauce over low heat', 'Add pasta water as needed for silkiness', 'Cook 1 minute together'],
        durationMinutes: 2,
        active: true,
      },
    ],
    serve: [
      {
        id: 'pomodoro-s1',
        title: 'Plate and serve',
        instructions: ['Twirl pasta into plates', 'Top with more fresh basil', 'Drizzle with extra virgin olive oil', 'Fresh cracked black pepper', 'Grate Parmigiano-Reggiano at table'],
        durationMinutes: 2,
        active: false,
      },
    ],
  },
  ingredients: {
    sauce: [
      { item: 'Olive oil', amount: { value: 0.25, unit: 'cup', original: '1/4 cup' }, category: 'pantry' },
      { item: 'Garlic cloves', amount: { value: 4, unit: 'cloves', original: '4 cloves' }, category: 'produce' },
      { item: 'San Marzano tomatoes', amount: { value: 28, unit: 'oz', original: '28 oz can' }, category: 'pantry' },
      { item: 'Kosher salt', amount: { value: 1, unit: 'tsp', original: '1 tsp' }, category: 'spices' },
      { item: 'Sugar', amount: { value: 0.25, unit: 'tsp', original: '1/4 tsp' }, category: 'pantry' },
      { item: 'Unsalted butter', amount: { value: 2, unit: 'tbsp', original: '2 tbsp optional' }, category: 'dairy' },
      { item: 'Fresh basil', amount: { value: 1, unit: 'bunch', original: '1 bunch' }, category: 'produce' },
    ],
    pasta: [
      { item: 'Fresh pasta (spaghetti)', amount: { value: 1, unit: 'lb', original: '1 lb' }, category: 'pantry' },
      { item: 'Parmigiano-Reggiano', amount: { value: 1, unit: 'piece', original: 'for serving' }, category: 'dairy' },
      { item: 'Extra virgin olive oil', amount: { value: 1, unit: 'bottle', original: 'for drizzling' }, category: 'pantry' },
    ],
    serve: [],
  },
  tags: ['italian', 'weeknight', 'quick', 'vegetarian'],
};
