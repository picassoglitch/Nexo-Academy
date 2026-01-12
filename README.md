# Nexo Academy - AI Course Platform

Plataforma de cursos SaaS completa para enseñar a generar ingresos con IA a través de un reto de 30 días.

## 🚀 Características

- **Quiz de personalización**: 6 pasos que generan un plan personalizado
- **3 Tiers de precios**: Starter ($299 MXN), Pro ($999 MXN), Operator ($3,999 MXN)
- **3 Caminos de ingresos**: Servicios locales, Contenido para creadores, Productos digitales
- **Pagos con Stripe**: Tarjetas y métodos de pago internacionales
- **Dashboard de estudiante**: Progreso, rachas, plantillas descargables
- **Reproductor de curso**: Videos, transcripciones, checklists de acción
- **Panel de administración**: CRUD completo para cursos, módulos, lecciones, activos
- **Sistema de referidos**: Comisiones por referidos
- **Email notifications**: Resend para confirmación de email y notificaciones

## 📋 Prerequisitos

- Node.js 18+
- Cuenta de Supabase (PostgreSQL + Auth)
- Cuenta de Stripe
- Cuenta de Resend (para emails)

## 🛠️ Configuración

### 1. Clonar e Instalar

```bash
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Resend Email
RESEND_API_KEY=tu_resend_api_key
RESEND_FROM_EMAIL="Nexo <noreply@tudominio.com>"

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Admin
ADMIN_BOOTSTRAP_EMAIL=tu_email@ejemplo.com

# Stripe (opcional)
STRIPE_SECRET_KEY=tu_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=tu_stripe_publishable_key
```

### 3. Configurar Base de Datos

```bash
# Generar Prisma Client
npm run db:generate

# Crear tablas
npm run db:push

# Poblar con datos iniciales
npm run db:seed
```

### 4. Configurar Supabase Profiles Table

Ejecuta la migración en Supabase SQL Editor:
- `supabase/migrations/create_profiles_table.sql`

### 5. Iniciar Servidor

```bash
npm run dev
```

## 📚 Documentación

- `PROFILES_SETUP.md` - Configuración de la tabla profiles en Supabase
- `RESEND_SETUP.md` - Configuración de emails con Resend
- `RESEND_DOMAIN_SETUP.md` - Verificación de dominio en Resend
- `EMAIL_VALIDATION_FLOW.md` - Flujo de validación de email
- `HOW_TO_ADD_ENV.md` - Cómo agregar variables de entorno

## 🚀 Despliegue en Vercel

1. Conecta tu repositorio de GitHub a Vercel
2. Agrega todas las variables de entorno en Vercel Dashboard
3. Vercel detectará automáticamente Next.js y configurará el build
4. El despliegue se hará automáticamente en cada push a `main`

## 📝 Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run start` - Inicia servidor de producción
- `npm run db:generate` - Genera Prisma Client
- `npm run db:push` - Sincroniza schema con base de datos
- `npm run db:seed` - Pobla base de datos con datos iniciales
- `npm run make-admin` - Crea usuario admin

## 🔒 Seguridad

- ⚠️ **NUNCA** commitees el archivo `.env` a git
- ⚠️ La **Service Role Key** tiene acceso completo - úsala solo en el servidor
- ✅ El archivo `.env` ya está en `.gitignore`

## 📧 Email Configuration

El sistema usa Resend para todos los emails:
- Confirmación de registro
- Reset de contraseña
- Welcome emails
- Notificaciones de pago

Ver `RESEND_SETUP.md` para más detalles.

## 🗄️ Base de Datos

- **Prisma**: ORM para la base de datos
- **Supabase Auth**: Autenticación de usuarios
- **Supabase Profiles**: Tabla pública que sincroniza con auth.users

Ver `PROFILES_SETUP.md` para más detalles sobre la sincronización.

## 📄 Licencia

Privado - Todos los derechos reservados
