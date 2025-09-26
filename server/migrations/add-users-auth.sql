-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  google_id TEXT UNIQUE,
  picture TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add user_id to existing tables (nullable initially for migration)
ALTER TABLE microplastic_entries 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE pfa_entries 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Add unique constraint on user_profiles.user_id
ALTER TABLE user_profiles 
  DROP CONSTRAINT IF EXISTS user_profiles_user_id_unique;
ALTER TABLE user_profiles 
  ADD CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_microplastic_entries_user_id ON microplastic_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_pfa_entries_user_id ON pfa_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Note: We're keeping user_ip columns for backwards compatibility
-- They are now nullable and can be removed in a future migration
