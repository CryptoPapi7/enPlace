import { Recipe } from './types';

export const doublesRecipe: Recipe = {
  id: 'doubles',
  title: 'Trinidadian Doubles',
  emoji: '🫓',
  description: 'Fried flatbread stuffed with curried chickpeas, tamarind chutney, and pepper sauce',
  cuisine: 'Trinidadian',
  difficulty: 'medium',
  totalTimeMinutes: 90,
  servings: 6,
  sections: {
    channa: [
      {
        id: 'doubles-c1',
        title: 'Soak chickpeas (night before)',
        instructions: ['Rinse dried chickpeas', 'Cover with water and soak overnight', 'Or use canned chickpeas (rinse and drain)'],
        durationMinutes: 0,
        active: false,
      },
      {
        id: 'doubles-c2',
        title: 'Cook chickpeas',
        instructions: ['Drain soaked chickpeas', 'Cover with fresh water', 'Boil for 45 min until tender', 'Drain and set aside'],
        durationMinutes: 50,
        active: false,
      },
      {
        id: 'doubles-c3',
        title: 'Curry the chickpeas',
        instructions: ['Heat oil in a large pot', 'Sauté garlic and geera', 'Add curry powder and bloomed 1 min', 'Add chickpeas and toss to coat', 'Add water and simmer 15 min', 'Mash some chickpeas for texture'],
        durationMinutes: 20,
        active: true,
      },
    ],
    bara: [
      {
        id: 'doubles-b1',
        title: 'Make the dough',
        instructions: ['Mix flour, baking powder, salt, and turmeric', 'Add water gradually', 'Knead until smooth', 'Rest 15 minutes'],
        durationMinutes: 20,
        active: true,
      },
      {
        id: 'doubles-b2',
        title: 'Fry the bara',
        instructions: ['Heat oil to 350°F', 'Oil hands to prevent sticking', 'Form small balls of dough', 'Flatten into thin circles', 'Fry 30 seconds per side until puffy', 'Drain on paper towels'],
        durationMinutes: 20,
        active: true,
      },
    ],
    toppings: [
      {
        id: 'doubles-t1',
        title: 'Prepare toppings',
        instructions: ['Slice cucumbers thin', 'Chop chadon beni/cilantro', 'Make tamarind chutney if using', 'Have pepper sauce ready'],
        durationMinutes: 10,
        active: true,
      },
    ],
    assembly: [
      {
        id: 'doubles-a1',
        title: 'Assemble doubles',
        instructions: ['Place two bara overlapping slightly', 'Add scoop of curried chickpeas', 'Top with chutney', 'Add cucumber slices', 'Drizzle with pepper sauce', 'Sprinkle with chadon beni', 'Fold and serve immediately'],
        durationMinutes: 10,
        active: true,
      },
    ],
  },
  ingredients: {
    channa: [
      { item: 'Dried chickpeas', amount: { value: 2, unit: 'cups', original: '2 cups' }, category: 'pantry' },
      { item: 'Vegetable oil', amount: { value: 3, unit: 'tbsp', original: '3 tbsp' }, category: 'pantry' },
      { item: 'Garlic cloves', amount: { value: 4, unit: 'cloves', original: '4 cloves' }, category: 'produce' },
      { item: 'Geera (cumin)', amount: { value: 1, unit: 'tsp', original: '1 tsp' }, category: 'spices' },
      { item: 'Curry powder', amount: { value: 2, unit: 'tbsp', original: '2 tbsp' }, category: 'spices' },
      { item: 'Water', amount: { value: 2, unit: 'cups', original: '2 cups' }, category: 'pantry' },
      { item: 'Salt', amount: { value: 1, unit: 'tsp', original: '1 tsp' }, category: 'spices' },
    ],
    bara: [
      { item: 'All-purpose flour', amount: { value: 3, unit: 'cups', original: '3 cups' }, category: 'pantry' },
      { item: 'Baking powder', amount: { value: 2, unit: 'tsp', original: '2 tsp' }, category: 'pantry' },
      { item: 'Salt', amount: { value: 1, unit: 'tsp', original: '1 tsp' }, category: 'spices' },
      { item: 'Turmeric powder', amount: { value: 0.5, unit: 'tsp', original: '1/2 tsp' }, category: 'spices' },
      { item: 'Warm water', amount: { value: 1.25, unit: 'cups', original: '1 1/4 cups' }, category: 'pantry' },
      { item: 'Vegetable oil for frying', amount: { value: 1, unit: 'quart', original: '1 quart' }, category: 'pantry' },
    ],
    toppings: [
      { item: 'Tamarind chutney', amount: { value: 0.5, unit: 'cup', original: '1/2 cup' }, category: 'pantry' },
      { item: 'Cucumber', amount: { value: 2, unit: 'medium', original: '2 medium' }, category: 'produce' },
      { item: 'Chadon beni/cilantro', amount: { value: 0.5, unit: 'bunch', original: '1/2 bunch' }, category: 'produce' },
      { item: 'Hot pepper sauce', amount: { value: 1, unit: 'bottle', original: 'to taste' }, category: 'pantry' },
    ],
    assembly: [],
  },
  tags: ['street-food', 'fried', 'vegetarian', 'authentic'],
};
