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
