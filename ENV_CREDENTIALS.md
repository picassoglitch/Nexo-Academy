# Credenciales Configuradas

## Supabase - Configurado ✅

```env
NEXT_PUBLIC_SUPABASE_URL=https://ezeossgssgkniskbkvyn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZW9zc2dzc2drbmlza2JrdnluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1OTc3ODksImV4cCI6MjA4MzE3Mzc4OX0.bjOrDw3015bhMrAcE7pGMRzKIC1ThB0-m5ktloS6X0Y
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZW9zc2dzc2drbmlza2JrdnluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU5Nzc4OSwiZXhwIjoyMDgzMTczNzg5fQ.0uWxbdgZZ1x26qMIgkZp54DH94rG6CVMRsaYloUxW7Q
DATABASE_URL=postgresql://postgres:Platanos2903!@db.ezeossgssgkniskbkvyn.supabase.co:5432/postgres
```

## Próximos Pasos

1. **Verifica que tu archivo `.env` tenga estas credenciales**
2. **Genera Prisma Client:**
   ```bash
   npm run db:generate
   ```

3. **Crea las tablas en la base de datos:**
   ```bash
   npm run db:push
   ```

4. **Pobla la base de datos con datos iniciales:**
   ```bash
   npm run db:seed
   ```

5. **Inicia el servidor:**
   ```bash
   npm run dev
   ```

## Variables de Entorno Restantes (Opcionales)

Estas variables puedes configurarlas más adelante cuando estés listo:

```env
# MercadoPago (cuando configures pagos)
MERCADOPAGO_ACCESS_TOKEN=tu_token_aqui
MERCADOPAGO_WEBHOOK_SECRET=tu_secret_aqui

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Admin Email (tu email para acceso admin)
ADMIN_BOOTSTRAP_EMAIL=tu_email@ejemplo.com

# Analytics (opcional)
NEXT_PUBLIC_POSTHOG_KEY=tu_key_aqui
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Email (opcional)
RESEND_API_KEY=tu_key_aqui

# Community (opcional)
NEXT_PUBLIC_COMMUNITY_URL=https://tu-comunidad.com
```

## ⚠️ Importante

- **NUNCA** commitees el archivo `.env` a git (ya está en `.gitignore`)
- La **Service Role Key** tiene acceso completo - úsala solo en el servidor
- La contraseña de la base de datos está en el connection string - mantén el `.env` seguro

