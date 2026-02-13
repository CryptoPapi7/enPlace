import AsyncStorage from '@react-native-async-storage/async-storage';

const GENERATED_RECIPES_KEY = '@enplace_generated_recipes';

export interface GeneratedRecipe {
  id: string;
  title: string;
  description: string;
  emoji: string;
  cuisine: string;
  difficulty: 'easy' | 'medium' | 'hard';
  totalTime: number;
  servings: number;
  ingredients: {
    main: Array<{
      item: string;
      amount: {
        value: number;
        unit: string;
        original: string;
      };
      category: string;
    }>;
  };
  sections: {
    prep?: Array<{ text: string; highlight?: boolean }>;
    cook?: Array<{ text: string; highlight?: boolean }>;
  };
  source: string;
  generatedFrom?: string;
  createdAt: string;
}

// Save a generated/imported recipe
export async function saveGeneratedRecipe(recipe: Partial<GeneratedRecipe>): Promise<string> {
  const recipes = await getGeneratedRecipes();
  
  const newRecipe: GeneratedRecipe = {
    id: recipe.id || `gen-${Date.now()}`,
    title: recipe.title || 'Untitled Recipe',
    description: recipe.description || '',
    emoji: recipe.emoji || '🍽️',
    cuisine: recipe.cuisine || 'International',
    difficulty: recipe.difficulty || 'medium',
    totalTime: recipe.totalTime || 30,
    servings: recipe.servings || 4,
    ingredients: recipe.ingredients || { main: [] },
    sections: recipe.sections || {},
    source: recipe.source || 'generated',
    generatedFrom: recipe.generatedFrom,
    createdAt: new Date().toISOString(),
  };
  
  recipes.push(newRecipe);
  await AsyncStorage.setItem(GENERATED_RECIPES_KEY, JSON.stringify(recipes));
  
  return newRecipe.id;
}

// Get all generated recipes
export async function getGeneratedRecipes(): Promise<GeneratedRecipe[]> {
  try {
    const json = await AsyncStorage.getItem(GENERATED_RECIPES_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Failed to load generated recipes:', e);
    return [];
  }
}

// Check if a recipe is user-created
export async function isUserCreated(recipeId: string): Promise<boolean> {
  const recipes = await getGeneratedRecipes();
  return recipes.some(r => r.id === recipeId);
}

// Delete a generated recipe
export async function deleteGeneratedRecipe(recipeId: string): Promise<void> {
  const recipes = await getGeneratedRecipes();
  const filtered = recipes.filter(r => r.id !== recipeId);
  await AsyncStorage.setItem(GENERATED_RECIPES_KEY, JSON.stringify(filtered));
}

// Generate a real recipe using GPT API (placeholder for now)
export async function generateRecipeWithGPT(prompt: string): Promise<GeneratedRecipe | null> {
  // This would call OpenAI API in production
  // For now, return a mock recipe
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    id: `gen-${Date.now()}`,
    title: generateTitle(prompt),
    description: `A delicious ${prompt} recipe`,
    emoji: '🍽️',
    cuisine: detectCuisine(prompt),
    difficulty: 'medium',
    totalTime: Math.floor(Math.random() * 40) + 20,
    servings: 4,
    ingredients: {
      main: [
        { item: 'Main ingredient', amount: { value: 1, unit: 'lb', original: '1 lb' }, category: 'main' },
        { item: 'Vegetables', amount: { value: 2, unit: 'cups', original: '2 cups' }, category: 'main' },
        { item: 'Seasonings', amount: { value: 1, unit: 'tsp', original: '1 tsp' }, category: 'spices' },
      ]
    },
    sections: {
      prep: [
        { text: 'Prepare all ingredients', highlight: true },
        { text: 'Wash and chop vegetables' },
      ],
      cook: [
        { text: 'Heat pan over medium heat' },
        { text: 'Cook until done' },
        { text: 'Serve and enjoy!' },
      ]
    },
    source: 'ai-generated',
    generatedFrom: prompt,
    createdAt: new Date().toISOString(),
  };
}

// Helper functions
function generateTitle(prompt: string): string {
  const words = prompt.toLowerCase().split(' ');
  const important = words.filter(w => w.length > 3).slice(0, 3);
  return important.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Custom Recipe';
}

function detectCuisine(prompt: string): string {
  const cuisines: Record<string, string[]> = {
    'Italian': ['italian', 'pasta', 'pizza', 'risotto', 'carbonara'],
    'Thai': ['thai', 'curry', 'pad thai', 'lemongrass'],
    'Mexican': ['mexican', 'taco', 'burrito', 'enchilada', 'salsa'],
    'Indian': ['indian', 'curry', 'masala', 'tikka', 'naan'],
    'Chinese': ['chinese', 'stir fry', 'noodle', 'dumpling', 'wok'],
    'Japanese': ['japanese', 'sushi', 'ramen', 'teriyaki', 'miso'],
    'French': ['french', 'ratatouille', 'coq au vin', 'bouillabaisse'],
    'American': ['american', 'burger', 'bbq', 'comfort food', 'casserole'],
    'Mediterranean': ['mediterranean', 'greek', 'hummus', 'falafel', 'olive'],
  };
  
  const lower = prompt.toLowerCase();
  for (const [cuisine, keywords] of Object.entries(cuisines)) {
    if (keywords.some(k => lower.includes(k))) return cuisine;
  }
  return 'International';
}
