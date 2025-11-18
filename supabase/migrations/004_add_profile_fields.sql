-- ============================================================================
-- Migration: Add profile fields for location, skills, social_links
-- Version: 004
-- ============================================================================

-- Add location column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location VARCHAR(100);

-- Add skills array column (for simple skill storage without proficiency)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';

-- Add social_links JSONB column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles (location);
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON profiles USING GIN (skills);

-- Add comments
COMMENT ON COLUMN profiles.location IS 'User location (city, country)';
COMMENT ON COLUMN profiles.skills IS 'User skills array for simple storage';
COMMENT ON COLUMN profiles.social_links IS 'Social media links (github, linkedin, twitter)';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
