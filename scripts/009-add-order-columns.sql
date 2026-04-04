-- Add missing columns to orders table for checkout data
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discord_username TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_display_id TEXT;
