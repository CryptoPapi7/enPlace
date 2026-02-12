export const streetTacosRecipe = {
  id: 'tacos',
  title: 'Street Tacos',
  description: 'Authentic Mexican street-style tacos with charred tortillas and fresh toppings',
  cuisine: 'Mexican',
  vibe: 'quick',
  emoji: '🌮',
  servings: 4,
  totalTimeMinutes: 30,
  prepTimeMinutes: 15,
  cookTimeMinutes: 15,
  difficulty: 'Easy',
  
  sections: {
    meat: [
      {
        id: 'prep-meat',
        title: 'Prep the protein',
        instructions: ['Season meat with cumin, oregano, garlic, salt. Let sit 10 minutes.'],
        durationMinutes: 10,
        active: true,
      },
      {
        id: 'cook-meat',
        title: 'High-heat sear',
        instructions: ['Sear meat in batches. Get good char. Rest 5 minutes, then chop.'],
        durationMinutes: 10,
        active: true,
      },
    ],
    tortillas: [
      {
        id: 'char-tortillas',
        title: 'Char the tortillas',
        instructions: ['Heat tortillas directly over flame or in dry pan until blistered and charred. Keep warm in towel.'],
        durationMinutes: 5,
        active: true,
      },
    ],
    toppings: [
      {
        id: 'prep-onion',
        title: 'Quick-pickle onions',
        instructions: ['Mix diced onion with lime juice and pinch of salt. Let pickle while meat cooks.'],
        durationMinutes: 5,
        active: true,
      },
    ],
    assemble: [
      {
        id: 'build-tacos',
        title: 'Build your tacos',
        instructions: ['Double up tortillas (street style!), add meat, top with onion, cilantro, salsa verde. Lime wedge essential.'],
        durationMinutes: 5,
        active: true,
      },
    ],
  },
  
  ingredients: {
    meat: [
      { item: 'Skirt steak or chicken thighs', amount: '500g', category: 'meat' },
      { item: 'Ground cumin', amount: '1 tsp', category: 'spices' },
      { item: 'Dried oregano', amount: '1 tsp', category: 'spices' },
      { item: 'Garlic powder', amount: '1/2 tsp', category: 'spices' },
      { item: 'Salt', amount: '1 tsp', category: 'spices' },
      { item: 'Vegetable oil', amount: '2 tbsp', category: 'pantry' },
    ],
    tortillas: [
      { item: 'Corn tortillas', amount: '16 small', category: 'pantry' },
    ],
    toppings: [
      { item: 'White onion', amount: '1/2', category: 'produce' },
      { item: 'Fresh cilantro', amount: '1 bunch', category: 'produce' },
      { item: 'Limes', amount: '3', category: 'produce' },
      { item: 'Salsa verde', amount: '1/2 cup', category: 'pantry' },
      { item: 'Salt', amount: 'pinch', category: 'spices' },
    ],
  },
  
  chefNotes: [
    'Double tortillas = authentic street style',
    'Char matters - embrace the black spots',
    'Rest meat before chopping or juices run',
    'Warm tortillas are flexible, cold ones crack',
    'Pickled onion cuts richness perfectly',
  ],
  
  tags: ['mexican', 'tacos', 'quick', 'street-food', 'weeknight'],
};
