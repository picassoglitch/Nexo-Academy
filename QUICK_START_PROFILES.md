# Quick Start: Profiles Table Setup

## 🚀 3-Step Setup

### Step 1: Run Migration

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy the entire contents of `supabase/migrations/create_profiles_table.sql`
3. Paste and **Run** the SQL

### Step 2: Verify

1. In **Supabase Dashboard** → **Table Editor**
2. Select schema: **`public`** (not `auth`)
3. Select table: **`profiles`**
4. You should see all your users!

### Step 3: Test

1. Visit `/admin/usuarios` - should show users from `public.profiles`
2. Create a new test account - should auto-appear in `profiles` table
3. Check Supabase Table Editor - new user should be there

## ✅ Done!

Your admin dashboard now queries `public.profiles` which automatically syncs with `auth.users`.

## 📋 What Changed

- ✅ Created `public.profiles` table
- ✅ Added triggers to auto-sync `auth.users` → `public.profiles`
- ✅ Backfilled existing users
- ✅ Updated admin page to use `public.profiles`
- ✅ Added RLS policies for security

## 🔍 Verification

Run this in SQL Editor to verify:

```sql
-- Should show matching counts
SELECT 
  (SELECT COUNT(*) FROM auth.users) AS auth_count,
  (SELECT COUNT(*) FROM public.profiles) AS profiles_count;
```

Both counts should match!

## 🐛 Issues?

See `PROFILES_SETUP.md` for detailed troubleshooting.
