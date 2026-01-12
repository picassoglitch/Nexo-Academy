# Configuración de Stripe Checkout

Guía para configurar Stripe Checkout en el proyecto.

## 📋 Instalación

Primero, instala las dependencias de Stripe:

```bash
npm install stripe @stripe/stripe-js
```

## 🔧 Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_...  # Obtén desde Stripe Dashboard
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # Obtén desde Stripe Dashboard

# Webhook Secret (obtén esto desde el Dashboard de Stripe)
STRIPE_WEBHOOK_SECRET=whsec_...

# Site URL
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com  # o http://localhost:3000 en desarrollo
```

## 🔑 Obtener las Claves de Stripe

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/)
2. Ve a **Developers** > **API keys**
3. Copia tu **Secret key** (empieza con `sk_live_` o `sk_test_`)
4. Copia tu **Publishable key** (empieza con `pk_live_` o `pk_test_`)

## 🔔 Configurar Webhook

### Para Desarrollo Local:

1. Instala Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Windows
   # Descarga desde https://github.com/stripe/stripe-cli/releases
   ```

2. Inicia sesión:
   ```bash
   stripe login
   ```

3. Escucha webhooks localmente:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. Copia el webhook secret que aparece (empieza con `whsec_`) y agrégalo a tu `.env`

### Para Producción:

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click en **Add endpoint**
3. URL del endpoint: `https://tu-dominio.com/api/stripe/webhook`
4. Selecciona los eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copia el **Signing secret** y agrégalo a tu `.env` como `STRIPE_WEBHOOK_SECRET`

## 🧪 Modo Test

Para probar en modo test:

1. Usa las claves de test (empiezan con `sk_test_` y `pk_test_`)
2. Usa estas tarjetas de prueba:
   - **Pago exitoso**: `4242 4242 4242 4242`
   - **Requiere autenticación**: `4000 0025 0000 3155`
   - **Pago rechazado**: `4000 0000 0000 9995`
3. Usa cualquier CVV (123) y fecha futura

## 🔄 Flujo de Pago

1. Usuario hace clic en "Continuar con el pago"
2. Se crea una Checkout Session en `/api/stripe/create-checkout-session`
3. Usuario es redirigido a Stripe Checkout (página hospedada)
4. Usuario completa el pago en Stripe
5. Stripe redirige a `/checkout/success?session_id=xxx`
6. Webhook procesa el pago y actualiza la base de datos

## 💳 Pagos Recurrentes

Para habilitar pagos recurrentes (suscripciones):

1. Cambia `mode: "payment"` a `mode: "subscription"` en `create-checkout-session/route.ts`
2. Usa `price_data` con `recurring` o crea productos/precios en Stripe Dashboard
3. El webhook manejará eventos de suscripción automáticamente

## 📝 Notas

- Los pagos se procesan en la página hospedada por Stripe (más seguro)
- El webhook es crítico para actualizar la base de datos después del pago
- Los customer IDs se guardan en `mpCustomerId` (reutilizando el campo existente)
- Los pagos se guardan en la tabla `orders` con `externalId` = session ID

