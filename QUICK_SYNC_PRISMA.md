# Quick Prisma Schema Sync Guide

## ⚠️ Current Error
```
P2022: The column `(not available)` does not exist in the current database.
```

This happens because Prisma schema has new models (`ActivationCode`) that don't exist in the database yet.

## ✅ Quick Fix (3 Steps)

### Step 1: Remove Foreign Key Constraint (Supabase SQL Editor)

1. Go to: https://supabase.com/dashboard/project/ezeossgssgkniskbkvyn/sql/new
2. Copy and paste this SQL:
   ```sql
   ALTER TABLE public.profiles 
   DROP CONSTRAINT IF EXISTS profiles_id_fkey;
   ```
3. Click **Run** (or press Ctrl+Enter)

### Step 2: Sync Prisma Schema (Your Terminal)

Run this command in your project directory:
```bash
npx prisma db push
```

This will:
- Create the `ActivationCode` table
- Add the `activationCodes` relation to `Order` table
- Sync any other schema changes

### Step 3: Re-add Foreign Key Constraint (Supabase SQL Editor)

1. Go back to Supabase SQL Editor
2. Copy and paste this SQL:
   ```sql
   ALTER TABLE public.profiles 
   ADD CONSTRAINT profiles_id_fkey 
   FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
   ```
3. Click **Run**

## ✅ Done!

After these 3 steps:
- ✅ Prisma schema will be synced
- ✅ `ActivationCode` table will exist
- ✅ Error P2022 will be fixed
- ✅ Activation code system will work

## Verify It Worked

Run this in Supabase SQL Editor to verify:
```sql
SELECT * FROM "ActivationCode" LIMIT 1;
```

If it returns (even if empty), the table exists and you're good to go!

## Why This Is Needed

The `public.profiles` table has a foreign key to `auth.users` (a different schema). Prisma's `db push` can't handle cross-schema references, so we temporarily remove the constraint, sync, then add it back.

This is safe because:
- We're only removing the constraint temporarily
- No data is lost
- The constraint is restored immediately after
