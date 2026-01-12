# How to Add Resend API Key to .env File

## 📝 Step-by-Step Instructions

### Option 1: If you already have a `.env` file

1. **Open your `.env` file** in the root directory of your project
2. **Add this line** (or update if it already exists):
   ```env
   RESEND_API_KEY=your_resend_api_key
   ```
3. **Save the file**
4. **Restart your development server** (stop and run `npm run dev` again)

### Option 2: If you don't have a `.env` file yet

1. **Create a new file** called `.env` in the root directory of your project
   - The root directory is: `C:\Users\USER\Desktop\aicourse`
   - Create the file at: `C:\Users\USER\Desktop\aicourse\.env`

2. **Add these lines** to the `.env` file:
   ```env
   # Resend Email Service
   RESEND_API_KEY=your_resend_api_key
   
   # Supabase (you should already have these)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # Database
   DATABASE_URL=your_database_url
   
   # Site URL
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. **Save the file**
4. **Restart your development server**

## ⚠️ Important Notes

- The `.env` file is already in `.gitignore`, so it won't be committed to git (this is good for security!)
- Make sure there are **no spaces** around the `=` sign
- Make sure there are **no quotes** around the API key value
- After adding/updating the `.env` file, you **must restart** your development server for changes to take effect

## ✅ Verify It's Working

After restarting your server, try:
1. Go to `/signup` and create a test account
2. You should receive an email from "Nexo" via Resend
3. Check your server console - you should see: `✅ Signup confirmation email sent via Resend to: [email]`

## 🔍 File Location

Your `.env` file should be here:
```
C:\Users\USER\Desktop\aicourse\.env
```

Same directory as:
- `package.json`
- `next.config.ts`
- `README.md`
