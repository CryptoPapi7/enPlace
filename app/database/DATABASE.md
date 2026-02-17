# enPlace Database Guide

This document outlines the database schemas for both Supabase (remote backend) and SQLite (local persistence), as well as their roles and interactions within the enPlace application.

## 1. Supabase Database

Supabase serves as the primary backend for enPlace, handling user authentication, profiles, user-generated recipes, reviews, social interactions (follows), and user favorites. The schema is managed by Supabase's PostgreSQL instance.

### Full SQL Schema

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  theme TEXT DEFAULT 'default',
  unit_system TEXT DEFAULT 'metric',
  default_servings INTEGER DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipes table
CREATE TABLE recipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '🍽️',
  cuisine TEXT,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  prep_time TEXT,
  cook_time TEXT,
  total_time TEXT NOT NULL,
  servings TEXT NOT NULL,
  ingredients JSONB NOT NULL,
  instructions JSONB NOT NULL,
  tags JSONB DEFAULT '[]',
  image_url TEXT,
  is_public BOOLEAN DEFAULT false,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follows table
CREATE TABLE follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES profiles ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Favorites table
CREATE TABLE favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  recipe_id TEXT NOT NULL,
  title TEXT NOT NULL,
  emoji TEXT DEFAULT '🍽️',
  cuisine TEXT,
  time TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Indexes
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_cuisine ON recipes(cuisine);
CREATE INDEX idx_reviews_recipe_id ON reviews(recipe_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_recipe_id ON favorites(recipe_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Recipes policies
CREATE POLICY "Recipes are viewable by everyone"
  ON recipes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create recipes"
  ON recipes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON recipes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Follows are viewable by everyone"
  ON follows FOR SELECT USING (true);

CREATE POLICY "Users can follow others"
  ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Favorites policies
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their favorites"
  ON favorites FOR DELETE USING (auth.uid() = user_id);
```

### Tables:

#### `profiles`
Extends Supabase's `auth.users` table, storing additional user-specific information.
- `id` (UUID, PK): References `auth.users.id`.
- `username` (Text, Nullable): Unique username for the user.
- `display_name` (Text, Nullable): User's preferred display name.
- `full_name` (Text, Nullable): User's full name.
- `avatar_url` (Text, Nullable): URL to the user's avatar image.
- `bio` (Text, Nullable): Short description or bio for the user.
- `theme` (Text, Nullable): Stores the user's preferred theme ('default', 'michelin').
- `unit_system` (Text, Nullable): User's preferred unit system ('metric', 'imperial', 'baker').
- `default_servings` (Integer, Nullable): Default number of servings for recipes (default: 4).
- `created_at` (Timestamp, Not Null): Timestamp of profile creation.
- `updated_at` (Timestamp, Not Null): Timestamp of last profile update.

#### `recipes`
Stores all user-generated recipes. This is for shared/public recipes when a user is logged in.
- `id` (UUID, PK): Unique identifier for the recipe.
- `user_id` (UUID, FK): References `profiles.id` (creator of the recipe).
- `title` (Text, Not Null): Name of the recipe.
- `description` (Text, Nullable): Detailed description of the recipe.
- `emoji` (Text): Emoji representing the recipe (default '🍽️').
- `cuisine` (Text, Nullable): Cuisine type (e.g., 'Italian', 'Indian').
- `difficulty` (Enum: 'Easy', 'Medium', 'Hard'): Difficulty level.
- `prep_time` (Text, Nullable): Preparation time.
- `cook_time` (Text, Nullable): Cooking time.
- `total_time` (Text, Not Null): Total time required.
- `servings` (Text, Not Null): Number of servings.
- `ingredients` (JSON, Not Null): JSON array of ingredients.
- `instructions` (JSON, Not Null): JSON array of cooking instructions.
- `tags` (JSON): JSON array of tags associated with the recipe (default '[]').
- `image_url` (Text, Nullable): URL to the recipe's main image.
- `is_public` (Boolean): Indicates if the recipe is public or private.
- `source` (Text, Nullable): Original source of the recipe (e.g., website URL).
- `created_at` (Timestamp, Not Null): Timestamp of recipe creation.
- `updated_at` (Timestamp, Not Null): Timestamp of last recipe update.

#### `reviews`
Stores user reviews and ratings for recipes.
- `id` (UUID, PK): Unique identifier for the review.
- `recipe_id` (UUID, FK): References `recipes.id`.
- `user_id` (UUID, FK): References `profiles.id` (reviewer).
- `rating` (Integer, Not Null): Rating for the recipe (e.g., 1-5 stars).
- `comment` (Text, Nullable): Optional comment from the reviewer.
- `created_at` (Timestamp, Not Null): Timestamp of review creation.
- `updated_at` (Timestamp, Not Null): Timestamp of last review update.

#### `follows`
Manages the social following graph between users.
- `id` (UUID, PK): Unique identifier for the follow relationship.
- `follower_id` (UUID, FK): References `profiles.id` (the user who is following).
- `following_id` (UUID, FK): References `profiles.id` (the user being followed).
- `created_at` (Timestamp, Not Null): Timestamp when the follow relationship was established.

#### `favorites`
Stores user's favorite/bookmarked recipes with denormalized metadata for quick display.
- `id` (UUID, PK): Unique identifier for the favorite.
- `user_id` (UUID, FK): References `auth.users.id` (owner of the favorite).
- `recipe_id` (Text, Not Null): Recipe identifier (can reference local or remote recipes).
- `title` (Text, Not Null): Denormalized recipe title for quick display.
- `emoji` (Text): Emoji representing the recipe (default '🍽️').
- `cuisine` (Text, Nullable): Cuisine type.
- `time` (Text, Nullable): Total cooking time.
- `created_at` (Timestamp, Not Null): Timestamp when the favorite was added.

## 2. SQLite Database

SQLite is used for local data persistence, primarily for anonymous users or caching data to provide offline capabilities and faster access. The SQLite database file is `enplace.db`.

### Tables:

#### `recipes`
Stores locally created or cached recipes. This table has a similar structure to the Supabase `recipes` table but is managed entirely client-side.
- `id` (Text, PK): Unique identifier for the recipe (UUID generated locally).
- `title` (Text, Not Null)
- `description` (Text)
- `emoji` (Text)
- `cuisine` (Text)
- `difficulty` (Text)
- `prep_time` (Text)
- `cook_time` (Text)
- `total_time` (Text)
- `servings` (Text)
- `ingredients` (Text, Not Null): JSON string of ingredients.
- `instructions` (Text, Not Null): JSON string of instructions.
- `tags` (Text): JSON string of tags.
- `image` (Text): Local path or URL to image.
- `source` (Text)
- `created_at` (Integer): Unix timestamp.
- `updated_at` (Integer): Unix timestamp.

#### `preferences`
Stores various application preferences, particularly for anonymous users.
- `key` (Text, PK): Unique key for the preference.
- `value` (Text, Not Null): The stored preference value (JSON string).

**Used for:**
- `user_settings`: JSON containing `{ unitSystem: string, defaultServings: number }` when logged out.
- `app_theme`: Theme preference when logged out.
- `last_viewed_recipe`: Recently viewed recipe tracking.

## 3. Database Interaction and Roles

The enPlace app intelligently switches between Supabase and SQLite depending on the user's authentication status and the type of data being accessed.

### Authentication State Matrix

| Feature | Logged In (Supabase) | Logged Out (SQLite) |
|---------|---------------------|---------------------|
| **Theme** | `profiles.theme` | `preferences` table |
| **Unit System** | `profiles.unit_system` | `preferences` table |
| **Default Servings** | `profiles.default_servings` | `preferences` table |
| **Favorites** | `favorites` table | Not available (shows "Chef's Privilege" message) |
| **User Recipes** | `recipes` table | `recipes` table |
| **Reviews** | `reviews` table | Not available |
| **Follows** | `follows` table | Not available |

### Key Patterns

- **Settings Persistence** (`utils/settings.ts`):
  - Loads from Supabase `profiles` table when logged in
  - Falls back to SQLite `preferences` table when logged out
  - Shows "Chef's Privilege" message for guests attempting to save settings

- **Favorites System** (`utils/favorites.ts`):
  - Requires authentication (guests see login prompt)
  - Stored in `favorites` table with RLS policies
  - Displays in MyLibraryScreen horizontal scroll

- **Theme Provider** (`providers/ThemeProvider.tsx`):
  - Listens to auth state directly via `supabase.auth.onAuthStateChange`
  - Persists to appropriate database based on auth status
  - Avoids circular dependency by not importing `useAuth()`

## 4. Migrations

Migration files are stored in `/supabase/migrations/`:

- `001_initial_schema.sql` — Initial tables
- `002_add_theme_to_profiles.sql` — Added theme column
- `003_add_favorites.sql` — Added favorites table

To apply migrations:
1. Go to Supabase Dashboard → SQL Editor
2. Copy migration file contents
3. Run SQL

Or use Supabase CLI:
```bash
supabase db push
```
