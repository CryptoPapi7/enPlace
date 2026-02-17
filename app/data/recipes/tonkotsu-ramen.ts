export const tonkotsuRamenRecipe = {
  id: 'tonkotsu-ramen',
  title: 'Tonkotsu Ramen',
  description: 'Creamy, rich pork bone broth simmered for hours, topped with chashu, soft-boiled egg, and fresh scallions. The ultimate comfort bowl.',
  cuisine: 'Japanese',
  vibe: 'project',
  emoji: '🍜',
  imageUrl: 'https://vsyibvjpwjjyvnsnyjmk.supabase.co/storage/v1/object/public/enPlace/Recipe-Images/Tonkotsu-Ramen.avif',
  servings: 4,
  totalTimeMinutes: 480,
  prepTimeMinutes: 60,
  cookTimeMinutes: 420,
  difficulty: 'Hard',

  sections: {
    broth: [
      {
        id: 'blanch-bones',
        title: 'Blanch the bones',
        instructions: [
          'Place pork bones in a large stockpot and cover with cold water.',
          'Bring to a boil and blanch for 10 minutes to remove impurities.',
          'Drain and rinse bones thoroughly under cold water.',
          'Clean the pot and return bones to it.',
        ],
        durationMinutes: 20,
        active: true,
      },
      {
        id: 'simmer-broth',
        title: 'Start the long simmer',
        instructions: [
          'Cover bones with fresh water and bring to a boil.',
          'Add ginger, garlic, and green onions.',
          'Reduce to a gentle simmer and cook for 6-8 hours, topping up water as needed.',
          'The broth should turn milky white from the dissolved collagen.',
        ],
        durationMinutes: 360,
        active: false,
      },
      {
        id: 'fat-emulsion',
        title: 'Create the emulsion',
        instructions: [
          'In the final hour, increase heat slightly and boil vigorously.',
          'Use an immersion blender to emulsify the fat into the broth.',
          'Strain through a fine-mesh sieve into a clean pot.',
          'Season with salt and white pepper to taste.',
        ],
        durationMinutes: 20,
        active: true,
      },
    ],
    chashu: [
      {
        id: 'sear-pork',
        title: 'Sear the pork belly',
        instructions: [
          'Roll pork belly into a tight cylinder and tie with kitchen twine.',
          'Sear all sides in a hot pan until golden brown.',
          'Remove and set aside.',
        ],
        durationMinutes: 15,
        active: true,
      },
      {
        id: 'braise-chashu',
        title: 'Braise the chashu',
        instructions: [
          'In the same pan, combine soy sauce, mirin, sake, sugar, and ginger.',
          'Add pork belly and enough water to cover halfway.',
          'Simmer covered for 2 hours, turning occasionally.',
          'Let cool in liquid, then refrigerate overnight.',
        ],
        durationMinutes: 135,
        active: false,
      },
    ],
    toppings: [
      {
        id: 'soft-boiled-eggs',
        title: 'Make soft-boiled eggs',
        instructions: [
          'Bring water to a boil and gently lower in room-temperature eggs.',
          'Boil for exactly 6 minutes and 30 seconds.',
          'Transfer immediately to ice water bath.',
          'Peel carefully and marinate in soy sauce mixture for 2+ hours.',
        ],
        durationMinutes: 15,
        active: true,
      },
      {
        id: 'prepare-garnishes',
        title: 'Prep the garnishes',
        instructions: [
          'Slice green onions thinly on the bias.',
          'Rehydrate wood ear mushrooms in warm water.',
          'Slice bamboo shoots and menma.',
          'Tear nori sheets into squares.',
        ],
        durationMinutes: 15,
        active: true,
      },
    ],
    assembly: [
      {
        id: 'cook-noodles',
        title: 'Cook fresh noodles',
        instructions: [
          'Bring a large pot of water to a rolling boil.',
          'Cook fresh ramen noodles for 90 seconds until al dente.',
          'Drain and immediately divide into 4 bowls.',
        ],
        durationMinutes: 5,
        active: true,
      },
      {
        id: 'assemble-bowls',
        title: 'Assemble the ramen',
        instructions: [
          'Ladle hot broth over the noodles.',
          'Top with 2-3 slices of chashu.',
          'Add halved soft-boiled egg.',
          'Arrange mushrooms, bamboo shoots, and scallions.',
          'Tuck nori squares along the edge.',
          'Finish with a drizzle of mayu (black garlic oil) if desired.',
        ],
        durationMinutes: 5,
        active: true,
      },
    ],
  },

  ingredients: {
    broth: [
      { item: 'Pork neck bones', amount: '2 kg', category: 'meat' },
      { item: 'Pork trotters', amount: '1 kg', category: 'meat' },
      { item: 'Ginger root', amount: '100 g', category: 'produce' },
      { item: 'Garlic cloves', amount: '8', category: 'produce' },
      { item: 'Green onions', amount: '4', category: 'produce' },
      { item: 'Kosher salt', amount: 'to taste', category: 'spices' },
      { item: 'White pepper', amount: 'to taste', category: 'spices' },
    ],
    chashu: [
      { item: 'Pork belly', amount: '800 g', category: 'meat' },
      { item: 'Soy sauce', amount: '120 ml', category: 'pantry' },
      { item: 'Mirin', amount: '60 ml', category: 'pantry' },
      { item: 'Sake', amount: '60 ml', category: 'pantry' },
      { item: 'Sugar', amount: '3 tbsp', category: 'pantry' },
      { item: 'Ginger', amount: '2 slices', category: 'produce' },
    ],
    toppings: [
      { item: 'Large eggs', amount: '4', category: 'dairy' },
      { item: 'Soy sauce', amount: '60 ml', category: 'pantry' },
      { item: 'Mirin', amount: '30 ml', category: 'pantry' },
      { item: 'Green onions', amount: '6', category: 'produce' },
      { item: 'Wood ear mushrooms', amount: '30 g dried', category: 'pantry' },
      { item: 'Bamboo shoots', amount: '200 g', category: 'pantry' },
      { item: 'Nori sheets', amount: '4', category: 'pantry' },
      { item: 'Mayu (black garlic oil)', amount: 'optional', category: 'pantry' },
    ],
    assembly: [
      { item: 'Fresh ramen noodles', amount: '400 g', category: 'pantry' },
    ],
  },

  chefNotes: [
    'The key to creamy tonkotsu is the vigorous boil at the end — this emulsifies the fat',
    'Blanching bones first is crucial for a clean, white broth',
    'Make the chashu a day ahead for easier slicing and deeper flavor',
    'Fresh noodles make a huge difference — find them at Asian markets',
    'The 6:30 egg timing is precise — use a timer for perfect jammy yolks',
    'This recipe scales well — make extra broth and freeze for later',
  ],

  equipment: [
    'Large stockpot (8+ liters)',
    'Fine-mesh strainer',
    'Immersion blender',
    'Kitchen twine',
    'Timer',
  ],

  storage: 'Broth keeps 3 days refrigerated or 3 months frozen. Chashu keeps 5 days refrigerated.',
  
  reheating: 'Gently reheat broth on stovetop. Do not microwave — it will break the emulsion.',
  
  scalingNotes: 'Broth recipe scales linearly. Double the bones for 8 servings, but use 2 pots or a very large stockpot.',
  
  dietary: ['dairy-free'],
};
