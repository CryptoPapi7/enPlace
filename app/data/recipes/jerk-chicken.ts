import { Recipe } from './types';

export const jerkChickenRecipe: Recipe = {
  id: 'jerk-chicken',
  title: 'Jamaican Jerk Chicken',
  emoji: '🍗',
  description: 'Spicy, smoky grilled chicken with authentic Jamaican jerk marinade',
  cuisine: 'Jamaican',
  difficulty: 'medium',
  totalTimeMinutes: 180,
  servings: 4,
  sections: {
    marinade: [
      {
        id: 'jerk-m1',
        title: 'Make jerk paste',
        instructions: ['Blend all marinade ingredients until smooth', 'Scotch bonnet is very spicy - handle carefully', 'Taste and adjust heat/seasoning'],
        durationMinutes: 10,
        active: true,
      },
      {
        id: 'jerk-m2',
        title: 'Marinate chicken',
        instructions: ['Score chicken thighs deeply', 'Rub marinade all over, under skin', 'Cover and refrigerate minimum 4 hours', 'Overnight is best'],
        durationMinutes: 10,
        active: true,
      },
    ],
    grilling: [
      {
        id: 'jerk-g1',
        title: 'Prepare grill',
        instructions: ['Soak pimento wood or allspice berries in water', 'Prepare charcoal for indirect heat', 'Add soaked wood for smoke flavor'],
        durationMinutes: 20,
        active: true,
      },
      {
        id: 'jerk-g2',
        title: 'Grill chicken',
        instructions: ['Place chicken skin-side up on cool side', 'Cover and cook 45-60 min', 'Flip once, cook until charred', 'Internal temp 165°F'],
        durationMinutes: 60,
        active: false,
      },
      {
        id: 'jerk-g3',
        title: 'Rest and serve',
        instructions: ['Let chicken rest 10 minutes', 'Serve with rice and peas, festival bread', 'Garnish with fresh thyme'],
        durationMinutes: 10,
        active: false,
      },
    ],
  },
  ingredients: {
    marinade: [
      { item: 'Chicken thighs', amount: { value: 2, unit: 'lbs', original: '2 lbs bone-in' }, category: 'meat' },
      { item: 'Scotch bonnet peppers', amount: { value: 2, unit: 'peppers', original: '2 peppers' }, category: 'produce' },
      { item: 'Scallions (green onions)', amount: { value: 4, unit: 'stalks', original: '4 stalks' }, category: 'produce' },
      { item: 'Fresh ginger', amount: { value: 2, unit: 'inch', original: '2 inch piece' }, category: 'produce' },
      { item: 'Garlic cloves', amount: { value: 4, unit: 'cloves', original: '4 cloves' }, category: 'produce' },
      { item: 'Fresh thyme', amount: { value: 6, unit: 'sprigs', original: '6 sprigs' }, category: 'produce' },
      { item: 'Soy sauce', amount: { value: 0.25, unit: 'cup', original: '1/4 cup' }, category: 'pantry' },
      { item: 'Allspice (ground)', amount: { value: 1, unit: 'tbsp', original: '1 tbsp' }, category: 'spices' },
      { item: 'Cinnamon', amount: { value: 0.5, unit: 'tsp', original: '1/2 tsp' }, category: 'spices' },
      { item: 'Nutmeg', amount: { value: 0.5, unit: 'tsp', original: '1/2 tsp' }, category: 'spices' },
      { item: 'Brown sugar', amount: { value: 2, unit: 'tbsp', original: '2 tbsp' }, category: 'pantry' },
      { item: 'Lime juice', amount: { value: 2, unit: 'tbsp', original: '2 tbsp' }, category: 'produce' },
      { item: 'Vegetable oil', amount: { value: 2, unit: 'tbsp', original: '2 tbsp' }, category: 'pantry' },
      { item: 'Salt', amount: { value: 1.5, unit: 'tsp', original: '1.5 tsp' }, category: 'spices' },
      { item: 'Black pepper', amount: { value: 0.5, unit: 'tsp', original: '1/2 tsp' }, category: 'spices' },
    ],
    grilling: [
      { item: 'Pimento wood or allspice berries', amount: { value: 1, unit: 'cup', original: 'for smoke' }, category: 'pantry' },
      { item: 'Charcoal', amount: { value: 1, unit: 'bag', original: 'as needed' }, category: 'pantry' },
    ],
  },
  tags: ['grilled', 'spicy', 'jamaican', 'caribbean', 'weekend'],
};
