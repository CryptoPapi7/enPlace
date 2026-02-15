import * as SQLite from 'expo-sqlite';
import type { Recipe } from '../schemas/recipe';

// Database singleton
let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('enplace.db');
    await initDatabase();
  }
  return db;
}

async function initDatabase(): Promise<void> {
  if (!db) return;

  // Create recipes table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      emoji TEXT DEFAULT '🍽️',
      cuisine TEXT,
      difficulty TEXT DEFAULT 'Medium',
      prep_time TEXT,
      cook_time TEXT,
      total_time TEXT,
      servings TEXT DEFAULT '4 servings',
      ingredients TEXT NOT NULL, -- JSON array
      instructions TEXT NOT NULL, -- JSON array
      tags TEXT DEFAULT '[]', -- JSON array
      image TEXT,
      source TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    );
  `);
}

/**
 * Generate a UUID for new recipes
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Save a new recipe to the database
 */
export async function saveRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recipe> {
  const database = await getDatabase();
  const id = generateUUID();
  const now = Date.now();

  await database.runAsync(
    `INSERT INTO recipes (
      id, title, description, emoji, cuisine, difficulty,
      prep_time, cook_time, total_time, servings,
      ingredients, instructions, tags, image, source,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      recipe.title,
      recipe.description || '',
      recipe.emoji || '🍽️',
      recipe.cuisine || '',
      recipe.difficulty || 'Medium',
      recipe.prepTime || '',
      recipe.cookTime || '',
      recipe.totalTime || '',
      recipe.servings || '4 servings',
      JSON.stringify(recipe.ingredients),
      JSON.stringify(recipe.instructions),
      JSON.stringify(recipe.tags || []),
      recipe.image || '',
      recipe.source || '',
      now,
      now,
    ]
  );

  return {
    ...recipe,
    id,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  };
}

/**
 * Get all recipes (newest first)
 */
export async function getAllRecipes(): Promise<Recipe[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<any>(
    'SELECT * FROM recipes ORDER BY created_at DESC'
  );

  return rows.map(rowToRecipe);
}

/**
 * Get a single recipe by ID
 */
export async function getRecipeById(id: string): Promise<Recipe | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<any>(
    'SELECT * FROM recipes WHERE id = ?',
    [id]
  );

  return row ? rowToRecipe(row) : null;
}

/**
 * Delete a recipe
 */
export async function deleteRecipe(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM recipes WHERE id = ?', [id]);
}

/**
 * Update a recipe
 */
export async function updateRecipe(id: string, updates: Partial<Recipe>): Promise<void> {
  const database = await getDatabase();
  const now = Date.now();

  const setClauses: string[] = [];
  const values: any[] = [];

  if (updates.title !== undefined) {
    setClauses.push('title = ?');
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    setClauses.push('description = ?');
    values.push(updates.description);
  }
  if (updates.emoji !== undefined) {
    setClauses.push('emoji = ?');
    values.push(updates.emoji);
  }
  if (updates.cuisine !== undefined) {
    setClauses.push('cuisine = ?');
    values.push(updates.cuisine);
  }
  if (updates.difficulty !== undefined) {
    setClauses.push('difficulty = ?');
    values.push(updates.difficulty);
  }
  if (updates.prepTime !== undefined) {
    setClauses.push('prep_time = ?');
    values.push(updates.prepTime);
  }
  if (updates.cookTime !== undefined) {
    setClauses.push('cook_time = ?');
    values.push(updates.cookTime);
  }
  if (updates.totalTime !== undefined) {
    setClauses.push('total_time = ?');
    values.push(updates.totalTime);
  }
  if (updates.servings !== undefined) {
    setClauses.push('servings = ?');
    values.push(updates.servings);
  }
  if (updates.ingredients !== undefined) {
    setClauses.push('ingredients = ?');
    values.push(JSON.stringify(updates.ingredients));
  }
  if (updates.instructions !== undefined) {
    setClauses.push('instructions = ?');
    values.push(JSON.stringify(updates.instructions));
  }
  if (updates.tags !== undefined) {
    setClauses.push('tags = ?');
    values.push(JSON.stringify(updates.tags));
  }
  if (updates.image !== undefined) {
    setClauses.push('image = ?');
    values.push(updates.image);
  }

  setClauses.push('updated_at = ?');
  values.push(now);
  values.push(id);

  await database.runAsync(
    `UPDATE recipes SET ${setClauses.join(', ')} WHERE id = ?`,
    values
  );
}

/**
 * Search recipes by title
 */
export async function searchRecipes(query: string): Promise<Recipe[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<any>(
    'SELECT * FROM recipes WHERE title LIKE ? ORDER BY created_at DESC',
    [`%${query}%`]
  );

  return rows.map(rowToRecipe);
}

/**
 * Convert database row to Recipe object
 */
function rowToRecipe(row: any): Recipe {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    emoji: row.emoji,
    cuisine: row.cuisine || undefined,
    difficulty: row.difficulty as 'Easy' | 'Medium' | 'Hard',
    prepTime: row.prep_time || undefined,
    cookTime: row.cook_time || undefined,
    totalTime: row.total_time || undefined,
    servings: row.servings,
    ingredients: JSON.parse(row.ingredients),
    instructions: JSON.parse(row.instructions),
    tags: JSON.parse(row.tags),
    image: row.image || undefined,
    source: row.source || undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
