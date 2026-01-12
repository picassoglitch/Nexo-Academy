# 🔧 Fix Database Connection Error on Vercel

## Error
```
Can't reach database server at db.ezeossgssgkniskbkvyn.supabase.co (unknown) [P1001]
```

## ✅ Solution: Use Connection Pooling + Configure Firewall

### Step 1: Update DATABASE_URL in Vercel

**IMPORTANT**: For Vercel, you MUST use Supabase's **Connection Pooling** (port 6543) instead of direct connection (port 5432).

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables
2. Find `DATABASE_URL`
3. **Replace** the current value with:

```env
DATABASE_URL=postgresql://postgres.ezeossgssgkniskbkvyn:Platanos2903!@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**OR** if you have a custom pooler URL, use:

```env
DATABASE_URL=postgresql://postgres.ezeossgssgkniskbkvyn:Platanos2903!@db.ezeossgssgkniskbkvyn.supabase.co:6543/postgres?pgbouncer=true
```

**Key differences:**
- Port `6543` instead of `5432` (connection pooling)
- Add `?pgbouncer=true` parameter
- Username format: `postgres.ezeossgssgkniskbkvyn` (with project ref)

### Step 2: Configure Supabase Firewall

Supabase blocks connections by default. You need to allow Vercel IPs:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `ezeossgssgkniskbkvyn`
3. Go to **Settings** → **Database** → **Connection Pooling**
4. Scroll to **Allowed IPs** or **Network Restrictions**
5. **Add these Vercel IP ranges** (or allow all for testing):

**Option A: Allow All (Easier for testing)**
- Add `0.0.0.0/0` to allowed IPs (⚠️ Less secure, but works)

**Option B: Allow Specific Vercel IPs (More secure)**
- Vercel uses dynamic IPs, but you can check your deployment logs
- For production, consider using Supabase's IP allowlist feature

### Step 3: Get Connection Pooling URL from Supabase

1. In Supabase Dashboard → **Settings** → **Database**
2. Find **Connection Pooling** section
3. Copy the **Connection string** (should show port 6543)
4. Format should be:
   ```
   postgresql://postgres.ezeossgssgkniskbkvyn:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual password
6. Add `?pgbouncer=true` at the end

### Step 4: Verify Connection Pooling is Enabled

1. In Supabase Dashboard → **Settings** → **Database**
2. Check **Connection Pooling** is enabled
3. If not enabled, enable it (it's usually enabled by default)

### Step 5: Redeploy on Vercel

After updating the environment variable:

1. Vercel will automatically redeploy
2. Wait for deployment to complete
3. Test the checkout flow again

## Alternative: Direct Connection (If Pooling Doesn't Work)

If connection pooling still doesn't work, try the direct connection but ensure firewall allows it:

```env
DATABASE_URL=postgresql://postgres:Platanos2903!@db.ezeossgssgkniskbkvyn.supabase.co:5432/postgres
```

**Then configure firewall:**
1. Supabase Dashboard → **Settings** → **Database**
2. **Network Restrictions** → **Allow all IPs** (temporarily for testing)
3. Or add specific Vercel deployment IPs

## Why Connection Pooling?

- **Better for serverless**: Vercel functions are stateless and short-lived
- **Connection limits**: Direct connections have a limit (usually 60-100)
- **Performance**: Pooling reuses connections efficiently
- **Required for Vercel**: Vercel's serverless architecture works better with pooling

## Verification

After updating, test:

1. Go to your Vercel deployment
2. Try to create a checkout session
3. Check Vercel logs for any database errors
4. If still failing, check Supabase logs for connection attempts

## Troubleshooting

### Still getting P1001 error?

1. **Check password**: Make sure password in DATABASE_URL matches Supabase
2. **Check firewall**: Ensure Supabase allows connections from Vercel
3. **Check URL format**: Verify the connection string format is correct
4. **Check Supabase status**: Ensure Supabase project is active and not paused

### Connection timeout?

1. Try direct connection (port 5432) temporarily
2. Check if Supabase project is paused (free tier pauses after inactivity)
3. Verify network restrictions in Supabase

### Authentication failed?

1. Verify password is correct
2. Check if database user exists
3. Try resetting database password in Supabase

## Quick Fix Checklist

- [ ] Updated `DATABASE_URL` in Vercel to use port `6543` (pooling)
- [ ] Added `?pgbouncer=true` to connection string
- [ ] Configured Supabase firewall to allow connections
- [ ] Verified connection pooling is enabled in Supabase
- [ ] Redeployed on Vercel
- [ ] Tested checkout flow
