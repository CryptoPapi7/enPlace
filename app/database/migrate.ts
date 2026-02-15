import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllRecipes, saveRecipe } from './db';
import { parseImportedRecipe } from '../schemas/recipe';

const MIGRATION_KEY = 'asyncStorageMigrated_v1';

/**
 * One-time migration from AsyncStorage to SQLite
 * Call this on app startup
 */
export async function migrateFromAsyncStorage(): Promise<{
  migrated: number;
  failed: number;
  alreadyMigrated: boolean;
}> {
  // Check if already migrated
  const alreadyMigrated = await AsyncStorage.getItem(MIGRATION_KEY);
  if (alreadyMigrated === 'true') {
    return { migrated: 0, failed: 0, alreadyMigrated: true };
  }

  let migrated = 0;
  let failed = 0;

  try {
    // Migrate custom recipes
    const customRecipesJson = await AsyncStorage.getItem('customRecipes');
    if (customRecipesJson) {
      const customRecipes = JSON.parse(customRecipesJson);
      
      for (const oldRecipe of customRecipes) {
        try {
          // Check if already exists in SQLite (by title + created date)
          const existing = await getAllRecipes();
          const exists = existing.some(r => 
            r.title === oldRecipe.title && 
            r.source === oldRecipe.source
          );
          
          if (exists) {
            continue; // Skip duplicates
          }

          // Normalize and validate
          const normalized = {
            title: oldRecipe.title || 'Untitled Recipe',
            description: oldRecipe.description || '',
            emoji: oldRecipe.emoji || '🍽️',
            cuisine: oldRecipe.cuisine || '',
            difficulty: oldRecipe.difficulty || 'Medium',
            prepTime: oldRecipe.prepTime || '',
            cookTime: oldRecipe.cookTime || '',
            totalTime: oldRecipe.totalTime || oldRecipe.time || '30 minutes',
            servings: oldRecipe.servings || '4 servings',
            ingredients: Array.isArray(oldRecipe.ingredients) 
              ? oldRecipe.ingredients 
              : [],
            instructions: Array.isArray(oldRecipe.instructions) 
              ? oldRecipe.instructions 
              : (oldRecipe.steps || []),
            tags: oldRecipe.tags || [],
            image: oldRecipe.image || '',
            source: oldRecipe.source || '',
          };

          // Validate with Zod before saving
          const validation = parseImportedRecipe(normalized);
          
          if (validation.success) {
            await saveRecipe(validation.data);
            migrated++;
          } else {
            console.warn('Recipe validation failed:', validation.errors);
            failed++;
          }
        } catch (err) {
          console.error('Failed to migrate recipe:', oldRecipe.title, err);
          failed++;
        }
      }
    }

    // Migrate favorites (optional - can add later)
    const favoritesJson = await AsyncStorage.getItem('favoriteRecipes');
    if (favoritesJson) {
      // For now, just log - can implement favorite migration later
      console.log('Found favorites:', JSON.parse(favoritesJson).length);
    }

    // Mark as migrated
    await AsyncStorage.setItem(MIGRATION_KEY, 'true');
    
    console.log(`Migration complete: ${migrated} migrated, ${failed} failed`);
    
    return { migrated, failed, alreadyMigrated: false };
  } catch (error) {
    console.error('Migration error:', error);
    return { migrated, failed, alreadyMigrated: false };
  }
}

/**
 * Check if migration has been run
 */
export async function hasMigrationRun(): Promise<boolean> {
  const status = await AsyncStorage.getItem(MIGRATION_KEY);
  return status === 'true';
}

/**
 * Reset migration flag (for testing)
 */
export async function resetMigration(): Promise<void> {
  await AsyncStorage.removeItem(MIGRATION_KEY);
}
