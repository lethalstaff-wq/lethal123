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
