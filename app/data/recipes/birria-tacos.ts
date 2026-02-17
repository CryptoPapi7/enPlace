export const birriaTacosRecipe = {
  id: 'birria-tacos',
  title: 'Birria Tacos',
  description: 'Flavorful slow-cooked beef stew meat, served in corn tortillas dipped in consommé, fried until crispy, and topped with cheese, onion, and cilantro.',
  cuisine: 'Mexican',
  vibe: 'impress',
  emoji: '🌮',
  imageUrl: 'https://vsyibvjpwjjyvnsnyjmk.supabase.co/storage/v1/object/public/enPlace/Recipe-Images/Birria%20Tacos.avif',
  servings: 6,
  totalTimeMinutes: 300,
  prepTimeMinutes: 45,
  cookTimeMinutes: 255,
  difficulty: 'Medium',

  sections: {
    birria: [
      {
        id: 'sear-meat',
        title: 'Sear the Meat',
        instructions: [
          'Pat beef chuck and short ribs dry with paper towels. Season generously with salt and pepper.',
          'In a large Dutch oven or heavy-bottomed pot, heat olive oil over medium-high heat. Sear the beef on all sides until deeply browned. Remove beef and set aside.',
        ],
        durationMinutes: 15,
        active: true,
      },
      {
        id: 'toast-chilies',
        title: 'Toast Chiles & Aromatics',
        instructions: [
          'In the same pot, add dried chiles (guajillo, ancho, arbol) and toast for 1-2 minutes until fragrant. Be careful not to burn them.',
          'Add onion, garlic, tomatoes, and tomatillos. Sauté for 5-7 minutes until softened.',
        ],
        durationMinutes: 10,
        active: true,
      },
      {
        id: 'simmer-sauce',
        title: 'Simmer the Braising Sauce',
        instructions: [
          'Return seared beef to the pot. Add chicken broth, cider vinegar, oregano, cumin, and bay leaves. Bring to a simmer.',
          'Reduce heat to low, cover, and cook for 3-4 hours, or until beef is fork-tender.',
          'Remove beef and shred. Strain the broth (consommé) and set aside.',
        ],
        durationMinutes: 240,
        active: false,
      },
    ],
    tacos: [
      {
        id: 'assemble-fry',
        title: 'Assemble & Fry Tacos',
        instructions: [
          'Dip corn tortillas in the reserved consommé. Place a small amount of shredded birria on one half of the tortilla.',
          'Sprinkle with Oaxaca or Monterey Jack cheese. Fold the tortilla over to form a taco.',
          'In a large skillet, heat a thin layer of oil over medium-high heat. Fry the tacos for 2-3 minutes per side, until golden brown and crispy.',
        ],
        durationMinutes: 15,
        active: true,
      },
      {
        id: 'garnish',
        title: 'Garnish & Serve',
        instructions: [
          'Serve birria tacos immediately with extra consommé for dipping.',
          'Garnish with finely diced white onion, fresh cilantro, and a squeeze of lime.',
        ],
        durationMinutes: 5,
        active: true,
      },
    ],
  },

  ingredients: {
    birria: [
      { item: 'Beef chuck roast', amount: '1 kg', category: 'meat' },
      { item: 'Bone-in beef short ribs', amount: '500 g', category: 'meat' },
      { item: 'Guajillo chilies', amount: '4 dried', category: 'produce' },
      { item: 'Ancho chilies', amount: '2 dried', category: 'produce' },
      { item: 'Arbol chilies', amount: '5 dried', category: 'produce' },
      { item: 'White onion', amount: '1 large', category: 'produce' },
      { item: 'Garlic cloves', amount: '6', category: 'produce' },
      { item: 'Roma tomatoes', amount: '2', category: 'produce' },
      { item: 'Tomatillos', amount: '3', category: 'produce' },
      { item: 'Chicken broth', amount: '4 cups', category: 'pantry' },
      { item: 'Apple cider vinegar', amount: '2 tbsp', category: 'pantry' },
      { item: 'Dried oregano', amount: '1 tsp', category: 'spices' },
      { item: 'Ground cumin', amount: '0.5 tsp', category: 'spices' },
      { item: 'Bay leaves', amount: '2', category: 'spices' },
      { item: 'Olive oil', amount: '2 tbsp', category: 'pantry' },
      { item: 'Salt', amount: 'to taste', category: 'spices' },
      { item: 'Black pepper', amount: 'to taste', category: 'spices' },
    ],
    tacos: [
      { item: 'Corn tortillas', amount: '18', category: 'pantry' },
      { item: 'Oaxaca cheese', amount: '200 g shredded', category: 'dairy' },
      { item: 'White onion', amount: '0.5 diced', category: 'produce' },
      { item: 'Cilantro', amount: '0.5 bunch chopped', category: 'produce' },
      { item: 'Lime', amount: '1 cut into wedges', category: 'produce' },
      { item: 'Vegetable oil', amount: 'as needed for frying', category: 'pantry' },
    ],
  },

  chefNotes: [
    "The key to great birria is slow cooking the beef until it's incredibly tender.",
    "Don't skip dipping the tortillas in consommé before frying – it adds incredible flavor and color.",
    "Adjust the amount of dried chilies to your preferred spice level.",
  ],

  equipment: [
    'Dutch oven or large heavy-bottomed pot',
    'Food processor or blender',
    'Large skillet or comal',
    'Fine-mesh sieve',
  ],

  storage: 'Leftover birria meat and consommé can be stored separately in the refrigerator for up to 3 days, or frozen for up to 3 months.',
  
  reheating: 'Reheat birria meat in a pan with a splash of consommé. Reheat consommé gently on the stovetop.',
  
  scalingNotes: 'This recipe scales well. For a larger batch, use a bigger pot and ensure enough liquid to cover the meat.',
  
  dietary: ['dairy-free (if no cheese)', 'gluten-free (with corn tortillas)'],
};
