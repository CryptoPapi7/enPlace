export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          theme: string | null;
          unit_system: string | null;
          default_servings: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          theme?: string | null;
          unit_system?: string | null;
          default_servings?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          display_name?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          theme?: string | null;
          unit_system?: string | null;
          default_servings?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      recipes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          emoji: string;
          cuisine: string | null;
          difficulty: 'Easy' | 'Medium' | 'Hard';
          prep_time: string | null;
          cook_time: string | null;
          total_time: string;
          servings: string;
          ingredients: Json;
          instructions: Json;
          tags: Json;
          image_url: string | null;
          is_public: boolean;
          source: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          emoji?: string;
          cuisine?: string | null;
          difficulty?: 'Easy' | 'Medium' | 'Hard';
          prep_time?: string | null;
          cook_time?: string | null;
          total_time?: string;
          servings?: string;
          ingredients?: Json;
          instructions?: Json;
          tags?: Json;
          image_url?: string | null;
          is_public?: boolean;
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          emoji?: string;
          cuisine?: string | null;
          difficulty?: 'Easy' | 'Medium' | 'Hard';
          prep_time?: string | null;
          cook_time?: string | null;
          total_time?: string;
          servings?: string;
          ingredients?: Json;
          instructions?: Json;
          tags?: Json;
          image_url?: string | null;
          is_public?: boolean;
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          recipe_id: string;
          user_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          user_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          user_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          recipe_id: string;
          title: string;
          emoji: string;
          cuisine: string | null;
          time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          recipe_id: string;
          title: string;
          emoji: string;
          cuisine?: string | null;
          time: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          recipe_id?: string;
          title?: string;
          emoji?: string;
          cuisine?: string | null;
          time?: string;
          created_at?: string;
        };
      };
    };
  };
}
