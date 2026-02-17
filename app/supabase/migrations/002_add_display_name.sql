-- Add display_name (chef nickname) to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
