import { Recipe } from './types';

export const dhalPuriRecipe: Recipe = {
  id: 'dhal-puri',
  title: 'Dhal Puri Roti',
  emoji: '🫓',
  description: 'Soft, thin flatbread stuffed with seasoned ground lentils',
  cuisine: 'Guyanese',
  difficulty: 'hard',
  totalTimeMinutes: 120,
  servings: 8,
  sections: {
    'dhal-filling': [
      {
        id: 'dhal-p1',
        title: 'Cook the split peas',
        instructions: ['Rinse split peas thoroughly', 'Cover with water by 2 inches', 'Boil until very soft (30-40 min)', 'Drain well'],
        durationMinutes: 45,
        active: false,
      },
      {
        id: 'dhal-p2',
        title: 'Grind the dhal',
        instructions: ['While still hot, grind split peas to a paste', 'Use food processor or mill', 'Should be smooth and sticky'],
        durationMinutes: 10,
        active: true,
      },
      {
        id: 'dhal-p3',
        title: 'Season the filling',
        instructions: ['Add roasted ground cumin (geera)', 'Add garlic, pepper, and salt', 'Mix thoroughly', 'Cool completely'],
        durationMinutes: 10,
        active: true,
      },
    ],
    'roti-dough': [
      {
        id: 'dhal-d1',
        title: 'Make the dough',
        instructions: ['Mix flour, baking powder, and salt', 'Add oil, mix until crumbly', 'Add warm water gradually', 'Knead 5 minutes until smooth', 'Cover and rest 30 min'],
        durationMinutes: 40,
        active: true,
      },
    ],
    assembly: [
      {
        id: 'dhal-a1',
        title: 'Stuff the rotis',
        instructions: ['Divide dough into 8 balls', 'Divide filling into 8 portions', 'Press dough flat, add filling', 'Pinch to seal completely', 'Flatten into thin circles'],
        durationMinutes: 15,
        active: true,
      },
    ],
    cooking: [
      {
        id: 'dhal-c1',
        title: 'Cook on tawa',
        instructions: ['Heat tawa or flat pan on medium', 'Cook each roti 1-2 min per side until bubbles form', 'Brush with oil, flip', 'Cook until golden spots', 'Place in covered bowl to steam'],
        durationMinutes: 15,
        active: true,
      },
    ],
  },
  ingredients: {
    'dhal-filling': [
      { item: 'Yellow split peas', amount: { value: 1, unit: 'cup', original: '1 cup' }, category: 'pantry' },
      { item: 'Ground cumin (geera)', amount: { value: 1, unit: 'tbsp', original: '1 tbsp roasted' }, category: 'spices' },
      { item: 'Garlic cloves', amount: { value: 3, unit: 'cloves', original: '3 cloves crushed' }, category: 'produce' },
      { item: 'Black pepper', amount: { value: 0.5, unit: 'tsp', original: '1/2 tsp' }, category: 'spices' },
      { item: 'Salt', amount: { value: 1, unit: 'tsp', original: '1 tsp' }, category: 'spices' },
    ],
    'roti-dough': [
      { item: 'All-purpose flour', amount: { value: 3, unit: 'cups', original: '3 cups' }, category: 'pantry' },
      { item: 'Baking powder', amount: { value: 2, unit: 'tsp', original: '2 tsp' }, category: 'pantry' },
      { item: 'Salt', amount: { value: 1, unit: 'tsp', original: '1 tsp' }, category: 'spices' },
      { item: 'Vegetable oil', amount: { value: 2, unit: 'tbsp', original: '2 tbsp' }, category: 'pantry' },
      { item: 'Warm water', amount: { value: 1.25, unit: 'cups', original: '1 1/4 cups' }, category: 'pantry' },
      { item: 'Oil for cooking', amount: { value: 0.5, unit: 'cup', original: '1/2 cup' }, category: 'pantry' },
    ],
    assembly: [],
    cooking: [],
  },
  tags: ['roti', 'bread', 'vegetarian', 'showoff'],
};
