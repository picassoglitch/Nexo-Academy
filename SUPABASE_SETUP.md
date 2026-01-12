# Configuración de Supabase

## Credenciales Configuradas

Ya tienes configurado:
- ✅ **URL**: https://ezeossgssgkniskbkvyn.supabase.co
- ✅ **Anon Key**: Configurada en `.env`

## Credenciales que Necesitas Obtener

### 1. Service Role Key

1. Ve a tu [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** > **API**
4. Busca **service_role** key (⚠️ Mantén esto secreto, nunca lo expongas en el cliente)
5. Cópiala y agrégala a `.env` como `SUPABASE_SERVICE_ROLE_KEY`

### 2. Database Connection String

1. En el mismo proyecto, ve a **Settings** > **Database**
2. Busca la sección **Connection string**
3. Selecciona **URI** o **Connection pooling**
4. Reemplaza `[YOUR-PASSWORD]` con tu contraseña de base de datos
5. Agrégala a `.env` como `DATABASE_URL`

**Formato esperado:**
```
postgresql://postgres:[TU-PASSWORD]@db.ezeossgssgkniskbkvyn.supabase.co:5432/postgres
```

O si usas connection pooling:
```
postgresql://postgres:[TU-PASSWORD]@db.ezeossgssgkniskbkvyn.supabase.co:6543/postgres?pgbouncer=true
```

## Verificación

Una vez que tengas todas las credenciales en `.env`, verifica la conexión:

```bash
# Generar Prisma Client
npm run db:generate

# Probar conexión (esto creará las tablas si no existen)
npm run db:push

# Ejecutar seed (crea el curso y contenido)
npm run db:seed
```

## Notas Importantes

- ⚠️ **NUNCA** commitees el archivo `.env` a git
- ✅ El archivo `.env` ya está en `.gitignore`
- 🔒 La **Service Role Key** tiene acceso completo a tu base de datos - úsala solo en el servidor
- 📝 La **Anon Key** es segura para usar en el cliente (Next.js la expone con `NEXT_PUBLIC_`)

## Próximos Pasos

1. Obtén la Service Role Key y Database URL
2. Actualiza tu `.env`
3. Ejecuta `npm run db:push` para crear las tablas
4. Ejecuta `npm run db:seed` para poblar con datos iniciales
5. Inicia el servidor con `npm run dev`

