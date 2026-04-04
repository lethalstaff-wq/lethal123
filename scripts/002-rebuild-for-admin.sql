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
