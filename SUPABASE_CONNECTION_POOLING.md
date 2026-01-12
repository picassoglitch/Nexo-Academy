# Supabase Connection Pooling Setup for Vercel

## Current Configuration

Based on your Supabase settings:
- **Pool Size**: 15 connections
- **Max Client Connections**: 200
- **Network Restrictions**: All IPs allowed ✅ (Good - Vercel can connect)

## Get Connection Pooling URL

### Step 1: Find Your Connection Pooling URL

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `ezeossgssgkniskbkvyn`
3. Go to **Settings** → **Database**
4. Scroll to **Connection Pooling** section
5. Look for **Connection string** or **Connection info**

You should see something like:
```
postgresql://postgres.ezeossgssgkniskbkvyn:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

OR

```
postgresql://postgres.ezeossgssgkniskbkvyn:[YOUR-PASSWORD]@db.ezeossgssgkniskbkvyn.supabase.co:6543/postgres
```

### Step 2: Get Your Database Password

1. In the same **Settings** → **Database** page
2. Find **Database password** section
3. Click **Reset database password** if you don't know it
4. Copy the password (it's: `Platanos2903!` based on your config)

### Step 3: Construct the Full Connection String

Replace `[YOUR-PASSWORD]` with your actual password and add `?pgbouncer=true`:

**Option 1 (If you have pooler URL):**
```env
DATABASE_URL=postgresql://postgres.ezeossgssgkniskbkvyn:Platanos2903!@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Option 2 (If using direct pooler):**
```env
DATABASE_URL=postgresql://postgres.ezeossgssgkniskbkvyn:Platanos2903!@db.ezeossgssgkniskbkvyn.supabase.co:6543/postgres?pgbouncer=true
```

**Important Notes:**
- Username format: `postgres.ezeossgssgkniskbkvyn` (with project ref)
- Port: `6543` (NOT 5432 - that's direct connection)
- Must include: `?pgbouncer=true` at the end
- Password: Use the password from "Reset database password" section

### Step 4: Update Vercel Environment Variable

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Find `DATABASE_URL`
5. **Update** with the connection pooling URL from Step 3
6. Make sure it's enabled for **Production**, **Preview**, and **Development**
7. Save

### Step 5: Redeploy

After updating the environment variable:
- Vercel will automatically trigger a new deployment
- Wait for it to complete
- Test your checkout flow

## Verify Connection Pooling is Working

After updating, check Vercel logs:
1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click on the latest deployment
3. Check **Function Logs** for any database errors
4. Should see successful Prisma queries, not `P1001` errors

## Troubleshooting

### Still getting P1001 error?

1. **Verify password**: Make sure you're using the password from "Reset database password" section
2. **Check URL format**: Ensure it uses port `6543` and includes `?pgbouncer=true`
3. **Verify username**: Should be `postgres.ezeossgssgkniskbkvyn` (with project ref)
4. **Check Supabase status**: Ensure project is not paused

### Connection timeout?

1. Verify Network Restrictions allow all IPs (which you have ✅)
2. Check if Supabase project is paused (free tier pauses after inactivity)
3. Try resetting database password and updating DATABASE_URL

### Authentication failed?

1. Reset database password in Supabase Dashboard
2. Update DATABASE_URL in Vercel with new password
3. Redeploy

## Quick Reference

**Connection Pooling URL Format:**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[POOLER-HOST]:6543/postgres?pgbouncer=true
```

**Your Project Details:**
- Project Ref: `ezeossgssgkniskbkvyn`
- Password: `Platanos2903!` (verify in Supabase Dashboard)
- Pooler Host: Check in Supabase Dashboard → Settings → Database → Connection Pooling

## SSL Configuration (Optional but Recommended)

If you want to enforce SSL:
1. In Supabase Dashboard → Settings → Database → SSL Configuration
2. Enable **"Enforce SSL on incoming connections"**
3. Download certificate if needed
4. Add SSL parameters to connection string if required

For most cases, Supabase handles SSL automatically, so you don't need to add SSL parameters to the connection string.
