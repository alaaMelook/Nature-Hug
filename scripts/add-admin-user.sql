-- Add Admin User Script
-- Run these queries in your Supabase SQL editor

-- 1. Check your current user ID
SELECT auth.uid() as current_user_id;

-- 2. Find your customer record
SELECT 
  id as customer_id,
  name,
  email,
  auth_user_id
FROM customers 
WHERE auth_user_id = auth.uid();

-- 3. Check if you already have a member record
SELECT 
  m.id as member_id,
  m.role,
  m.user_id as customer_id,
  c.name as customer_name
FROM members m
JOIN customers c ON m.user_id = c.id
WHERE c.auth_user_id = auth.uid();

-- 4. Add yourself as admin (replace 'CUSTOMER_ID_FROM_STEP_2' with the actual ID)
-- INSERT INTO members (user_id, role) VALUES (CUSTOMER_ID_FROM_STEP_2, 'admin');

-- 5. Verify the admin user was added
SELECT 
  m.id as member_id,
  m.role,
  m.user_id as customer_id,
  c.name as customer_name,
  c.email as customer_email,
  m.created_at
FROM members m
JOIN customers c ON m.user_id = c.id
WHERE m.role = 'admin';

-- 6. Test the admin access query
SELECT 
  u.id as auth_user_id,
  u.email as auth_email,
  c.id as customer_id,
  c.name as customer_name,
  m.id as member_id,
  m.role as member_role
FROM auth.users u
JOIN customers c ON c.auth_user_id = u.id
JOIN members m ON m.user_id = c.id
WHERE u.id = auth.uid() AND m.role = 'admin';