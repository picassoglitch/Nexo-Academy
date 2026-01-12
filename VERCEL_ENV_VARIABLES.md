# Vercel Environment Variables

Copy and paste these into Vercel Dashboard → Settings → Environment Variables

## Required Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
DATABASE_URL=postgresql://postgres:your_password@db.your-project.supabase.co:5432/postgres

# Resend Email
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=Nexo <onboarding@resend.dev>

# Site URL (update after first deploy with your actual Vercel domain)
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app

# Admin
ADMIN_BOOTSTRAP_EMAIL=your_email@example.com
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
