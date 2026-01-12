# Supabase Profiles Mirror Table Setup

## Overview

This setup implements the standard Supabase pattern where `auth.users` is automatically synced to a `public.profiles` table using database triggers. This allows your admin dashboard and application to query user data from a public table while keeping authentication secure.

## ✅ What This Does

1. **Creates `public.profiles` table** that mirrors `auth.users`
2. **Automatic sync via triggers** - When a user is created/updated in `auth.users`, `public.profiles` is automatically updated
3. **Backfills existing users** - All existing `auth.users` are copied to `public.profiles`
4. **RLS policies** - Users can only view/update their own profile
5. **Admin access** - Server-side endpoints use service_role key to query all profiles

## 🚀 Setup Instructions

### Step 1: Run the Migration

Open Supabase Dashboard → SQL Editor and run the migration:

```bash
# Option 1: Via Supabase Dashboard
# 1. Go to SQL Editor
# 2. Copy contents of supabase/migrations/create_profiles_table.sql
# 3. Run the SQL

# Option 2: Via Supabase CLI (if you have it set up)
supabase db push
```

**File to run:** `supabase/migrations/create_profiles_table.sql`

### Step 2: Verify the Setup

Run the verification queries in Supabase SQL Editor:

```bash
# Copy contents of supabase/migrations/verify_profiles_setup.sql
# Run in SQL Editor
```

**Expected results:**
- ✅ Profiles table exists with correct columns
- ✅ User counts match (auth.users = public.profiles)
- ✅ No orphaned profiles
- ✅ Triggers exist (on_auth_user_created, on_auth_user_updated)
- ✅ RLS is enabled
- ✅ RLS policies exist

### Step 3: Update Your App Code

The admin page (`app/admin/usuarios/page.tsx`) has been updated to:
- Query `public.profiles` instead of Prisma User table
- Use service_role key for admin access (server-side only)
- Map `display_name` → `name` for component compatibility
- Fetch orders from Prisma (since profiles doesn't have orders)

## 📊 Table Structure

```sql
public.profiles
├── id (UUID, PK, references auth.users(id))
├── email (TEXT, UNIQUE)
├── display_name (TEXT, nullable)
├── phone (TEXT, nullable)
├── role (TEXT, default 'user')
├── tier (INTEGER, default 0)
├── email_confirmed (BOOLEAN, default false)
├── email_confirmed_at (TIMESTAMPTZ, nullable)
├── last_sign_in_at (TIMESTAMPTZ, nullable)
├── created_at (TIMESTAMPTZ, default NOW())
└── updated_at (TIMESTAMPTZ, default NOW())
```

## 🔄 How It Works

### Automatic Sync

1. **User signs up** → `auth.users` INSERT → Trigger fires → `public.profiles` INSERT
2. **User updates email** → `auth.users` UPDATE → Trigger fires → `public.profiles` UPDATE
3. **User signs in** → `auth.users.last_sign_in_at` UPDATE → Trigger fires → `public.profiles.last_sign_in_at` UPDATE

### Data Flow

```
auth.users (Supabase Auth)
    ↓ [Database Triggers]
public.profiles (Your App Table)
    ↓ [Service Role Key]
Admin Dashboard API
    ↓ [Server-Side Only]
Admin Dashboard UI
```

## 🔒 Security

### Row Level Security (RLS)

- ✅ **Enabled** on `public.profiles`
- ✅ Users can **SELECT** their own profile (`auth.uid() = id`)
- ✅ Users can **UPDATE** their own profile (except role/tier - admin only)
- ✅ **Service role** bypasses RLS (for admin operations)

### Admin Access

- ✅ Admin endpoints use **service_role key** (server-side only)
- ✅ **Never expose** service_role key to client
- ✅ Admin check via Prisma or email verification

## 📝 API Endpoints

### GET /api/admin/profiles

Fetches all profiles (admin only, uses service_role key).

**Query params:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50, max: 100)
- `search` - Search by email or display_name
- `role` - Filter by role
- `tier` - Filter by tier

**Response:**
```json
{
  "profiles": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

### PATCH /api/admin/profiles

Updates a profile (admin only, uses service_role key).

**Body:**
```json
{
  "id": "uuid",
  "tier": 2,
  "role": "admin",
  ...
}
```

## 🔍 Verification Checklist

After running the migration, verify:

- [ ] `public.profiles` table exists
- [ ] All `auth.users` are in `public.profiles` (counts match)
- [ ] Triggers are active (`on_auth_user_created`, `on_auth_user_updated`)
- [ ] RLS is enabled on `public.profiles`
- [ ] RLS policies exist (users can view/update own)
- [ ] Admin dashboard shows users from `public.profiles`
- [ ] New signups automatically create profile
- [ ] Profile updates sync from `auth.users`

## 🐛 Troubleshooting

### Profiles table doesn't exist

**Solution:** Run the migration SQL in Supabase SQL Editor.

### User counts don't match

**Solution:** The backfill query is idempotent - run it again:
```sql
-- Re-run the backfill section from create_profiles_table.sql
```

### Triggers not firing

**Solution:** Check if triggers exist:
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'on_auth_user_updated');
```

### Admin dashboard shows no users

**Solution:** 
1. Check if `public.profiles` has data: `SELECT COUNT(*) FROM public.profiles;`
2. Check server logs for errors
3. Verify service_role key is set in `.env`

### RLS blocking admin queries

**Solution:** Admin endpoints use service_role key which bypasses RLS. If you see RLS errors, check:
1. Service role key is correct in `.env`
2. `createServiceClient()` is being used (not regular client)

## 📚 Related Files

- `supabase/migrations/create_profiles_table.sql` - Main migration
- `supabase/migrations/verify_profiles_setup.sql` - Verification queries
- `app/api/admin/profiles/route.ts` - Admin API endpoint
- `app/admin/usuarios/page.tsx` - Admin dashboard page

## 🎯 Next Steps

1. ✅ Run migration
2. ✅ Verify setup
3. ✅ Test admin dashboard
4. ✅ Test new user signup (should auto-create profile)
5. ✅ Test profile updates (should sync from auth.users)

## ⚠️ Important Notes

- **Don't delete** `auth.users` - profiles will cascade delete
- **Don't manually edit** `public.profiles` - let triggers handle it
- **Use service_role key** only server-side, never in client code
- **Keep Prisma User table** for app-specific data (orders, progress, etc.)
- **Profiles table** is for auth-related data only

## 🔗 Supabase Table Editor

In Supabase Dashboard → Table Editor:
- **Schema:** Select `public` (not `auth`)
- **Table:** Select `profiles`
- You should see all users here, synced from `auth.users`
