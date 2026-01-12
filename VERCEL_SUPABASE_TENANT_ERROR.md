# Fix "Tenant or user not found" Error in Vercel

## Error
```
Error: Tenant or user not found (unknown) [unknown]
```

This error occurs when Supabase cannot authenticate the request, usually due to incorrect environment variables in Vercel.

## Root Cause

The error happens when `createServiceClient()` tries to use Supabase Admin API, but:
1. `NEXT_PUBLIC_SUPABASE_URL` is incorrect or missing
2. `SUPABASE_SERVICE_ROLE_KEY` is incorrect or missing
3. The Service Role Key doesn't have proper permissions

## Solution

### Step 1: Verify Environment Variables in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Verify these are set correctly:**

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Should be: `https://ezeossgssgkniskbkvyn.supabase.co`
   - Must start with `https://`
   - No trailing slash

2. **SUPABASE_SERVICE_ROLE_KEY**
   - Should start with `eyJ` (JWT token)
   - Should be the **service_role** key, NOT the anon key
   - Get it from: Supabase Dashboard → Settings → API → service_role key

### Step 2: Get Correct Service Role Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `ezeossgssgkniskbkvyn`
3. Go to **Settings** → **API**
4. Find **service_role** key (⚠️ Keep this secret!)
5. Copy the entire key (it's a long JWT token starting with `eyJ`)
6. Update `SUPABASE_SERVICE_ROLE_KEY` in Vercel

### Step 3: Verify URL Format

Make sure `NEXT_PUBLIC_SUPABASE_URL` in Vercel is:
```
https://ezeossgssgkniskbkvyn.supabase.co
```

**NOT:**
- ❌ `http://ezeossgssgkniskbkvyn.supabase.co` (missing https)
- ❌ `https://ezeossgssgkniskbkvyn.supabase.co/` (trailing slash)
- ❌ `ezeossgssgkniskbkvyn.supabase.co` (missing protocol)

### Step 4: Redeploy

After updating environment variables:
1. Vercel will automatically redeploy
2. Wait for deployment to complete
3. Test checkout flow again

## Verification

After fixing, check Vercel logs:
1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click on latest deployment
3. Check **Function Logs**
4. Should NOT see "Tenant or user not found" errors

## Code Changes

The code has been updated to:
- ✅ Make Supabase verification optional (won't block checkout)
- ✅ Better error handling for missing credentials
- ✅ Validation of URL and key formats

Even if Supabase verification fails, checkout will proceed. The user account will be created after payment confirmation.

## Common Mistakes

1. **Using Anon Key instead of Service Role Key**
   - Anon key starts with `eyJ` but is shorter
   - Service role key is longer and has more permissions
   - Check Supabase Dashboard → Settings → API

2. **Wrong URL**
   - Must use the exact URL from Supabase Dashboard
   - Should match: `https://[project-ref].supabase.co`

3. **Environment not selected**
   - Make sure variables are enabled for **Production** environment
   - Check all three: Production, Preview, Development

## Still Not Working?

If error persists:
1. Double-check Service Role Key in Supabase Dashboard
2. Verify URL matches exactly (no typos)
3. Check Vercel logs for more detailed error messages
4. Try resetting Service Role Key in Supabase and updating Vercel
