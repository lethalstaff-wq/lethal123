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
