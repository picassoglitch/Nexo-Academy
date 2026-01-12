# Fix P2022 Error: Column Does Not Exist

## ✅ Solution

The error `P2022: The column (not available) does not exist` usually means Prisma Client is out of sync.

### Quick Fix:

1. **Regenerate Prisma Client** (already done):
   ```bash
   npx prisma generate
   ```

2. **Restart your development server**:
   - Stop the current `npm run dev` process (Ctrl+C)
   - Start it again:
     ```bash
     npm run dev
     ```

3. **Clear Next.js cache** (if still having issues):
   ```bash
   rm -rf .next
   npm run dev
   ```

## Why This Happens

- Prisma Client is generated code that needs to match your database schema
- After schema changes, the client must be regenerated
- Next.js caches the old client until you restart the server

## Verify It's Fixed

After restarting, try creating a checkout session again. The error should be gone.

## If Still Having Issues

Check that your `DATABASE_URL` in `.env` is correct and points to the right database:
```env
DATABASE_URL=postgresql://postgres.ezeossgssgkniskbkvyn:YOUR_PASSWORD@db.ezeossgssgkniskbkvyn.supabase.co:5432/postgres
```
