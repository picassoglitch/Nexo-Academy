# Resend Domain Verification - Required for Production

## ⚠️ Current Issue

Resend's free tier with `onboarding@resend.dev` **only allows sending emails to the account owner's email** (picassoglitch@gmail.com).

**Error message:**
```
"You can only send testing emails to your own email address (picassoglitch@gmail.com). 
To send emails to other recipients, please verify a domain at resend.com/domains"
```

## ✅ Solution: Verify Your Domain in Resend

### Step 1: Go to Resend Dashboard
1. Visit [resend.com/domains](https://resend.com/domains)
2. Log in with your Resend account
3. Click "Add Domain"

### Step 2: Add Your Domain
1. Enter your domain (e.g., `yourdomain.com`)
2. Resend will provide DNS records to add

### Step 3: Add DNS Records
Add these records to your domain's DNS settings:

**SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all
```

**DKIM Records:**
Resend will provide 3 CNAME records like:
```
Type: CNAME
Name: resend._domainkey
Value: [provided by Resend]
```

### Step 4: Wait for Verification
- DNS changes can take up to 48 hours
- Resend will verify automatically
- You'll get an email when verified

### Step 5: Update Your .env
Once verified, update your `.env`:
```env
RESEND_FROM_EMAIL="Nexo <noreply@yourdomain.com>"
```

## 🔄 Temporary Workaround

Until you verify a domain, users can:
1. Visit `/resend-confirmation` page
2. Enter their email
3. Receive confirmation link (if email is picassoglitch@gmail.com)
4. Or use the confirmation link provided in the signup response

## 📧 Alternative: Use Supabase Email

You can also use Supabase's built-in email service:
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Configure email templates
3. Update code to use Supabase's automatic email sending

## 🎯 Recommended: Verify Domain

**Best solution:** Verify your domain in Resend. It's:
- ✅ Free
- ✅ Professional (emails from your domain)
- ✅ No sending limits (after verification)
- ✅ Better deliverability
