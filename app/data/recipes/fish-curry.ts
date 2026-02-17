import { Recipe } from './types';

export const fishCurryRecipe: Recipe = {
  id: 'fish-curry',
  title: 'Caribbean Fish Curry',
  emoji: '🐟',
  imageUrl: 'https://vsyibvjpwjjyvnsnyjmk.supabase.co/storage/v1/object/public/enPlace/Recipe-Images/Caribbean%20Fish%20Curry.avif',
  description: 'Spiced white fish in creamy coconut curry sauce',
  cuisine: 'Trinidadian',
  difficulty: 'easy',
  totalTimeMinutes: 45,
  servings: 4,
  sections: {
    prep: [
      {
        id: 'fish-p1',
        title: 'Cut and season fish',
        instructions: ['Cut fish into 3-inch pieces', 'Rub with salt, black pepper, and lime juice', 'Set aside for 10 minutes'],
        durationMinutes: 15,
        active: true,
      },
    ],
    curry: [
      {
        id: 'fish-1',
        title: 'Make curry paste',
        instructions: ['Blend onion, garlic, ginger, and hot pepper until smooth', 'Add 2 tbsp water to help blend'],
        durationMinutes: 5,
        active: true,
      },
      {
        id: 'fish-2',
        title: 'Sauté aromatics',
        instructions: ['Heat oil in a deep pan', 'Add curry powder and toast 30 seconds', 'Add blended paste, cook 3 minutes'],
        durationMinutes: 5,
        active: true,
      },
      {
        id: 'fish-3',
        title: 'Build sauce',
        instructions: ['Add tomatoes, cook until soft', 'Add coconut milk and water', 'Bring to a gentle simmer'],
        durationMinutes: 5,
        active: true,
      },
      {
        id: 'fish-4',
        title: 'Add fish',
        instructions: ['Season sauce with salt and amchar masala', 'Gently place fish in sauce', 'Spoon sauce over fish', 'Cover and simmer 12-15 minutes'],
        durationMinutes: 15,
        active: false,
      },
      {
        id: 'fish-5',
        title: 'Garnish and serve',
        instructions: ['Add shadow beni/bandhania', 'Squeeze fresh lime over top', 'Serve with rice or roti'],
        durationMinutes: 5,
        active: false,
      },
    ],
  },
  ingredients: {
    prep: [
      { item: 'White fish (snapper/cod)', amount: { value: 1.5, unit: 'lbs', original: '1.5 lbs' }, category: 'meat' },
      { item: 'Salt', amount: { value: 1, unit: 'tsp', original: '1 tsp' }, category: 'spices' },
      { item: 'Black pepper', amount: { value: 0.5, unit: 'tsp', original: '1/2 tsp' }, category: 'spices' },
      { item: 'Lime juice', amount: { value: 1, unit: 'tbsp', original: '1 tbsp' }, category: 'produce' },
    ],
    curry: [
      { item: 'Onion', amount: { value: 1, unit: 'large', original: '1 large' }, category: 'produce' },
      { item: 'Garlic cloves', amount: { value: 4, unit: 'cloves', original: '4 cloves' }, category: 'produce' },
      { item: 'Ginger', amount: { value: 1, unit: 'inch', original: '1 inch piece' }, category: 'produce' },
      { item: 'Hot pepper (scotch bonnet)', amount: { value: 0.5, unit: 'pepper', original: '1/2 pepper' }, category: 'produce' },
      { item: 'Vegetable oil', amount: { value: 2, unit: 'tbsp', original: '2 tbsp' }, category: 'pantry' },
      { item: 'Curry powder', amount: { value: 2, unit: 'tbsp', original: '2 tbsp' }, category: 'spices' },
      { item: 'Tomato', amount: { value: 2, unit: 'medium', original: '2 medium' }, category: 'produce' },
      { item: 'Coconut milk', amount: { value: 14, unit: 'oz', original: '14 oz can' }, category: 'pantry' },
      { item: 'Water', amount: { value: 0.5, unit: 'cup', original: '1/2 cup' }, category: 'pantry' },
      { item: 'Amchar masala', amount: { value: 1, unit: 'tsp', original: '1 tsp' }, category: 'spices' },
      { item: 'Shadow beni/bandhania', amount: { value: 0.25, unit: 'cup', original: '1/4 cup chopped' }, category: 'produce' },
      { item: 'Lime', amount: { value: 1, unit: 'lime', original: '1 lime' }, category: 'produce' },
    ],
  },
  tags: ['seafood', 'weeknight', 'healthy', 'coconut'],
};
