-- ============================================================
-- FIX ALL RLS SECURITY ISSUES
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ==================== PUBLIC SCHEMA ====================

-- 1. public.fcm_tokens (also has Sensitive Columns Exposed)
ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own FCM tokens" ON public.fcm_tokens;
CREATE POLICY "Users can manage own FCM tokens"
  ON public.fcm_tokens
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. public.partner_contributions
ALTER TABLE public.partner_contributions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only authenticated users can read partner_contributions" ON public.partner_contributions;
CREATE POLICY "Only authenticated users can read partner_contributions"
  ON public.partner_contributions
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 3. public.movements
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only authenticated users can read movements" ON public.movements;
CREATE POLICY "Only authenticated users can read movements"
  ON public.movements
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 4. public.settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on settings" ON public.settings;
CREATE POLICY "Allow public read access on settings"
  ON public.settings
  FOR SELECT
  USING (true);

-- 5. public.expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only authenticated users can read expenses" ON public.expenses;
CREATE POLICY "Only authenticated users can read expenses"
  ON public.expenses
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 6. public.expense_types
ALTER TABLE public.expense_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only authenticated users can read expense_types" ON public.expense_types;
CREATE POLICY "Only authenticated users can read expense_types"
  ON public.expense_types
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 7. public.debt_service
ALTER TABLE public.debt_service ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only authenticated users can read debt_service" ON public.debt_service;
CREATE POLICY "Only authenticated users can read debt_service"
  ON public.debt_service
  FOR SELECT
  USING (auth.role() = 'authenticated');


-- ==================== STORE SCHEMA ====================

-- 8. store.themes
ALTER TABLE store.themes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on themes" ON store.themes;
CREATE POLICY "Allow public read access on themes"
  ON store.themes
  FOR SELECT
  USING (true);

-- 9. store.product_categories (already has policies, just needs RLS enabled)
ALTER TABLE store.product_categories ENABLE ROW LEVEL SECURITY;

-- 10. store.order_phone_numbers
ALTER TABLE store.order_phone_numbers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only authenticated users can read order_phone_numbers" ON store.order_phone_numbers;
CREATE POLICY "Only authenticated users can read order_phone_numbers"
  ON store.order_phone_numbers
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 11. store.wishlists (uses customer_id, not user_id)
ALTER TABLE store.wishlists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own wishlists" ON store.wishlists;
CREATE POLICY "Users can manage own wishlists"
  ON store.wishlists
  FOR ALL
  USING (auth.role() = 'authenticated');


-- ==================== ADMIN SCHEMA ====================

-- 12. admin.packaging_rules
ALTER TABLE admin.packaging_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only authenticated users can read packaging_rules" ON admin.packaging_rules;
CREATE POLICY "Only authenticated users can read packaging_rules"
  ON admin.packaging_rules
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 13. admin.packaging_rule_products
ALTER TABLE admin.packaging_rule_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only authenticated users can read packaging_rule_products" ON admin.packaging_rule_products;
CREATE POLICY "Only authenticated users can read packaging_rule_products"
  ON admin.packaging_rule_products
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 14. admin.order_material_deductions
ALTER TABLE admin.order_material_deductions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only authenticated users can read order_material_deductions" ON admin.order_material_deductions;
CREATE POLICY "Only authenticated users can read order_material_deductions"
  ON admin.order_material_deductions
  FOR SELECT
  USING (auth.role() = 'authenticated');
