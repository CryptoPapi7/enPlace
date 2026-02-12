import AsyncStorage from '@react-native-async-storage/async-storage';

// Favorites system - AsyncStorage persistence

export interface FavoriteRecipe {
  id: string;
  title: string;
  emoji: string;
  cuisine: string;
  time: string;
  addedAt: string;
}

const FAVORITES_KEY = '@enplace_favorites';

// In-memory cache for quick access
let favoritesCache: FavoriteRecipe[] | null = null;

// Load favorites from AsyncStorage
export async function loadFavorites(): Promise<FavoriteRecipe[]> {
  if (favoritesCache !== null) {
    return favoritesCache;
  }
  
  try {
    const json = await AsyncStorage.getItem(FAVORITES_KEY);
    if (json) {
      favoritesCache = JSON.parse(json);
      return favoritesCache;
    }
  } catch (e) {
    console.error('Failed to load favorites', e);
  }
  
  favoritesCache = [];
  return favoritesCache;
}

// Save favorites to AsyncStorage
async function saveFavorites(): Promise<void> {
  try {
    if (favoritesCache !== null) {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritesCache));
    }
  } catch (e) {
    console.error('Failed to save favorites', e);
  }
}

// Get favorites (load if not cached)
export async function getFavorites(): Promise<FavoriteRecipe[]> {
  return loadFavorites();
}

// Synchronous version for components that already loaded
export function getFavoritesSync(): FavoriteRecipe[] {
  return favoritesCache || [];
}

export async function isFavorite(recipeId: string): Promise<boolean> {
  const favorites = await loadFavorites();
  return favorites.some(f => f.id === recipeId);
}

// Synchronous version for UI checks
export function isFavoriteSync(recipeId: string): boolean {
  return favoritesCache?.some(f => f.id === recipeId) || false;
}

export async function addFavorite(recipe: Omit<FavoriteRecipe, 'addedAt'>): Promise<void> {
  const favorites = await loadFavorites();
  if (!favorites.some(f => f.id === recipe.id)) {
    favorites.push({
      ...recipe,
      addedAt: new Date().toISOString(),
    });
    await saveFavorites();
  }
}

export async function removeFavorite(recipeId: string): Promise<void> {
  await loadFavorites();
  if (favoritesCache) {
    favoritesCache = favoritesCache.filter(f => f.id !== recipeId);
    await saveFavorites();
  }
}

export async function toggleFavorite(recipe: Omit<FavoriteRecipe, 'addedAt'>): Promise<boolean> {
  const favorites = await loadFavorites();
  const exists = favorites.some(f => f.id === recipe.id);
  
  if (exists) {
    await removeFavorite(recipe.id);
    return false;
  } else {
    await addFavorite(recipe);
    return true;
  }
}

// Initialize favorites on app start
export async function initFavorites(): Promise<void> {
  await loadFavorites();
}
