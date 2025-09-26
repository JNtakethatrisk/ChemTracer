-- Make user_ip nullable in all tables for authenticated users
ALTER TABLE microplastic_entries 
  ALTER COLUMN user_ip DROP NOT NULL;

ALTER TABLE user_profiles 
  ALTER COLUMN user_ip DROP NOT NULL;

ALTER TABLE pfa_entries 
  ALTER COLUMN user_ip DROP NOT NULL;
