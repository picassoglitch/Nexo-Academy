# Vercel Environment Variables

Copy and paste these into Vercel Dashboard → Settings → Environment Variables

## ⚠️ CRITICAL: These MUST be set or app won't work!

## Required Variables

```env
# Supabase (REQUIRED - App crashes without these!)
NEXT_PUBLIC_SUPABASE_URL=https://ezeossgssgkniskbkvyn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZW9zc2dzc2drbmlza2JrdnluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1OTc3ODksImV4cCI6MjA4MzE3Mzc4OX0.bjOrDw3015bhMrAcE7pGMRzKIC1ThB0-m5ktloS6X0Y
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZW9zc2dzc2drbmlza2JrdnluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU5Nzc4OSwiZXhwIjoyMDgzMTczNzg5fQ.0uWxbdgZZ1x26qMIgkZp54DH94rG6CVMRsaYloUxW7Q

# Database (REQUIRED)
DATABASE_URL=postgresql://postgres:Platanos2903!@db.ezeossgssgkniskbkvyn.supabase.co:5432/postgres

# Resend Email (REQUIRED for emails)
RESEND_API_KEY=re_XYPpQZEC_DhjBW6zN8FBkTkBk1iPRQZeB
RESEND_FROM_EMAIL=Nexo <onboarding@resend.dev>

# Site URL (REQUIRED - Update after first deploy with your actual Vercel domain)
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app

# Admin (REQUIRED)
ADMIN_BOOTSTRAP_EMAIL=picassoglitch@gmail.com
```

## Optional Variables (if using Stripe)

```env
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Instructions

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable above
5. Set them for **Production**, **Preview**, and **Development**
6. After first deploy, update `NEXT_PUBLIC_SITE_URL` with your actual Vercel domain

## Important Notes

- ⚠️ **Never commit** these values to git (they're already in `.gitignore`)
- ✅ Set all variables for all environments (Production, Preview, Development)
- 🔄 After first deploy, update `NEXT_PUBLIC_SITE_URL` with your actual domain
