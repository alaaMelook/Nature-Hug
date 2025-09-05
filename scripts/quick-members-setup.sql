-- Quick Setup for Members Table
-- Run these queries one by one in your Supabase SQL editor

-- 1. Create members table if it doesn't exist
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS members_user_id_unique ON members(user_id);

-- 3. Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- 4. Drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read members" ON members;
DROP POLICY IF EXISTS "Allow authenticated users to insert members" ON members;
DROP POLICY IF EXISTS "Allow authenticated users to update members" ON members;
DROP POLICY IF EXISTS "Allow authenticated users to delete members" ON members;

-- 5. Create permissive policies (for development/testing)
CREATE POLICY "Allow authenticated users to read members" ON members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert members" ON members
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update members" ON members
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete members" ON members
  FOR DELETE TO authenticated USING (true);

-- 6. Test access
SELECT 'Members table created successfully' as status;
SELECT COUNT(*) as member_count FROM members;
