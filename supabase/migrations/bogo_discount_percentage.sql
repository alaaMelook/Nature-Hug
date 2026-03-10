-- Add bogo_discount_percentage column to promo_codes table
-- Default 100 means fully free (backward compatible with existing BOGO promo codes)
ALTER TABLE store.promo_codes
ADD COLUMN IF NOT EXISTS bogo_discount_percentage INTEGER DEFAULT 100;
