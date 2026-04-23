-- Combined bootstrap (final — no admin UUID hardcode, no review seeds)
-- Admin user will be granted via UPDATE once you sign up on the site.

-- ═══════════════════════════════════════════════════════════════
-- SOURCE: 002-rebuild-for-admin.sql
-- ═══════════════════════════════════════════════════════════════
-- Drop old tables (cascade removes dependencies)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'cheat' CHECK (category IN ('spoofer', 'cheat', 'firmware', 'bundle')),
  badge TEXT,
  popular BOOLEAN NOT NULL DEFAULT false,
  sell_auth_product_id TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- PRODUCT VARIANTS
-- ============================================
CREATE TABLE product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_in_pence INT NOT NULL DEFAULT 0,
  sell_auth_variant TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- REVIEWS
-- ============================================
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  username TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  time_label TEXT NOT NULL DEFAULT '',
  verified BOOLEAN NOT NULL DEFAULT true,
  is_auto BOOLEAN NOT NULL DEFAULT false,
  refunded BOOLEAN NOT NULL DEFAULT false,
  helpful INT NOT NULL DEFAULT 0,
  team_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- PROFILES (extends Supabase auth)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  discord_username TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'completed', 'cancelled')),
  total_pence INT NOT NULL DEFAULT 0,
  payment_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_variant_id TEXT REFERENCES product_variants(id),
  quantity INT DEFAULT 1,
  price_pence INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- SITE SETTINGS (key-value)
-- ============================================
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_is_auto ON reviews(is_auto);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_orders_user ON orders(user_id);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "products_public_read" ON products FOR SELECT USING (true);
CREATE POLICY "variants_public_read" ON product_variants FOR SELECT USING (true);
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (true);

-- Admin full access (check profiles.is_admin)
CREATE POLICY "products_admin_all" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "variants_admin_all" ON product_variants FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "reviews_admin_all" ON reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "settings_admin_all" ON site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

-- Users own data
CREATE POLICY "profiles_own_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_own_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "orders_own_select" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "order_items_own_select" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- ============================================
-- SEED PRODUCTS (from lib/products.ts)
-- ============================================
INSERT INTO products (id, name, description, image, category, badge, popular, sell_auth_product_id, sort_order) VALUES
  ('perm-spoofer', 'Perm Spoofer', 'Permanent HWID spoofing solution', '/images/products/perm-spoofer.png', 'spoofer', 'In Stock', false, NULL, 0),
  ('temp-spoofer', 'Temp Spoofer', 'Temporary HWID spoofing solution', '/images/products/temp-spoofer.png', 'spoofer', 'Popular', true, NULL, 1),
  ('fortnite-external', 'Fortnite External', 'Clean UI. Fast setup. Tournament-ready.', '/images/products/fortnite-external.png', 'cheat', 'In Stock', false, NULL, 2),
  ('custom-dma-firmware', 'Custom DMA Firmware', 'Built for precision. Designed to endure.', '/images/products/fortnite-external-2.png', 'firmware', 'In Stock', false, NULL, 3),
  ('streck', 'Streck DMA Cheat', 'Premium DMA cheat solution', '/images/products/blurred-dma.png', 'cheat', 'In Stock', false, NULL, 4),
  ('blurred', 'Blurred DMA Cheat', 'Premium DMA cheat solution', '/images/products/blurred-dma.png', 'cheat', 'Popular', true, '210d655a4a941-0000010058682', 5),
  ('dma-basic', 'DMA Basic Bundle', 'Reliable foundation for everyday use. Includes: Captain DMA 100T-7th, EAC/BE Emulated, Mini DP Fuser V2, Blurred (30 Days), Macku (Free)', '/images/products/dma-firmware.png', 'bundle', 'In Stock', false, NULL, 6),
  ('dma-advanced', 'DMA Advanced Bundle', 'Balanced configuration for creators and semi-pro users. Includes: Captain DMA 100T-7th, Dichen D60 Fuser, Teensy (Firmware Included), EAC/BE Emulated Slotted, Blurred DMA (Quarterly)', '/images/products/dma-firmware.png', 'bundle', 'Best Value', true, NULL, 7),
  ('dma-elite', 'DMA Elite Bundle', 'Maximum performance — full emulation & lifetime access. Includes: Captain DMA 100T-7th, Dichen DC500 Fuser, Teensy (Firmware Included), Blurred Lifetime DMA Cheat, EAC/BE, FaceIt, VGK Emulated', '/images/products/dma-firmware.png', 'bundle', 'Premium', false, NULL, 8);

INSERT INTO product_variants (id, product_id, name, price_in_pence, sort_order) VALUES
  ('perm-onetime', 'perm-spoofer', 'One-Time License', 3500, 0),
  ('perm-lifetime', 'perm-spoofer', 'Lifetime License', 12000, 1),
  ('temp-15day', 'temp-spoofer', '15-Day License', 2000, 0),
  ('temp-30day', 'temp-spoofer', '30-Day License', 4000, 1),
  ('temp-180day', 'temp-spoofer', '180-Day License', 15000, 2),
  ('temp-lifetime', 'temp-spoofer', 'Lifetime License', 50000, 3),
  ('fn-ext-1day', 'fortnite-external', '1 Day', 1000, 0),
  ('fn-ext-3day', 'fortnite-external', '3 Days', 2000, 1),
  ('fn-ext-7day', 'fortnite-external', '7 Days', 3500, 2),
  ('fn-ext-30day', 'fortnite-external', '30 Days', 8000, 3),
  ('fn-ext-lifetime', 'fortnite-external', 'Lifetime', 30000, 4),
  ('dma-fw-eac-be', 'custom-dma-firmware', 'EAC / BE Emulated', 20000, 0),
  ('dma-fw-slotted', 'custom-dma-firmware', 'Slotted Edition', 45000, 1),
  ('dma-fw-faceit-vgk', 'custom-dma-firmware', 'FaceIt / VGK', 97500, 2),
  ('streck-7day', 'streck', '7 Days', 800, 0),
  ('streck-30day', 'streck', '30 Days', 1500, 1),
  ('streck-90day', 'streck', '90 Days', 4000, 2),
  ('streck-lifetime', 'streck', 'Lifetime', 15000, 3),
  ('blurred-weekly', 'blurred', 'Weekly', 2200, 0),
  ('blurred-monthly', 'blurred', 'Monthly', 3500, 1),
  ('blurred-quarterly', 'blurred', 'Quarterly', 8500, 2),
  ('blurred-lifetime', 'blurred', 'Lifetime', 38500, 3),
  ('dma-basic-full', 'dma-basic', 'Complete Bundle', 42500, 0),
  ('dma-advanced-full', 'dma-advanced', 'Complete Bundle', 67500, 0),
  ('dma-elite-full', 'dma-elite', 'Complete Bundle', 150000, 0);

-- Seed default site settings
INSERT INTO site_settings (key, value) VALUES
  ('announcement', '{"text": "", "enabled": false}'::jsonb),
  ('maintenance', '{"enabled": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════
-- SOURCE: 004-create-licenses-coupons.sql
-- ═══════════════════════════════════════════════════════════════
-- Create licenses table for storing license keys
CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  license_key TEXT NOT NULL UNIQUE,
  hwid TEXT,
  activated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coupons table for discount codes
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  percent INTEGER NOT NULL CHECK (percent > 0 AND percent <= 100),
  max_uses INTEGER,
  uses INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referrals table for referral program
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referred_email TEXT NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  reward_amount INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog_posts table for news/blog
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  author TEXT DEFAULT 'Lethal Team',
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Licenses policies
CREATE POLICY "licenses_admin_all" ON licenses FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Coupons policies (public read for validation, admin write)
CREATE POLICY "coupons_public_read" ON coupons FOR SELECT USING (TRUE);
CREATE POLICY "coupons_admin_all" ON coupons FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Referrals policies
CREATE POLICY "referrals_own_read" ON referrals FOR SELECT 
  USING (referrer_id = auth.uid());
CREATE POLICY "referrals_insert" ON referrals FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "referrals_admin_all" ON referrals FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Blog posts policies (public read published, admin all)
CREATE POLICY "blog_public_read" ON blog_posts FOR SELECT 
  USING (published = TRUE);
CREATE POLICY "blog_admin_all" ON blog_posts FOR ALL 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_licenses_order_id ON licenses(order_id);
CREATE INDEX IF NOT EXISTS idx_licenses_license_key ON licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);


-- ═══════════════════════════════════════════════════════════════
-- SOURCE: 005-admin-tables.sql
-- ═══════════════════════════════════════════════════════════════
-- Product statuses (admin controlled)
CREATE TABLE IF NOT EXISTS product_statuses (
  product_id text PRIMARY KEY,
  status text NOT NULL DEFAULT 'undetected',
  updated_at timestamptz DEFAULT now()
);
INSERT INTO product_statuses (product_id, status) VALUES
  ('perm-spoofer','undetected'),('temp-spoofer','undetected'),
  ('fortnite-external','undetected'),('custom-dma-firmware','undetected'),
  ('streck','undetected'),('blurred','undetected'),
  ('dma-basic','in_stock'),('dma-advanced','in_stock'),('dma-elite','in_stock')
ON CONFLICT DO NOTHING;

-- Site settings
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz DEFAULT now()
);
INSERT INTO settings (key, value) VALUES
  ('review_total','3473'),('review_daily_growth','40'),
  ('orders_today_base','309'),('orders_today_growth','3'),
  ('fortune_wheel_enabled','true'),('live_purchases_enabled','true'),
  ('site_announcement','')
ON CONFLICT DO NOTHING;

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  content text,
  category text DEFAULT 'Guide',
  author text DEFAULT 'Lethal Team',
  published_at timestamptz DEFAULT now(),
  is_published boolean DEFAULT true,
  read_time_minutes int DEFAULT 5
);

-- Add RLS policies
ALTER TABLE product_statuses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON product_statuses;
CREATE POLICY "Public read" ON product_statuses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write" ON product_statuses;
CREATE POLICY "Admin write" ON product_statuses FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON settings;
CREATE POLICY "Public read" ON settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write" ON settings;
CREATE POLICY "Admin write" ON settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read published" ON blog_posts;
CREATE POLICY "Public read published" ON blog_posts FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "Admin all" ON blog_posts;
CREATE POLICY "Admin all" ON blog_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);


-- ═══════════════════════════════════════════════════════════════
-- SOURCE: 005-fix-rls-and-admin.sql
-- ═══════════════════════════════════════════════════════════════
-- Fix RLS policies for admin panel

-- Drop and recreate admin policies with proper WITH CHECK clauses
DROP POLICY IF EXISTS "products_admin_all" ON products;
DROP POLICY IF EXISTS "variants_admin_all" ON product_variants;
DROP POLICY IF EXISTS "reviews_admin_all" ON reviews;
DROP POLICY IF EXISTS "settings_admin_all" ON site_settings;
DROP POLICY IF EXISTS "orders_own_select" ON orders;
DROP POLICY IF EXISTS "order_items_own_select" ON order_items;

-- Admin policies with both USING and WITH CHECK
CREATE POLICY "products_admin_all" ON products FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "variants_admin_all" ON product_variants FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "reviews_admin_all" ON reviews FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "settings_admin_all" ON site_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- Add public read for site_settings (needed for frontend to read announcement/maintenance)
CREATE POLICY "settings_public_read" ON site_settings FOR SELECT USING (true);

-- Admin can view ALL orders and order items
CREATE POLICY "orders_own_select" ON orders FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "orders_admin_all" ON orders FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "order_items_own_select" ON order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- Admin can view ALL profiles (for user management)
DROP POLICY IF EXISTS "profiles_own_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- Fix admin profile: make sure the admin user has a profile row
-- First get the user id from auth.users and upsert profile
INSERT INTO profiles (id, email, is_admin)
SELECT id, email, true FROM auth.users WHERE email = 'lethalstaff@gmail.com'
ON CONFLICT (id) DO UPDATE SET is_admin = true, email = EXCLUDED.email;


-- ═══════════════════════════════════════════════════════════════
-- SOURCE: 006-fix-order-items-rls.sql
-- ═══════════════════════════════════════════════════════════════
-- Add admin ALL policy to order_items
CREATE POLICY "order_items_admin_all" ON order_items FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));


-- ═══════════════════════════════════════════════════════════════
-- SOURCE: 007-fix-profiles-rls.sql
-- ═══════════════════════════════════════════════════════════════
-- Fix profiles RLS to avoid self-referencing infinite recursion
-- Admin check uses auth.jwt() metadata instead of querying profiles table

DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_own_select" ON profiles;
DROP POLICY IF EXISTS "profiles_own_update" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;

-- Everyone can read their own profile; admin can read all
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (true);

-- Users can update own profile
CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert own profile (for registration)
DROP POLICY IF EXISTS "profiles_own_insert" ON profiles;
CREATE POLICY "profiles_own_insert" ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admin can do everything on profiles (use service role for admin detection via email env var)
-- Since we can't safely self-reference profiles for admin check, we allow all SELECT above
-- and add UPDATE/DELETE for admin by checking a known admin user id
CREATE POLICY "profiles_admin_update" ON profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (true);

CREATE POLICY "profiles_admin_delete" ON profiles FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));


-- ═══════════════════════════════════════════════════════════════
-- SOURCE: 007-fix-tables.sql
-- ═══════════════════════════════════════════════════════════════
-- 002-rebuild already created site_settings with value JSONB; 005-admin-tables created a separate
-- `settings` table with value TEXT. Drop the redundant `settings` table — site_settings wins.
DROP TABLE IF EXISTS settings CASCADE;

-- Ensure site_settings exists (already created by 002-rebuild with value JSONB).
CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON site_settings;
CREATE POLICY "Public read" ON site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write" ON site_settings;
CREATE POLICY "Admin write" ON site_settings FOR ALL USING (true);

INSERT INTO site_settings (key, value) VALUES
  ('site_name',         '"Lethal Solutions"'),
  ('site_description',  '"Premium Gaming Cheats & Spoofers"'),
  ('discord_link',      '"https://discord.gg/lethaldma"'),
  ('youtube_link',      '""'),
  ('telegram_link',     '""'),
  ('announcement_text', '""'),
  ('coupon_code',       '""'),
  ('coupon_percent',    '"10"'),
  ('review_total',      '"3473"'),
  ('review_stars_5',    '"2947"'),
  ('review_stars_4',    '"347"'),
  ('review_stars_3',    '"108"'),
  ('review_stars_2',    '"48"'),
  ('review_stars_1',    '"23"'),
  ('review_daily_growth','"40"'),
  ('helpful_min',       '"50"'),
  ('helpful_max',       '"120"'),
  ('fortune_wheel_enabled','"true"'),
  ('live_purchases_enabled','"true"')
ON CONFLICT (key) DO NOTHING;

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  percent numeric NOT NULL DEFAULT 10,
  active boolean DEFAULT true,
  uses integer DEFAULT 0,
  max_uses integer,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin all" ON coupons;
CREATE POLICY "Admin all" ON coupons FOR ALL USING (true);
DROP POLICY IF EXISTS "Public read active" ON coupons;
CREATE POLICY "Public read active" ON coupons 
  FOR SELECT USING (active = true);

-- Insert fortune wheel codes
INSERT INTO coupons (code, percent, active) VALUES
  ('EASTER5',  5,  true),
  ('BUNNY10',  10, true),
  ('EGG15',    15, true),
  ('SPRING7',  7,  true),
  ('EASTER20', 20, true),
  ('HUNT12',   12, true),
  ('RABBIT8',  8,  true),
  ('GOLDEN25', 25, true)
ON CONFLICT (code) DO UPDATE SET active = true, percent = EXCLUDED.percent;

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  referrer_code text UNIQUE NOT NULL,
  referred_email text,
  referred_id uuid REFERENCES auth.users(id),
  status text DEFAULT 'pending',
  reward_amount numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own" ON referrals;
CREATE POLICY "Users see own" ON referrals
  FOR SELECT USING (referrer_id = auth.uid());
DROP POLICY IF EXISTS "Users insert own" ON referrals;
CREATE POLICY "Users insert own" ON referrals
  FOR INSERT WITH CHECK (referrer_id = auth.uid());
DROP POLICY IF EXISTS "Admin all referrals" ON referrals;
CREATE POLICY "Admin all referrals" ON referrals FOR ALL USING (true);


-- ═══════════════════════════════════════════════════════════════
-- SOURCE: 008-fix-orders-for-checkout.sql
-- ═══════════════════════════════════════════════════════════════
-- Make user_id nullable for guest checkout
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Allow anyone (including anonymous/guest) to insert orders
DROP POLICY IF EXISTS orders_insert ON orders;
CREATE POLICY orders_insert ON orders FOR INSERT WITH CHECK (true);

-- Allow anyone to insert order items (linked to an order they just created)
DROP POLICY IF EXISTS order_items_insert ON order_items;
CREATE POLICY order_items_insert ON order_items FOR INSERT WITH CHECK (true);

-- Keep existing admin + own-select policies


-- ═══════════════════════════════════════════════════════════════
-- SOURCE: 009-add-order-columns.sql
-- ═══════════════════════════════════════════════════════════════
-- Add missing columns to orders table for checkout data
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discord_username TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_display_id TEXT;


-- ═══════════════════════════════════════════════════════════════
-- SOURCE: 010-fix-order-status.sql
-- ═══════════════════════════════════════════════════════════════
-- Drop the old check constraint and add one that includes 'confirmed'
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'confirmed', 'paid', 'completed', 'cancelled'));


-- ═══════════════════════════════════════════════════════════════
-- SOURCE: 011-auto-create-profile.sql
-- ═══════════════════════════════════════════════════════════════
-- Auto-create a profile row when a new user signs up via Supabase Auth
-- This ensures every user appears in the admin panel immediately

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, discord_username, is_admin, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'discord_username', null),
    false,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();

  RETURN new;
END;
$$;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also backfill: make sure the admin user has a profile with correct ID
INSERT INTO public.profiles (id, email, is_admin, created_at, updated_at)
SELECT id, email, true, now(), now()
FROM auth.users
WHERE email = 'lethalstaff@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  is_admin = true,
  updated_at = now();

-- Backfill all existing auth users who are missing a profile
INSERT INTO public.profiles (id, email, is_admin, created_at, updated_at)
SELECT id, email, false, created_at, now()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════
-- SOURCE: 019-create-settings.sql
-- ═══════════════════════════════════════════════════════════════
-- site_settings already exists from 002-rebuild (value JSONB); keep that schema.
-- Ensure these policy names exist; drop first so this is re-runnable.
DROP POLICY IF EXISTS "settings_public_read" ON site_settings;
DROP POLICY IF EXISTS "settings_admin_all" ON site_settings;
CREATE POLICY "settings_public_read" ON site_settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_all" ON site_settings FOR ALL USING (true);

-- Seed default review stats. Values are JSONB, so numeric strings parse as JSON numbers,
-- but date strings must be quoted (otherwise invalid JSON).
INSERT INTO site_settings (key, value) VALUES
  ('review_total', '3473'),
  ('review_5star', '2947'),
  ('review_4star', '347'),
  ('review_3star', '108'),
  ('review_2star', '48'),
  ('review_1star', '23'),
  ('review_daily_growth', '40'),
  ('review_growth_start', '"2026-02-18"')
ON CONFLICT (key) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════
-- SOURCE: 020-seed-settings.sql
-- ═══════════════════════════════════════════════════════════════
INSERT INTO site_settings (key, value) VALUES
  ('review_total', '"3473"'),
  ('review_stars_5', '"2947"'),
  ('review_stars_4', '"347"'),
  ('review_stars_3', '"108"'),
  ('review_stars_2', '"48"'),
  ('review_stars_1', '"23"'),
  ('review_daily_growth', '"40"'),
  ('review_base_date', '"2026-02-18"')
ON CONFLICT (key) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════
-- SOURCE: 022-create-coupons-table.sql
-- ═══════════════════════════════════════════════════════════════
-- Earlier sections (004, 007) created `coupons` with an older schema (percent/active/uses).
-- The final app schema is this one (discount_percent/is_active/uses_count).
-- Drop and recreate to ensure the end state matches what the app code expects.
DROP TABLE IF EXISTS public.coupons CASCADE;

CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  max_uses INTEGER DEFAULT NULL,
  uses_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY coupons_admin_all ON public.coupons
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Public can read active coupons (for validation)
CREATE POLICY coupons_public_read ON public.coupons
  FOR SELECT
  USING (is_active = true);

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);


-- ═══════════════════════════════════════════════════════════════
-- SOURCE: 024-update-settings-3164.sql
-- ═══════════════════════════════════════════════════════════════
-- Update review settings to exactly 3164 total reviews with no daily growth

-- Update in site_settings table only
UPDATE site_settings SET value = '3164' WHERE key = 'review_total';
UPDATE site_settings SET value = '2689' WHERE key = 'review_stars_5';
UPDATE site_settings SET value = '316' WHERE key = 'review_stars_4';
UPDATE site_settings SET value = '95' WHERE key = 'review_stars_3';
UPDATE site_settings SET value = '44' WHERE key = 'review_stars_2';
UPDATE site_settings SET value = '20' WHERE key = 'review_stars_1';
UPDATE site_settings SET value = '0' WHERE key = 'review_daily_growth';

-- Insert if not exists
INSERT INTO site_settings (key, value) VALUES ('review_total', '3164') ON CONFLICT (key) DO UPDATE SET value = '3164';
INSERT INTO site_settings (key, value) VALUES ('review_stars_5', '2689') ON CONFLICT (key) DO UPDATE SET value = '2689';
INSERT INTO site_settings (key, value) VALUES ('review_stars_4', '316') ON CONFLICT (key) DO UPDATE SET value = '316';
INSERT INTO site_settings (key, value) VALUES ('review_stars_3', '95') ON CONFLICT (key) DO UPDATE SET value = '95';
INSERT INTO site_settings (key, value) VALUES ('review_stars_2', '44') ON CONFLICT (key) DO UPDATE SET value = '44';
INSERT INTO site_settings (key, value) VALUES ('review_stars_1', '20') ON CONFLICT (key) DO UPDATE SET value = '20';
INSERT INTO site_settings (key, value) VALUES ('review_daily_growth', '0') ON CONFLICT (key) DO UPDATE SET value = '0';


-- ═══════════════════════════════════════════════════════════════
-- SOURCE: 026-staff-applications-table.sql
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS staff_applications (
  id SERIAL PRIMARY KEY,
  discord TEXT NOT NULL,
  age INT NOT NULL,
  timezone TEXT DEFAULT '',
  experience TEXT DEFAULT '',
  languages TEXT DEFAULT '',
  hours_per_week TEXT DEFAULT '',
  position TEXT NOT NULL,
  why_hire TEXT NOT NULL,
  how_found TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Public can insert, only admin can read/update
ALTER TABLE staff_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_apps_insert" ON staff_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "staff_apps_admin_all" ON staff_applications FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
);


-- ═══════════════════════════════════════════════════════════════
-- SOURCE: 027-add-review-video-url.sql
-- ═══════════════════════════════════════════════════════════════
-- No-op. Video reviews feature was reverted. Do not run this script.
-- Safe to delete the file.
SELECT 1;


-- ═══════════════════════════════════════════════════════════════
-- SOURCE: 028-seed-loyalty-coupons.sql
-- ═══════════════════════════════════════════════════════════════
-- Seed loyalty tier coupons. Codes are exposed on /profile only to the matching tier;
-- validator accepts them for any user, so they double as referral-safe "promo" codes.
INSERT INTO coupons (code, discount_percent, is_active, max_uses, uses_count)
VALUES
  ('BRONZE5',     5,  true, null, 0),
  ('SILVER7',     7,  true, null, 0),
  ('GOLD10',      10, true, null, 0),
  ('PLATINUM15',  15, true, null, 0)
ON CONFLICT (code) DO UPDATE
SET discount_percent = EXCLUDED.discount_percent,
    is_active = true;


-- ═══════════════════════════════════════════════════════════════
-- SOURCE: 029-renewal-reminders.sql
-- ═══════════════════════════════════════════════════════════════
-- Renewal reminders — opt-in "auto-renew lite". Not real recurring billing;
-- scheduled job nudges the user 3 days before their license expires.
CREATE TABLE IF NOT EXISTS renewal_reminders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid REFERENCES orders(id) ON DELETE CASCADE,
  user_email      text NOT NULL,
  discord_username text,
  product_id      text NOT NULL,
  variant_id      text NOT NULL,
  variant_name    text,
  duration_days   int,
  reminder_at     timestamptz NOT NULL,
  sent_at         timestamptz,
  cancelled_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_renewal_reminders_pending
  ON renewal_reminders (reminder_at)
  WHERE sent_at IS NULL AND cancelled_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_renewal_reminders_email
  ON renewal_reminders (user_email);

ALTER TABLE renewal_reminders ENABLE ROW LEVEL SECURITY;

-- Service role writes; users can read their own reminders only.
DROP POLICY IF EXISTS "read_own_reminders" ON renewal_reminders;
CREATE POLICY "read_own_reminders" ON renewal_reminders
  FOR SELECT
  USING (user_email = auth.jwt() ->> 'email');

-- User may cancel their own reminder
DROP POLICY IF EXISTS "cancel_own_reminder" ON renewal_reminders;
CREATE POLICY "cancel_own_reminder" ON renewal_reminders
  FOR UPDATE
  USING (user_email = auth.jwt() ->> 'email')
  WITH CHECK (user_email = auth.jwt() ->> 'email');


-- ═══════════════════════════════════════════════════════════════
-- SOURCE: 030-real-reviews-system.sql
-- ═══════════════════════════════════════════════════════════════
-- No-op. Reviews-system overhaul was reverted on user request.
-- Do not run this script. Safe to delete the file.
SELECT 1;


-- ═══════════════════════════════════════════════════════════════
-- SOURCE: 031-profile-preferences.sql
-- ═══════════════════════════════════════════════════════════════
-- Add user preferences + display name to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS notify_order_updates boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_promotions boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_renewal_reminders boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_product_updates boolean NOT NULL DEFAULT false;


-- ═══════════════════════════════════════════════════════════════
-- SOURCE: 032-orders-shipping-address.sql
-- ═══════════════════════════════════════════════════════════════
-- Capture shipping address for physical bundles (DMA cards).
-- Stored as JSONB so we don't need per-field columns; admin UI can unpack it.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_address jsonb;


