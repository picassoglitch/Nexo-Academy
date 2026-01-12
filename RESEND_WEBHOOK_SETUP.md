# Resend Webhooks Setup (Optional but Recommended)

## 🤔 ¿Son Necesarios los Webhooks?

**NO son estrictamente necesarios** para que los emails funcionen. Los emails se envían y funcionan sin webhooks.

**SÍ son útiles para:**
- ✅ Tracking de entregas (saber si el email fue entregado o rebotó)
- ✅ Debugging cuando un usuario dice "no recibí el email"
- ✅ Analytics de engagement (aperturas, clics)
- ✅ Manejo automático de bounces y errores
- ✅ Métricas de email delivery

## 📋 Datos para Configurar el Webhook en Resend

### 1. Endpoint URL

Usa tu dominio de Vercel (después del deploy):

```
https://tu-app.vercel.app/api/resend/webhook
```

O para desarrollo local (usando ngrok o similar):

```
https://tu-ngrok-url.ngrok.io/api/resend/webhook
```

### 2. Eventos a Seleccionar

En el dropdown "Events types" de Resend, selecciona:

- ✅ `email.sent` - Email fue enviado exitosamente
- ✅ `email.delivered` - Email fue entregado al servidor del destinatario
- ✅ `email.delivery_delayed` - Entrega retrasada
- ✅ `email.complained` - Usuario marcó como spam
- ✅ `email.bounced` - Email rebotó (dirección inválida)
- ✅ `email.opened` - Usuario abrió el email
- ✅ `email.clicked` - Usuario hizo clic en un enlace

**Mínimo recomendado:**
- `email.sent`
- `email.delivered`
- `email.bounced`
- `email.opened`

## 🔧 Implementación del Webhook Endpoint

✅ **El endpoint ya está creado** en: `app/api/resend/webhook/route.ts`

Solo necesitas:

1. **Configurar el webhook en Resend Dashboard**
2. **Agregar el webhook secret a tus variables de entorno**

### Variables de Entorno Necesarias

Agrega esto a tu `.env` y en Vercel:

```env
RESEND_WEBHOOK_SECRET=whsec_...  # Obtendrás esto después de crear el webhook en Resend
```

**Nota:** El webhook funciona sin el secret en desarrollo, pero en producción es recomendable configurarlo para seguridad.

## 📝 Pasos para Configurar

### Paso 1: Crear el Endpoint (Ya está creado)

El endpoint ya existe en: `app/api/resend/webhook/route.ts`

### Paso 2: Ir a Resend Dashboard

1. Ve a [resend.com/webhooks](https://resend.com/webhooks)
2. Haz clic en "Add Webhook"

### Paso 3: Configurar el Webhook

1. **Endpoint URL**: 
   ```
   https://tu-app.vercel.app/api/resend/webhook
   ```
   (Reemplaza `tu-app.vercel.app` con tu dominio real de Vercel)

2. **Events types**: Selecciona los eventos mencionados arriba

3. **Click "Add"**

### Paso 4: Copiar el Webhook Secret

Después de crear el webhook, Resend te dará un **Webhook Secret** que empieza con `whsec_`.

Agrégalo a tus variables de entorno:

**En Vercel:**
- Settings → Environment Variables
- Agrega: `RESEND_WEBHOOK_SECRET=whsec_...`

**En local `.env`:**
```env
RESEND_WEBHOOK_SECRET=whsec_...
```

## 🎯 ¿Qué Hace el Webhook?

El endpoint recibirá eventos de Resend y:

1. **Logs eventos** para debugging
2. **Actualiza el estado de emails** en la base de datos (opcional)
3. **Envía notificaciones** si un email rebota (opcional)
4. **Tracking de métricas** (opcional)

## ⚠️ Importante

- El webhook **NO es necesario** para que los emails funcionen
- Es **opcional pero recomendado** para producción
- Puedes configurarlo después del deploy inicial
- Funciona sin webhooks, solo perderás tracking y debugging avanzado

## 🚀 Para Desarrollo Local

Si quieres probar webhooks localmente:

1. Usa [ngrok](https://ngrok.com/) o similar:
   ```bash
   ngrok http 3000
   ```

2. Usa la URL de ngrok en Resend:
   ```
   https://tu-ngrok-url.ngrok.io/api/resend/webhook
   ```

3. Resend enviará eventos a tu servidor local

## 📊 Eventos que Recibirás

Ejemplo de payload que recibirás:

```json
{
  "type": "email.delivered",
  "created_at": "2024-01-01T00:00:00.000Z",
  "data": {
    "email_id": "abc123",
    "from": "Nexo <noreply@yourdomain.com>",
    "to": ["user@example.com"],
    "subject": "Confirma tu email - Nexo"
  }
}
```

## ✅ Checklist

- [ ] Deploy tu app a Vercel
- [ ] Obtén tu URL de Vercel (ej: `https://nexo-academy.vercel.app`)
- [ ] Ve a Resend Dashboard → Webhooks
- [ ] Crea webhook con URL: `https://tu-app.vercel.app/api/resend/webhook`
- [ ] Selecciona eventos: `email.sent`, `email.delivered`, `email.bounced`, `email.opened`
- [ ] Copia el Webhook Secret (`whsec_...`)
- [ ] Agrega `RESEND_WEBHOOK_SECRET` a Vercel Environment Variables
- [ ] Test enviando un email y verifica que el webhook recibe eventos

## 🎯 Conclusión

**Puedes deployar sin webhooks** - los emails funcionarán perfectamente.

**Agrega webhooks después** si quieres:
- Mejor debugging
- Tracking de entregas
- Analytics de engagement
- Manejo automático de bounces
