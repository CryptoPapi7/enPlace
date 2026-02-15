import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllRecipes } from '../database/db';
import type { Recipe } from '../schemas/recipe';

// My Library system - recipes explicitly added (beyond just favorites)

export interface LibraryRecipe {
  id: string;
  title: string;
  emoji: string;
  cuisine: string;
  time: string;
  addedAt: string;
}

const LIBRARY_KEY = '@enplace_library';

// In-memory cache
let libraryCache: LibraryRecipe[] | null = null;

// Load library from AsyncStorage
export async function loadLibrary(): Promise<LibraryRecipe[]> {
  if (libraryCache !== null) {
    return libraryCache;
  }
  
  try {
    const json = await AsyncStorage.getItem(LIBRARY_KEY);
    if (json) {
      libraryCache = JSON.parse(json);
      return libraryCache;
    }
  } catch (e) {
    console.error('Failed to load library', e);
  }
  
  libraryCache = [];
  return libraryCache;
}

// Save library to AsyncStorage
async function saveLibrary(): Promise<void> {
  try {
    if (libraryCache !== null) {
      await AsyncStorage.setItem(LIBRARY_KEY, JSON.stringify(libraryCache));
    }
  } catch (e) {
    console.error('Failed to save library', e);
  }
}

// Get library (load if not cached)
export async function getLibrary(): Promise<LibraryRecipe[]> {
  return loadLibrary();
}

// Check if recipe is in library
export async function isInLibrary(recipeId: string): Promise<boolean> {
  const library = await loadLibrary();
  return library.some(r => r.id === recipeId);
}

// Add recipe to library
export async function addToLibrary(recipe: Omit<LibraryRecipe, 'addedAt'>): Promise<boolean> {
  const library = await loadLibrary();
  if (!library.some(r => r.id === recipe.id)) {
    library.push({
      ...recipe,
      addedAt: new Date().toISOString(),
    });
    await saveLibrary();
    return true;
  }
  return false;
}

// Remove from library
export async function removeFromLibrary(recipeId: string): Promise<void> {
  await loadLibrary();
  if (libraryCache) {
    libraryCache = libraryCache.filter(r => r.id !== recipeId);
    await saveLibrary();
  }
}

// Toggle library status
export async function toggleLibrary(recipe: Omit<LibraryRecipe, 'addedAt'>): Promise<boolean> {
  const library = await loadLibrary();
  const exists = library.some(r => r.id === recipe.id);
  
  if (exists) {
    await removeFromLibrary(recipe.id);
    return false;
  } else {
    return await addToLibrary(recipe);
  }
}

// Initialize on app start
export async function initLibrary(): Promise<void> {
  await loadLibrary();
}

/**
 * Get combined library: AsyncStorage library + SQLite custom recipes
 * Used by MyLibraryScreen - no UI changes, just data source
 */
export async function getMyLibraryRecipes(): Promise<LibraryRecipe[]> {
  // Load from AsyncStorage (existing library)
  const library = await loadLibrary();
  
  // Load custom recipes from SQLite
  const customRecipes = await getAllRecipes();
  
  // Convert SQLite recipes to LibraryRecipe format
  const sqliteAsLibrary: LibraryRecipe[] = customRecipes.map(r => ({
    id: r.id!,
    title: r.title,
    emoji: r.emoji || '🍽️',
    cuisine: r.cuisine || 'Custom',
    time: r.totalTime || '30 min',
    addedAt: r.createdAt?.toISOString() || new Date().toISOString(),
  }));
  
  // Combine: SQLite recipes first (newer), then library
  const combined = [...sqliteAsLibrary];
  const sqliteIds = new Set(sqliteAsLibrary.map(r => r.id));
  
  // Add library recipes that aren't from SQLite
  library.forEach(libRecipe => {
    if (!sqliteIds.has(libRecipe.id)) {
      combined.push(libRecipe);
    }
  });
  
  // Sort by added date (newest first)
  return combined.sort((a, b) => 
    new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  );
}
