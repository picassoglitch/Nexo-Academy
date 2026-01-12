# Supabase Auth → Prisma User Sync Setup

## ✅ What Was Done

1. **Added new fields to Prisma User model:**
   - `emailConfirmed` (Boolean) - Whether email is confirmed
   - `emailConfirmedAt` (DateTime?) - When email was confirmed
   - `lastSignInAt` (DateTime?) - Last sign-in time from Supabase

2. **Created sync utility** (`lib/sync-supabase-user.ts`):
   - `syncUserFromSupabase()` - Syncs single user
   - `syncAllUsersFromSupabase()` - Syncs all users

3. **Updated admin page** to automatically sync on load

4. **Updated sync-user endpoint** to sync Supabase data

## 🗄️ Database Migration Required

Run this SQL to add the new fields:

```sql
-- Add emailConfirmed field
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailConfirmed" BOOLEAN NOT NULL DEFAULT false;

-- Add emailConfirmedAt field
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailConfirmedAt" TIMESTAMP(3);

-- Add lastSignInAt field
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastSignInAt" TIMESTAMP(3);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "User_emailConfirmed_idx" ON "User"("emailConfirmed");
CREATE INDEX IF NOT EXISTS "User_lastSignInAt_idx" ON "User"("lastSignInAt");
```

**Or use Prisma:**

```bash
npx prisma db push --accept-data-loss
npx prisma generate
```

## 🔄 How It Works

1. **Source of Truth:** Supabase Auth is the source of truth for:
   - Email confirmation status
   - Last sign-in time
   - User creation time
   - Display name

2. **Sync Process:**
   - Admin page automatically syncs all users on load
   - `sync-user` endpoint syncs individual users
   - Data is stored in Prisma for fast queries

3. **Benefits:**
   - ✅ Single source of truth (Supabase Auth)
   - ✅ Fast queries from Prisma (no API calls needed)
   - ✅ Data always up-to-date (synced on admin page load)
   - ✅ No duplicate data management

## 📊 Admin Page Display

The admin page now shows:
- **Email Validado** - From Prisma (synced from Supabase)
- **Último Acceso** - From Prisma (synced from Supabase)
- **Fecha Registro** - From Prisma createdAt

All data matches Supabase dashboard!

## 🧪 Testing

1. **Run migration** (SQL above or Prisma push)
2. **Sync existing users:**
   ```bash
   npx tsx scripts/sync-all-users.ts
   ```
3. **Visit admin page** - Should auto-sync and show correct data
4. **Verify** - Check that data matches Supabase dashboard

## 🔧 Manual Sync

To manually sync all users:
```bash
npx tsx scripts/sync-all-users.ts
```

Or use the API endpoint (admin only):
```bash
# The admin page does this automatically on load
```
