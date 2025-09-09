/*
  # Add location tracking fields to profiles table

  1. Changes
    - Add `location_accuracy` column for GPS accuracy
    - Add `nearby_enabled` column to track toggle state
    - Update existing location columns if needed

  2. Security
    - Maintain existing RLS policies
    - Add indexes for efficient location queries
*/

-- Add location accuracy column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_accuracy real;

-- Add nearby enabled column to track toggle state
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nearby_enabled boolean DEFAULT false;

-- Create index for nearby enabled users
CREATE INDEX IF NOT EXISTS profiles_nearby_enabled_idx ON profiles (nearby_enabled) WHERE nearby_enabled = true;

-- Create compound index for location queries with nearby enabled
CREATE INDEX IF NOT EXISTS profiles_nearby_location_idx ON profiles (
  nearby_enabled,
  ROUND(latitude::numeric, 2), 
  ROUND(longitude::numeric, 2)
) WHERE nearby_enabled = true AND latitude IS NOT NULL AND longitude IS NOT NULL;