-- Migration: Convert promo_codes.bazaar_id (single integer) to bazaar_ids (integer array)
-- This allows assigning a promo code to multiple bazaars

-- 1. Add the new bazaar_ids column
ALTER TABLE store.promo_codes
ADD COLUMN IF NOT EXISTS bazaar_ids INTEGER[] DEFAULT '{}';

-- 2. Migrate existing data: copy bazaar_id into bazaar_ids array
UPDATE store.promo_codes
SET bazaar_ids = ARRAY[bazaar_id]
WHERE bazaar_id IS NOT NULL;

-- 3. Drop the old foreign key constraint and index
ALTER TABLE store.promo_codes
DROP CONSTRAINT IF EXISTS promo_codes_bazaar_id_fkey;

DROP INDEX IF EXISTS store.idx_promo_codes_bazaar_id;

-- 4. Drop the old column
ALTER TABLE store.promo_codes
DROP COLUMN IF EXISTS bazaar_id;

-- 5. Create a GIN index on the new array column for efficient lookups
CREATE INDEX IF NOT EXISTS idx_promo_codes_bazaar_ids ON store.promo_codes USING GIN (bazaar_ids);
