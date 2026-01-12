# ✅ Vercel Environment Variables Checklist

## 🔴 CRITICAL: Variables Required for App to Work

These variables **MUST** be set in Vercel, otherwise you'll get the error:
```
@supabase/ssr: Your project's URL and API key are required to create a Supabase client!
```

### Required Variables (Copy to Vercel)

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these **for Production, Preview, AND Development**:

```env
# Supabase (REQUIRED - App won't work without these)
NEXT_PUBLIC_SUPABASE_URL=https://ezeossgssgkniskbkvyn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZW9zc2dzc2drbmlza2JrdnluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1OTc3ODksImV4cCI6MjA4MzE3Mzc4OX0.bjOrDw3015bhMrAcE7pGMRzKIC1ThB0-m5ktloS6X0Y
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZW9zc2dzc2drbmlza2JrdnluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU5Nzc4OSwiZXhwIjoyMDgzMTczNzg5fQ.0uWxbdgZZ1x26qMIgkZp54DH94rG6CVMRsaYloUxW7Q

# Database (REQUIRED)
DATABASE_URL=postgresql://postgres:Platanos2903!@db.ezeossgssgkniskbkvyn.supabase.co:5432/postgres

# Resend Email (REQUIRED for emails to work)
RESEND_API_KEY=re_XYPpQZEC_DhjBW6zN8FBkTkBk1iPRQZeB
RESEND_FROM_EMAIL=Nexo <onboarding@resend.dev>

# Site URL (REQUIRED - Update after first deploy)
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app

# Admin (REQUIRED)
ADMIN_BOOTSTRAP_EMAIL=picassoglitch@gmail.com
```

## ⚠️ IMPORTANT NOTES

1. **NEXT_PUBLIC_ prefix**: Variables that start with `NEXT_PUBLIC_` are exposed to the browser. These are safe for the anon key, but keep service role key private.

2. **Set for ALL environments**: When adding variables in Vercel, make sure to check:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

3. **After adding variables**: 
   - Vercel will automatically redeploy
   - Wait for the new deployment to complete
   - Clear your browser cache and try again

## 🔍 How to Verify Variables Are Set

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify all variables above are listed
3. Check that they're enabled for the correct environments

## 🐛 Common Issues

### Error: "Your project's URL and API key are required"
**Cause**: `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` missing
**Fix**: Add both variables to Vercel

### Error: "Missing Supabase environment variables"
**Cause**: Variables not set or not accessible
**Fix**: 
1. Verify variables are set in Vercel
2. Make sure they're enabled for Production environment
3. Redeploy after adding variables

### App works locally but not on Vercel
**Cause**: Variables only in local `.env` file
**Fix**: Copy all variables from `.env` to Vercel Dashboard

## 📋 Quick Copy-Paste for Vercel

1. Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables
2. Click "Add New"
3. Copy each variable below one by one:

**Variable 1:**
- Key: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://ezeossgssgkniskbkvyn.supabase.co`
- Environments: ✅ Production ✅ Preview ✅ Development

**Variable 2:**
- Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZW9zc2dzc2drbmlza2JrdnluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1OTc3ODksImV4cCI6MjA4MzE3Mzc4OX0.bjOrDw3015bhMrAcE7pGMRzKIC1ThB0-m5ktloS6X0Y`
- Environments: ✅ Production ✅ Preview ✅ Development

**Variable 3:**
- Key: `SUPABASE_SERVICE_ROLE_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZW9zc2dzc2drbmlza2JrdnluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU5Nzc4OSwiZXhwIjoyMDgzMTczNzg5fQ.0uWxbdgZZ1x26qMIgkZp54DH94rG6CVMRsaYloUxW7Q`
- Environments: ✅ Production ✅ Preview ✅ Development

**Variable 4:**
- Key: `DATABASE_URL`
- Value: `postgresql://postgres:Platanos2903!@db.ezeossgssgkniskbkvyn.supabase.co:5432/postgres`
- Environments: ✅ Production ✅ Preview ✅ Development

**Variable 5:**
- Key: `RESEND_API_KEY`
- Value: `re_XYPpQZEC_DhjBW6zN8FBkTkBk1iPRQZeB`
- Environments: ✅ Production ✅ Preview ✅ Development

**Variable 6:**
- Key: `RESEND_FROM_EMAIL`
- Value: `Nexo <onboarding@resend.dev>`
- Environments: ✅ Production ✅ Preview ✅ Development

**Variable 7:**
- Key: `NEXT_PUBLIC_SITE_URL`
- Value: `https://your-app.vercel.app` (Replace with your actual Vercel domain)
- Environments: ✅ Production ✅ Preview ✅ Development

**Variable 8:**
- Key: `ADMIN_BOOTSTRAP_EMAIL`
- Value: `picassoglitch@gmail.com`
- Environments: ✅ Production ✅ Preview ✅ Development

## 🚀 After Adding Variables

1. **Redeploy**: Vercel will automatically trigger a new deployment
2. **Wait**: Wait for deployment to complete (check Deployments tab)
3. **Test**: Visit your Vercel URL and verify the app loads
4. **Update NEXT_PUBLIC_SITE_URL**: After first successful deploy, update this with your actual Vercel domain

## ✅ Verification

After adding all variables, your app should:
- ✅ Load without Supabase client errors
- ✅ Allow users to sign up
- ✅ Send confirmation emails
- ✅ Allow users to log in
- ✅ Access protected routes
