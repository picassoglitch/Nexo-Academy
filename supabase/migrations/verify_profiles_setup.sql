-- ============================================================================
-- Verification Queries for Profiles Setup
-- ============================================================================
-- Run these queries in Supabase SQL Editor to verify the setup is correct
-- ============================================================================

-- 1. Check if profiles table exists and has correct structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Count users in auth.users vs public.profiles
SELECT 
  (SELECT COUNT(*) FROM auth.users) AS auth_users_count,
  (SELECT COUNT(*) FROM public.profiles) AS profiles_count,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.profiles) 
    THEN '✅ Counts match'
    ELSE '❌ Counts do not match - run backfill again'
  END AS status;

-- 3. Check for users in auth.users that are missing in profiles
SELECT 
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Expected: 0 rows (all users should be in profiles)

-- 4. Check for profiles that don't have corresponding auth.users (shouldn't happen due to FK)
SELECT 
  p.id,
  p.email,
  p.created_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL;

-- Expected: 0 rows (FK constraint prevents orphaned profiles)

-- 5. Verify triggers exist
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND (trigger_name LIKE '%user%' OR trigger_name LIKE '%profile%')
ORDER BY trigger_name;

-- Expected: 2 triggers (on_auth_user_created, on_auth_user_updated)

-- 6. Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

-- Expected: rowsecurity = true

-- 7. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

-- Expected: At least 2 policies (view own, update own)

-- 8. Sample data check - show first 5 profiles
SELECT 
  id,
  email,
  display_name,
  role,
  tier,
  email_confirmed,
  created_at,
  updated_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;

-- 9. Check indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'profiles'
ORDER BY indexname;

-- Expected: Multiple indexes including profiles_email_idx, profiles_role_idx, etc.

-- ============================================================================
-- Quick Health Check
-- ============================================================================
-- Run this to get a summary:
SELECT 
  'Profiles Table' AS check_item,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles')
    THEN '✅ Exists'
    ELSE '❌ Missing'
  END AS status
UNION ALL
SELECT 
  'User Count Match' AS check_item,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.profiles)
    THEN '✅ Match'
    ELSE '❌ Mismatch'
  END AS status
UNION ALL
SELECT 
  'Triggers Exist' AS check_item,
  CASE 
    WHEN (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public' AND trigger_name IN ('on_auth_user_created', 'on_auth_user_updated')) = 2
    THEN '✅ Both triggers exist'
    ELSE '❌ Missing triggers'
  END AS status
UNION ALL
SELECT 
  'RLS Enabled' AS check_item,
  CASE 
    WHEN (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') = true
    THEN '✅ Enabled'
    ELSE '❌ Disabled'
  END AS status;
