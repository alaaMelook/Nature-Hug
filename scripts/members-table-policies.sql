-- RLS Policies for Members Table
-- Run these queries in your Supabase SQL editor

-- 1. First, check if the members table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'members';

-- 2. If the table doesn't exist, create it
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create unique index to prevent duplicate memberships
CREATE UNIQUE INDEX IF NOT EXISTS members_user_id_unique ON members(user_id);

-- 4. Enable RLS (Row Level Security)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Members can view their own record" ON members;
DROP POLICY IF EXISTS "Admins can view all members" ON members;
DROP POLICY IF EXISTS "Admins can insert members" ON members;
DROP POLICY IF EXISTS "Admins can update members" ON members;
DROP POLICY IF EXISTS "Admins can delete members" ON members;
DROP POLICY IF EXISTS "Allow authenticated users to read members" ON members;
DROP POLICY IF EXISTS "Allow authenticated users to insert members" ON members;
DROP POLICY IF EXISTS "Allow authenticated users to update members" ON members;
DROP POLICY IF EXISTS "Allow authenticated users to delete members" ON members;

-- 6. Create new policies

-- Policy 1: Allow authenticated users to read all members (for debugging)
CREATE POLICY "Allow authenticated users to read members" ON members
  FOR SELECT 
  TO authenticated
  USING (true);

-- Policy 2: Allow authenticated users to insert members (for admin setup)
CREATE POLICY "Allow authenticated users to insert members" ON members
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Policy 3: Allow authenticated users to update members (for role changes)
CREATE POLICY "Allow authenticated users to update members" ON members
  FOR UPDATE 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 4: Allow authenticated users to delete members (for admin management)
CREATE POLICY "Allow authenticated users to delete members" ON members
  FOR DELETE 
  TO authenticated
  USING (true);

-- 7. Alternative: More restrictive policies (uncomment if you want stricter security)

/*
-- More restrictive policies (uncomment these and comment out the above if you want stricter security)

-- Policy 1: Members can view their own record
CREATE POLICY "Members can view their own record" ON members
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

-- Policy 2: Admins can view all members
CREATE POLICY "Admins can view all members" ON members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM members m
      JOIN customers c ON m.user_id = c.id
      WHERE c.auth_user_id = auth.uid() AND m.role = 'admin'
    )
  );

-- Policy 3: Admins can insert members
CREATE POLICY "Admins can insert members" ON members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM members m
      JOIN customers c ON m.user_id = c.id
      WHERE c.auth_user_id = auth.uid() AND m.role = 'admin'
    )
  );

-- Policy 4: Admins can update members
CREATE POLICY "Admins can update members" ON members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM members m
      JOIN customers c ON m.user_id = c.id
      WHERE c.auth_user_id = auth.uid() AND m.role = 'admin'
    )
  );

-- Policy 5: Admins can delete members
CREATE POLICY "Admins can delete members" ON members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM members m
      JOIN customers c ON m.user_id = c.id
      WHERE c.auth_user_id = auth.uid() AND m.role = 'admin'
    )
  );
*/

-- 8. Test the policies
-- Check if you can read from the members table
SELECT * FROM members;

-- 9. Add your first admin user (replace with your actual customer ID)
-- First, find your customer ID:
SELECT id, name, email, auth_user_id 
FROM customers 
WHERE auth_user_id = auth.uid();

-- Then add to members table (replace 'your-customer-id' with the ID from above):
-- INSERT INTO members (user_id, role) VALUES (your-customer-id, 'admin');

-- 10. Verify the setup
SELECT 
  m.id as member_id,
  m.role,
  m.user_id as customer_id,
  c.name as customer_name,
  c.email as customer_email,
  c.auth_user_id
FROM members m
JOIN customers c ON m.user_id = c.id;
