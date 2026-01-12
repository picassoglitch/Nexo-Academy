# Fix Prisma Schema Sync Error (P2022)

## Problem
Error `P2022`: "The column `(not available)` does not exist in the current database."

This happens when Prisma schema is out of sync with the database.

## Root Cause
The `public.profiles` table has a foreign key to `auth.users`, which Prisma detects during introspection. This prevents `prisma db push` from working.

## Solution Options

### Option 1: Use Prisma Migrate (Recommended for Production)

1. Create a migration:
   ```bash
   npx prisma migrate dev --name sync_schema
   ```

2. This will:
   - Create migration files
   - Apply changes to database
   - Not reset data

### Option 2: Temporarily Remove Foreign Key Constraint

If you need to use `db push`:

1. Go to Supabase Dashboard → SQL Editor
2. Run:
   ```sql
   ALTER TABLE public.profiles 
   DROP CONSTRAINT IF EXISTS profiles_id_fkey;
   ```
3. Run `npx prisma db push`
4. Re-add the constraint:
   ```sql
   ALTER TABLE public.profiles 
   ADD CONSTRAINT profiles_id_fkey 
   FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
   ```

### Option 3: Force Reset (⚠️ DANGEROUS - Development Only)

**⚠️ WARNING: This will DELETE ALL DATA in your database!**

Only use this if:
- You're in development
- You have backups
- You're okay losing all data

```bash
npx prisma db push --force-reset --accept-data-loss
```

## Recommended: Use Migrate

For your case, use Option 1 (migrate):

```bash
npx prisma migrate dev --name sync_schema
```

This is safe and won't delete data.
