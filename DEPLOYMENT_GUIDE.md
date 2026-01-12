# Deployment Guide - GitHub & Vercel

## 📦 Step 1: Push to GitHub

### Initialize Git (if not already done)
```bash
cd c:\Users\USER\Desktop\aicourse
git init
```

### Add Remote
```bash
git remote add origin https://github.com/picassoglitch/Nexo-Academy.git
```

### Add and Commit Files
```bash
git add .
git commit -m "Initial commit: Nexo Academy platform with Supabase auth, Resend emails, and Stripe payments"
```

### Push to GitHub
```bash
git branch -M main
git push -u origin main
```

## 🚀 Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)**
   - Sign in with GitHub
   - Click "Add New Project"

2. **Import Repository**
   - Select `picassoglitch/Nexo-Academy`
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

4. **Add Environment Variables**
   
   Click "Environment Variables" and add all these:

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://ezeossgssgkniskbkvyn.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZW9zc2dzc2drbmlza2JrdnluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1OTc3ODksImV4cCI6MjA4MzE3Mzc4OX0.bjOrDw3015bhMrAcE7pGMRzKIC1ThB0-m5ktloS6X0Y
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZW9zc2dzc2drbmlza2JrdnluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU5Nzc4OSwiZXhwIjoyMDgzMTczNzg5fQ.0uWxbdgZZ1x26qMIgkZp54DH94rG6CVMRsaYloUxW7Q
   
   # Database
   DATABASE_URL=postgresql://postgres:Platanos2903!@db.ezeossgssgkniskbkvyn.supabase.co:5432/postgres
   
   # Resend Email
   RESEND_API_KEY=re_XYPpQZEC_DhjBW6zN8FBkTkBk1iPRQZeB
   RESEND_FROM_EMAIL=Nexo <onboarding@resend.dev>
   
   # Site URL (will be auto-set by Vercel, but add for production)
   NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
   
   # Admin
   ADMIN_BOOTSTRAP_EMAIL=picassoglitch@gmail.com
   
   # Stripe (if you have it)
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

   **Important:** 
   - Set each variable for **Production**, **Preview**, and **Development**
   - For `NEXT_PUBLIC_SITE_URL`, use your actual Vercel domain after first deploy

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-app.vercel.app`

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## 🔧 Post-Deployment Steps

### 1. Update Site URL
After first deployment, update `NEXT_PUBLIC_SITE_URL` in Vercel with your actual domain.

### 2. Run Database Migrations
```bash
# Via Vercel CLI or Supabase Dashboard
npx prisma db push
```

### 3. Run Supabase Profiles Migration
- Go to Supabase Dashboard → SQL Editor
- Run `supabase/migrations/create_profiles_table.sql`

### 4. Test Email Sending
- Try signup flow
- Check Resend dashboard for email logs
- Verify domain if needed (see `RESEND_DOMAIN_SETUP.md`)

## 📋 Environment Variables Checklist

Make sure all these are set in Vercel:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `DATABASE_URL`
- [ ] `RESEND_API_KEY`
- [ ] `RESEND_FROM_EMAIL`
- [ ] `NEXT_PUBLIC_SITE_URL` (update after first deploy)
- [ ] `ADMIN_BOOTSTRAP_EMAIL`
- [ ] `STRIPE_SECRET_KEY` (if using Stripe)
- [ ] `STRIPE_PUBLISHABLE_KEY` (if using Stripe)

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Vercel
- Ensure all environment variables are set
- Verify `package.json` scripts are correct

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Supabase connection pooling settings
- Ensure database is accessible from Vercel's IPs

### Email Not Sending
- Verify `RESEND_API_KEY` is set
- Check Resend dashboard for errors
- Verify domain is verified (if using custom domain)

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Resend Dashboard](https://resend.com/emails)
- [GitHub Repository](https://github.com/picassoglitch/Nexo-Academy)
