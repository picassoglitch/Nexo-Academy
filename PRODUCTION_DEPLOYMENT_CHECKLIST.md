# ✅ Production Deployment Checklist

## 🎯 Pre-Deployment Verification

### 1. Code Quality
- [ ] All TypeScript errors resolved
- [ ] No console errors in browser
- [ ] All API routes tested locally
- [ ] Database schema synced (`npx prisma db push`)
- [ ] Prisma Client regenerated (`npx prisma generate`)

### 2. Environment Variables (Local `.env`)
Verify these exist in your local `.env` file:

```env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://ezeossgssgkniskbkvyn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZW9zc2dzc2drbmlza2JrdnluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1OTc3ODksImV4cCI6MjA4MzE3Mzc4OX0.bjOrDw3015bhMrAcE7pGMRzKIC1ThB0-m5ktloS6X0Y
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZW9zc2dzc2drbmlza2JrdnluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU5Nzc4OSwiZXhwIjoyMDgzMTczNzg5fQ.0uWxbdgZZ1x26qMIgkZp54DH94rG6CVMRsaYloUxW7Q

# Database (REQUIRED - Use Connection Pooling for production)
DATABASE_URL=postgresql://postgres.ezeossgssgkniskbkvyn:Platanos2903!@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Resend Email (REQUIRED)
RESEND_API_KEY=re_XYPpQZEC_DhjBW6zN8FBkTkBk1iPRQZeB
RESEND_FROM_EMAIL=Nexo <onboarding@resend.dev>

# Site URL (Update after first deploy)
NEXT_PUBLIC_SITE_URL=https://nexo-ai.world

# Admin (REQUIRED)
ADMIN_BOOTSTRAP_EMAIL=picassoglitch@gmail.com

# Stripe (REQUIRED if using payments)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend Webhook (Optional but recommended)
RESEND_WEBHOOK_SECRET=whsec_...
```

### 3. Database Setup
- [ ] All Prisma migrations applied
- [ ] `ActivationCode` table exists
- [ ] All foreign keys and constraints in place
- [ ] Test database connection works

### 4. Supabase Configuration
- [ ] Connection pooling enabled (port 6543)
- [ ] Network restrictions allow Vercel IPs (or allow all)
- [ ] Email templates configured (if using custom)
- [ ] Auth settings configured correctly

### 5. Stripe Configuration (if using)
- [ ] Live API keys obtained
- [ ] Webhook endpoint configured: `https://nexo-ai.world/api/stripe/webhook`
- [ ] Webhook events subscribed:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
  - `invoice.payment_succeeded`

### 6. Resend Configuration
- [ ] API key valid
- [ ] Domain verified (if using custom domain)
- [ ] Webhook configured (optional): `https://nexo-ai.world/api/resend/webhook`

---

## 🚀 Deployment Steps

### Step 1: Push to GitHub
```bash
git add -A
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Configure Vercel Environment Variables

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add ALL these variables for **Production**, **Preview**, AND **Development**:

#### Critical Variables (App won't work without these)
```env
NEXT_PUBLIC_SUPABASE_URL=https://ezeossgssgkniskbkvyn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZW9zc2dzc2drbmlza2JrdnluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1OTc3ODksImV4cCI6MjA4MzE3Mzc4OX0.bjOrDw3015bhMrAcE7pGMRzKIC1ThB0-m5ktloS6X0Y
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZW9zc2dzc2drbmlza2JrdnluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU5Nzc4OSwiZXhwIjoyMDgzMTczNzg5fQ.0uWxbdgZZ1x26qMIgkZp54DH94rG6CVMRsaYloUxW7Q
DATABASE_URL=postgresql://postgres.ezeossgssgkniskbkvyn:Platanos2903!@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
RESEND_API_KEY=re_XYPpQZEC_DhjBW6zN8FBkTkBk1iPRQZeB
RESEND_FROM_EMAIL=Nexo <onboarding@resend.dev>
ADMIN_BOOTSTRAP_EMAIL=picassoglitch@gmail.com
```

#### Site URL (Your production domain)
```env
NEXT_PUBLIC_SITE_URL=https://nexo-ai.world
```

#### Stripe (if using)
```env
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Resend Webhook (optional)
```env
RESEND_WEBHOOK_SECRET=whsec_...
```

### Step 3: Deploy to Vercel

1. **Via GitHub Integration** (Recommended):
   - Vercel will auto-deploy when you push to `main`
   - Go to Vercel Dashboard → Your Project → Deployments
   - Wait for build to complete

2. **Via Vercel CLI**:
   ```bash
   vercel --prod
   ```

### Step 4: Verify Site URL

Your production domain is: `https://nexo-ai.world`

Make sure `NEXT_PUBLIC_SITE_URL` is set to `https://nexo-ai.world` in Vercel Environment Variables.

---

## ✅ Post-Deployment Verification

### 1. Basic Functionality
- [ ] Homepage loads correctly
- [ ] Login page works
- [ ] Signup page works
- [ ] Email confirmation links work
- [ ] Password reset works

### 2. Authentication
- [ ] Users can sign up
- [ ] Confirmation emails are sent
- [ ] Users can confirm email
- [ ] Users can log in after confirmation
- [ ] Protected routes redirect to login

### 3. Payments (if using Stripe)
- [ ] Checkout session creation works
- [ ] Payment processing works
- [ ] Webhook receives events
- [ ] User tier updates after payment
- [ ] Activation codes generated correctly

### 4. Email System
- [ ] Signup confirmation emails sent
- [ ] Password reset emails sent
- [ ] Activation code emails sent (if applicable)
- [ ] Emails show correct sender name

### 5. Database
- [ ] Users created in database
- [ ] Orders created correctly
- [ ] Activation codes stored correctly
- [ ] Admin can view users

### 6. Admin Panel
- [ ] Admin can access `/admin`
- [ ] User list loads correctly
- [ ] Course management works
- [ ] Analytics load correctly

---

## 🔧 Troubleshooting

### Build Fails
1. Check Vercel build logs
2. Verify all environment variables are set
3. Ensure `package.json` has correct scripts
4. Check for TypeScript errors locally

### Database Connection Errors
1. Verify `DATABASE_URL` uses connection pooling (port 6543)
2. Check Supabase network restrictions
3. Verify database password is correct
4. See `SUPABASE_CONNECTION_POOLING.md`

### Email Not Sending
1. Verify `RESEND_API_KEY` is correct
2. Check Resend dashboard for errors
3. Verify domain is verified (if using custom domain)
4. Check `RESEND_FROM_EMAIL` format

### Authentication Issues
1. Verify Supabase environment variables
2. Check Supabase Auth settings
3. Verify redirect URLs in Supabase dashboard
4. Check browser console for errors

### Payment Issues
1. Verify Stripe keys are live keys (not test)
2. Check webhook endpoint is configured
3. Verify webhook secret matches
4. Check Stripe dashboard for webhook events

---

## 📋 Quick Reference

### Important URLs
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard/project/ezeossgssgkniskbkvyn
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Resend Dashboard**: https://resend.com/emails
- **GitHub Repo**: https://github.com/picassoglitch/Nexo-Academy

### Key Files
- `VERCEL_ENV_VARIABLES.md` - Complete environment variables list
- `DEPLOYMENT_GUIDE.md` - Detailed deployment instructions
- `SUPABASE_CONNECTION_POOLING.md` - Database connection guide
- `ACTIVATION_CODE_SETUP.md` - Activation code system guide

---

## 🎉 You're Ready!

Once all checkboxes are complete, your app is ready for production! 🚀
