-- Create bundles table
CREATE TABLE IF NOT EXISTS store.bundles (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  category_id     INTEGER REFERENCES store.categories(id) ON DELETE SET NULL,
  image           TEXT,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','hidden')),
  bundle_type     TEXT NOT NULL DEFAULT 'fixed' CHECK (bundle_type IN ('fixed','build_your_own','mix_and_match')),
  pricing_type    TEXT NOT NULL DEFAULT 'fixed_price' CHECK (pricing_type IN ('fixed_price','percentage_discount','fixed_amount_discount')),
  discount_value  NUMERIC(10,2) DEFAULT 0,
  fixed_price     NUMERIC(10,2) DEFAULT 0,
  featured        BOOLEAN DEFAULT false,
  visible_home    BOOLEAN DEFAULT false,
  visible_category BOOLEAN DEFAULT false,
  visible_bundle_collection BOOLEAN DEFAULT true,
  display_order   INTEGER DEFAULT 0,
  rules           JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Create bundle_items table
CREATE TABLE IF NOT EXISTS store.bundle_items (
  id          SERIAL PRIMARY KEY,
  bundle_id   INTEGER NOT NULL REFERENCES store.bundles(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES store.products(id) ON DELETE CASCADE,
  variant_id  INTEGER REFERENCES store.product_variants(id) ON DELETE SET NULL,
  quantity    INTEGER NOT NULL DEFAULT 1,
  notes       TEXT,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle_id ON store.bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundles_category_id ON store.bundles(category_id);
CREATE INDEX IF NOT EXISTS idx_bundles_status ON store.bundles(status);

-- ============================================================
-- GRANT PERMISSIONS
-- Fix: permission denied for sequence bundles_id_seq
-- ============================================================

-- Grant table permissions to all roles
GRANT ALL ON store.bundles TO anon, authenticated, service_role;
GRANT ALL ON store.bundle_items TO anon, authenticated, service_role;

-- Grant sequence permissions (fixes "permission denied for sequence bundles_id_seq")
GRANT ALL ON SEQUENCE store.bundles_id_seq TO anon, authenticated, service_role;
GRANT ALL ON SEQUENCE store.bundle_items_id_seq TO anon, authenticated, service_role;

