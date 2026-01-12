-- ============================================================================
-- Supabase Profiles Mirror Table Migration
-- ============================================================================
-- This migration creates a public.profiles table that automatically syncs
-- with auth.users using database triggers. This is the standard Supabase pattern
-- for managing user data in your application tables.
--
-- Run this in Supabase SQL Editor or via Supabase CLI:
--   supabase db push
-- ============================================================================

-- Step 1: Create the public.profiles table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' NOT NULL,
  tier INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- Synced fields from auth.users
  email_confirmed BOOLEAN DEFAULT false NOT NULL,
  email_confirmed_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  CONSTRAINT profiles_email_key UNIQUE (email)
);

-- Step 2: Create indexes for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_tier_idx ON public.profiles(tier);
CREATE INDEX IF NOT EXISTS profiles_email_confirmed_idx ON public.profiles(email_confirmed);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles(created_at);

-- Step 3: Create trigger function to sync auth.users → public.profiles
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    display_name,
    phone,
    role,
    tier,
    email_confirmed,
    email_confirmed_at,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE((NEW.raw_user_meta_data->>'tier')::INTEGER, 0),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    NEW.email_confirmed_at,
    NEW.last_sign_in_at,
    COALESCE(NEW.created_at, NOW()),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    role = COALESCE(EXCLUDED.role, public.profiles.role),
    tier = COALESCE(EXCLUDED.tier, public.profiles.tier),
    email_confirmed = EXCLUDED.email_confirmed,
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    last_sign_in_at = EXCLUDED.last_sign_in_at,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Step 4: Create trigger function to update profiles on auth.users changes
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    email = COALESCE(NEW.email, public.profiles.email),
    display_name = COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      public.profiles.display_name
    ),
    phone = COALESCE(NEW.raw_user_meta_data->>'phone', public.profiles.phone),
    role = COALESCE(NEW.raw_user_meta_data->>'role', public.profiles.role),
    tier = COALESCE((NEW.raw_user_meta_data->>'tier')::INTEGER, public.profiles.tier),
    email_confirmed = COALESCE(NEW.email_confirmed_at IS NOT NULL, public.profiles.email_confirmed),
    email_confirmed_at = COALESCE(NEW.email_confirmed_at, public.profiles.email_confirmed_at),
    last_sign_in_at = COALESCE(NEW.last_sign_in_at, public.profiles.last_sign_in_at),
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Step 5: Create triggers
-- ============================================================================
-- Trigger on INSERT into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger on UPDATE of auth.users
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email, raw_user_meta_data, email_confirmed_at, last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email 
        OR OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data
        OR OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at
        OR OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.handle_user_update();

-- Step 6: Backfill existing auth.users into public.profiles
-- ============================================================================
-- This is idempotent - safe to run multiple times
INSERT INTO public.profiles (
  id,
  email,
  display_name,
  phone,
  role,
  tier,
  email_confirmed,
  email_confirmed_at,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  u.id,
  COALESCE(u.email, ''),
  COALESCE(
    u.raw_user_meta_data->>'display_name',
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    NULL
  ) AS display_name,
  u.raw_user_meta_data->>'phone' AS phone,
  COALESCE(u.raw_user_meta_data->>'role', 'user') AS role,
  COALESCE((u.raw_user_meta_data->>'tier')::INTEGER, 0) AS tier,
  COALESCE(u.email_confirmed_at IS NOT NULL, false) AS email_confirmed,
  u.email_confirmed_at,
  u.last_sign_in_at,
  COALESCE(u.created_at, NOW()) AS created_at,
  NOW() AS updated_at
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
  phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
  role = COALESCE(EXCLUDED.role, public.profiles.role),
  tier = COALESCE(EXCLUDED.tier, public.profiles.tier),
  email_confirmed = EXCLUDED.email_confirmed,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  last_sign_in_at = EXCLUDED.last_sign_in_at,
  updated_at = NOW();

-- Step 7: Enable Row Level Security (RLS)
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS Policies
-- ============================================================================

-- Policy: Users can SELECT their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can UPDATE their own profile (except role and tier - admin only)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Service role can do everything (for server-side admin operations)
-- Note: This is handled via service_role key in server code, not via RLS
-- RLS policies don't apply to service_role key, so no policy needed

-- Policy: Admin users can view all profiles (if using JWT claims)
-- Uncomment if you want to use JWT claims for admin access:
-- DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
-- CREATE POLICY "Admins can view all profiles"
--   ON public.profiles
--   FOR SELECT
--   USING (
--     (auth.jwt() ->> 'role')::text = 'admin'
--     OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin'
--   );

-- Step 9: Grant necessary permissions
-- ============================================================================
-- Allow authenticated users to read their own profile
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated;

-- Allow service role full access (for admin operations)
GRANT ALL ON public.profiles TO service_role;

-- ============================================================================
-- Migration Complete!
-- ============================================================================
-- Next steps:
-- 1. Verify the migration: Run the verification queries below
-- 2. Update your app code to query public.profiles instead of auth.users
-- 3. Use service_role key for admin operations (server-side only)
-- ============================================================================
