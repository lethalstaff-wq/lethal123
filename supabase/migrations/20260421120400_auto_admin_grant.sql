-- Auto-grant admin to lethalstaff@gmail.com on signup, and backfill if the user already exists.
-- This replaces the trigger from 011-auto-create-profile so future signups with this email
-- are immediately promoted, without a separate manual UPDATE step.

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
    (new.email = 'lethalstaff@gmail.com'),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    is_admin = profiles.is_admin OR (EXCLUDED.email = 'lethalstaff@gmail.com'),
    updated_at = now();

  RETURN new;
END;
$$;

-- Backfill: if the owner already exists in auth.users (e.g. from a prior signup),
-- promote them now. No-op on a fresh DB.
UPDATE public.profiles
SET is_admin = true, updated_at = now()
WHERE email = 'lethalstaff@gmail.com' AND is_admin = false;
