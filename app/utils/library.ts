import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Get library + favorites combined (for My Library view)
import { getFavorites, FavoriteRecipe } from './favorites';

export async function getMyLibraryRecipes(): Promise<(LibraryRecipe | FavoriteRecipe)[]> {
  const [library, favorites] = await Promise.all([
    loadLibrary(),
    getFavorites()
  ]);
  
  // Combine and dedupe by id
  const combined = [...library];
  const libraryIds = new Set(library.map(r => r.id));
  
  // Add favorites that aren't already in library
  favorites.forEach(fav => {
    if (!libraryIds.has(fav.id)) {
      combined.push(fav);
    }
  });
  
  // Sort by added date (newest first)
  return combined.sort((a, b) => 
    new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  );
}
