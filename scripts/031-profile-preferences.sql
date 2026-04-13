-- Add user preferences + display name to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS notify_order_updates boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_promotions boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_renewal_reminders boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_product_updates boolean NOT NULL DEFAULT false;
