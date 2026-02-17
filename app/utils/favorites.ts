import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, getCurrentUser } from '../lib/supabase';
import { Alert } from 'react-native';

// Favorites system - Supabase for logged-in users, blocked for guests

export interface FavoriteRecipe {
  id: string;
  title: string;
  emoji: string;
  cuisine: string;
  time: string;
  addedAt: string;
}

const showLoginRequired = () => {
  Alert.alert(
    '🍽️ Chef\'s Privilege',
    'Favorites are reserved for our valued guests. Sign in to curate your personal collection of culinary masterpieces.',
    [
      { text: 'Maybe Later', style: 'cancel' },
      { text: 'Sign In', onPress: () => { /* Could navigate to auth */ } }
    ]
  );
};

// Check if user is logged in
async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

// Get current user ID
async function getUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}

// Load favorites from Supabase (logged-in only)
export async function loadFavorites(): Promise<FavoriteRecipe[]> {
  if (!await isAuthenticated()) {
    return [];
  }

  const userId = await getUserId();
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase favorites error:', error);
      return [];
    }

    return data.map(f => ({
      id: f.recipe_id,
      title: f.title,
      emoji: f.emoji,
      cuisine: f.cuisine || '',
      time: f.time,
      addedAt: f.created_at,
    }));
  } catch (e) {
    console.error('Failed to load favorites', e);
    return [];
  }
}

// Get favorites
export async function getFavorites(): Promise<FavoriteRecipe[]> {
  return loadFavorites();
}

// For backwards compatibility - returns empty if not logged in
export function getFavoritesSync(): FavoriteRecipe[] {
  return []; // Can't do sync with Supabase
}

// Check if recipe is favorited
export async function isFavorite(recipeId: string): Promise<boolean> {
  if (!await isAuthenticated()) {
    return false;
  }

  const userId = await getUserId();
  if (!userId) return false;

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Error checking favorite:', error);
    }

    return !!data;
  } catch (e) {
    return false;
  }
}

// Synchronous version - always returns false if can't check
export function isFavoriteSync(recipeId: string): boolean {
  return false; // Can't do sync with Supabase
}

// Add favorite (requires login)
export async function addFavorite(recipe: Omit<FavoriteRecipe, 'addedAt'>): Promise<boolean> {
  if (!await isAuthenticated()) {
    showLoginRequired();
    return false;
  }

  const userId = await getUserId();
  if (!userId) {
    showLoginRequired();
    return false;
  }

  try {
    const { error } = await supabase
      .from('favorites')
      .upsert({
        user_id: userId,
        recipe_id: recipe.id,
        title: recipe.title,
        emoji: recipe.emoji,
        cuisine: recipe.cuisine,
        time: recipe.time,
      }, {
        onConflict: 'user_id,recipe_id'
      });

    if (error) {
      console.error('Error adding favorite:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Failed to add favorite', e);
    return false;
  }
}

// Remove favorite
export async function removeFavorite(recipeId: string): Promise<boolean> {
  if (!await isAuthenticated()) {
    return false;
  }

  const userId = await getUserId();
  if (!userId) return false;

  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('recipe_id', recipeId);

    if (error) {
      console.error('Error removing favorite:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Failed to remove favorite', e);
    return false;
  }
}

// Toggle favorite
export async function toggleFavorite(recipe: Omit<FavoriteRecipe, 'addedAt'>): Promise<boolean> {
  const isFav = await isFavorite(recipe.id);

  if (isFav) {
    return await removeFavorite(recipe.id);
  } else {
    return await addFavorite(recipe);
  }
}

// Initialize (just checks auth status)
export async function initFavorites(): Promise<void> {
  // Nothing to do - Supabase handles persistence
}
