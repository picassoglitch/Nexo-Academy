# Resend Email Configuration

## ✅ API Key Configured

Your Resend API key has been set up:
```
RESEND_API_KEY=re_XYPpQZEC_DhjBW6zN8FBkTkBk1iPRQZeB
```

## 📧 Email Flows Using Resend

All email notifications now use Resend:

1. **Signup/Registration** - Confirmation email sent via Resend
2. **Email Confirmation Resend** - Uses Resend
3. **Password Reset** - Uses Resend
4. **Welcome Emails** - Uses Resend
5. **Payment Confirmations** - Uses Resend

## 🔧 Environment Variable

Add this to your `.env` file:

```env
RESEND_API_KEY=re_XYPpQZEC_DhjBW6zN8FBkTkBk1iPRQZeB
```

## 📝 Email Sender Configuration

The system uses:
- **From**: `Nexo <onboarding@resend.dev>` (default Resend domain)
- **Custom Domain**: Set `RESEND_FROM_EMAIL` in `.env` if you have a verified domain

## ✅ All Endpoints Updated

- ✅ `/api/auth/resend-confirmation` - Uses Resend
- ✅ `/api/auth/forgot-password` - Uses Resend
- ✅ `/api/emails/send-confirmation` - Uses Resend
- ✅ `/api/emails/send-welcome` - Uses Resend
- ✅ `/api/stripe/webhook` - Uses Resend

## 🚀 Next Steps

1. Add `RESEND_API_KEY` to your `.env` file
2. Restart your development server
3. Test the signup flow - you should receive emails from "Nexo"
