# Activation Code System Setup

## ✅ Implementation Complete

The activation code system has been fully implemented. Here's what was added:

## Database Schema

### New Model: `ActivationCode`

```prisma
model ActivationCode {
  id          String   @id @default(uuid())
  code        String   @unique // Format: NEXO-XXXX-XXXX
  tier        Int      // Tier to activate (1=STARTER, 2=PRO, 3=OPERATOR)
  email       String?  // Email associated with payment
  orderId     String?  // Stripe session/order ID
  usedBy      String?  // User ID who used this code
  usedAt      DateTime? // When code was last used
  useCount    Int      @default(0) // How many times code has been used
  createdAt   DateTime @default(now())
  expiresAt   DateTime? // Optional expiration date

  order       Order?   @relation(fields: [orderId], references: [id], onDelete: SetNull)

  @@index([code])
  @@index([email])
  @@index([orderId])
}
```

### Updated Model: `Order`

Added relation to `ActivationCode`:
```prisma
activationCodes ActivationCode[]
```

## Setup Steps

### Step 1: Sync Prisma Schema

**IMPORTANT**: Before syncing, you need to temporarily remove the foreign key constraint from `public.profiles`:

1. Go to Supabase Dashboard → SQL Editor
2. Run:
   ```sql
   ALTER TABLE public.profiles 
   DROP CONSTRAINT IF EXISTS profiles_id_fkey;
   ```

3. Then run:
   ```bash
   npx prisma db push
   ```

4. After `db push` completes, re-add the constraint:
   ```sql
   ALTER TABLE public.profiles 
   ADD CONSTRAINT profiles_id_fkey 
   FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
   ```

### Step 2: Verify Setup

After syncing, verify the table was created:
```sql
SELECT * FROM "ActivationCode" LIMIT 5;
```

## How It Works

### Flow for Users Without Accounts

1. **User makes payment** → Stripe checkout session created
2. **Payment confirmed** → Webhook receives `checkout.session.completed`
3. **Webhook checks** → Does user have Supabase account?
4. **If NO account**:
   - Creates user in Prisma with `tier: 0`
   - Generates unique activation code (e.g., `NEXO-A3B7-K9M2`)
   - Links code to order
   - **Does NOT create Supabase account**
5. **Checkout success page** → Shows activation code
6. **User saves code** → Clicks "Crear Cuenta"
7. **User creates account** → Signs up at `/signup`
8. **User logs in** → Goes to dashboard
9. **Dashboard shows** → Activation code input (if tier = 0)
10. **User enters code** → Code validated and applied
11. **Tier updated** → User gets access to purchased tier

### Flow for Users With Accounts

1. **User makes payment** → Stripe checkout session created
2. **Payment confirmed** → Webhook receives `checkout.session.completed`
3. **Webhook checks** → User has Supabase account
4. **If YES account**:
   - Updates tier immediately (no code needed)
   - Creates order
   - User can access content right away

## API Endpoints

### GET `/api/activation/get-by-session?session_id=xxx`
Returns activation code for a Stripe session.

**Response:**
```json
{
  "code": "NEXO-A3B7-K9M2",
  "tier": 2,
  "tierName": "PRO",
  "email": "user@example.com"
}
```

### POST `/api/activation/validate-code`
Validates an activation code format and existence.

**Request:**
```json
{
  "code": "NEXO-A3B7-K9M2"
}
```

**Response:**
```json
{
  "valid": true,
  "tier": 2,
  "tierName": "PRO",
  "useCount": 0
}
```

### POST `/api/activation/apply-code`
Applies an activation code to the logged-in user.

**Request:**
```json
{
  "code": "NEXO-A3B7-K9M2"
}
```

**Response:**
```json
{
  "success": true,
  "message": "¡Código activado exitosamente! Tu cuenta ahora tiene acceso a PRO.",
  "tier": 2,
  "tierName": "PRO",
  "codeUsed": true
}
```

## Code Format

- **Format**: `NEXO-XXXX-XXXX`
- **Example**: `NEXO-A3B7-K9M2`
- **Characters**: A-Z, 2-9 (removed confusing: 0, O, I, 1)
- **Uniqueness**: Guaranteed by database constraint
- **Reusability**: Can be used multiple times (tracked by `useCount`)

## Features

✅ **Multiple Uses**: Same code can be used multiple times  
✅ **Secure**: Unique codes with validation  
✅ **User-Friendly**: Clear instructions and UI  
✅ **Integrated**: Works seamlessly with existing tier system  
✅ **Trackable**: Tracks usage count and last used date  

## Components

### `ActivationCodeInput`
- Location: Dashboard (shown when `user.tier === 0`)
- Features:
  - Real-time validation
  - Visual feedback (green/red)
  - Shows tier that will be activated
  - Displays use count
  - Auto-refresh after activation

### Checkout Success Page
- Shows activation code prominently
- Copy to clipboard button
- Step-by-step instructions
- "Crear Cuenta" button

## Testing

1. Make a payment without an account
2. Verify code is generated in database
3. Check code appears on success page
4. Create account
5. Log in
6. Enter code in dashboard
7. Verify tier is updated

## Troubleshooting

### Code not showing on success page?
- Check webhook processed payment
- Verify `activationCodes` table exists
- Check order was created
- Verify user doesn't have Supabase account

### Code validation fails?
- Check code format: `NEXO-XXXX-XXXX`
- Verify code exists in database
- Check if code expired (if `expiresAt` is set)

### Code doesn't activate tier?
- Verify user is logged in
- Check code tier matches expected tier
- Verify Prisma user exists
- Check Supabase metadata update
