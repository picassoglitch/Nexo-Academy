# Stripe Tax Configuration

## ✅ Automatic Tax Enabled

Stripe Tax has been automatically enabled in all checkout sessions. This ensures that taxes are calculated and applied correctly for all transactions.

## What This Means

- **Automatic Tax Calculation**: Stripe automatically calculates taxes based on the customer's location
- **Compliance**: Ensures compliance with tax regulations in different jurisdictions
- **Transparency**: Taxes are clearly displayed to customers during checkout
- **Automatic Application**: Taxes are applied to:
  - New subscriptions
  - Subscription renewals
  - One-time payments
  - Invoices
  - Payment Links

## Configuration in Code

The automatic tax is enabled in `app/api/stripe/create-checkout-session/route.ts`:

```typescript
automatic_tax: {
  enabled: true,
}
```

## Stripe Dashboard Setup

To fully enable Stripe Tax, you need to:

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/settings/tax
2. **Enable Stripe Tax**: Toggle on "Use automatic tax"
3. **Configure Tax Settings**:
   - Set your business location
   - Configure product tax codes (if needed)
   - Set up tax registration (if required)

## For Dashboard Transactions

When creating transactions directly in the Stripe Dashboard:

1. Go to **Settings** → **Tax**
2. Enable **"Use automatic tax"** for Dashboard transactions
3. This applies to:
   - Invoices created in Dashboard
   - Subscriptions created in Dashboard
   - Quotes created in Dashboard
   - Payment Links created in Dashboard

## For Low-Code Products

If you use Stripe's low-code products (Checkout, Invoicing, etc.):

- **Checkout**: Already configured ✅ (automatic_tax enabled in code)
- **Payment Links**: Enable in Dashboard settings
- **Invoices**: Enable in Dashboard settings
- **Subscriptions**: Enable in Dashboard settings

## For Custom Payment Flows

If you create custom payment flows using Stripe APIs:

- Use `automatic_tax: { enabled: true }` in checkout session creation
- For Payment Intents, use `automatic_tax: { enabled: true }`
- Follow Stripe's integration guide for custom flows

## Tax Calculation

Stripe Tax automatically:
- Determines the customer's location
- Calculates applicable taxes (VAT, GST, sales tax, etc.)
- Applies the correct tax rate
- Displays taxes clearly to customers
- Includes taxes in receipts and invoices

## Important Notes

- ⚠️ **Tax Registration**: You may need to register for tax in jurisdictions where you have customers
- 📋 **Product Classification**: Ensure your products are correctly classified (digital goods, services, etc.)
- 🔄 **Automatic Updates**: Stripe Tax automatically updates tax rates as regulations change
- 💰 **Tax Collection**: Stripe collects and remits taxes on your behalf (in supported regions)

## Verification

To verify that automatic tax is working:

1. Create a test checkout session
2. Use a test card from a different country/region
3. Verify that taxes are calculated and displayed
4. Check the Stripe Dashboard to see tax breakdown

## Support

For questions about Stripe Tax:
- [Stripe Tax Documentation](https://stripe.com/docs/tax)
- [Stripe Tax FAQ](https://stripe.com/docs/tax/faq)
- [Stripe Support](https://support.stripe.com/)
