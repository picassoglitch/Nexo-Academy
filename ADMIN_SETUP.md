# Configuración de Usuario Admin

## Opción 1: Usar el script de API (Recomendado)

1. Asegúrate de que el servidor de desarrollo esté corriendo:
   ```bash
   npm run dev
   ```

2. En otra terminal, ejecuta:
   ```bash
   npm run make-admin-simple picassoglitch@gmail.com
   ```

## Opción 2: Usar la API directamente

Puedes hacer una petición POST a `/api/admin/bootstrap-admin`:

```bash
# Con curl (Linux/Mac)
curl -X POST http://localhost:3000/api/admin/bootstrap-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"picassoglitch@gmail.com"}'

# Con PowerShell (Windows)
Invoke-WebRequest -Uri http://localhost:3000/api/admin/bootstrap-admin `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"picassoglitch@gmail.com"}'
```

## Opción 3: Directamente en SQL Editor de Supabase (Más rápido)

1. Ve al SQL Editor en tu dashboard de Supabase
2. Ejecuta esta consulta:

```sql
-- Si el usuario ya existe, actualiza su rol
UPDATE "User"
SET role = 'ADMIN'
WHERE email = 'picassoglitch@gmail.com';

-- Verificar que se actualizó correctamente
SELECT id, email, role, "createdAt"
FROM "User"
WHERE email = 'picassoglitch@gmail.com';
```

Si el usuario no existe aún en la tabla `User`, primero necesitas que se registre en la aplicación (se crea automáticamente al iniciar sesión), o puedes crearlo manualmente:

```sql
-- Crear usuario admin si no existe
INSERT INTO "User" (id, email, role, "createdAt")
VALUES (
  gen_random_uuid(),
  'picassoglitch@gmail.com',
  'ADMIN',
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET role = 'ADMIN';
```

**Nota:** El archivo `SQL_MAKE_ADMIN.sql` contiene estas consultas listas para copiar y pegar.

## Opción 4: Desde el panel de admin (después del primer admin)

Una vez que tengas un admin, puedes promover otros usuarios desde:
- `/admin/usuarios` - Click en "Hacer Admin" para cualquier usuario

## Verificar que funciona

1. Inicia sesión con `picassoglitch@gmail.com`
2. Ve a `/admin` - Deberías ver el dashboard de administración
3. Si no funciona, verifica que el usuario exista en la base de datos (se crea automáticamente al iniciar sesión)

## Nota de Seguridad

La ruta `/api/admin/bootstrap-admin` no tiene protección de autenticación para permitir el bootstrap inicial. 
Después de crear el primer admin, considera:
- Eliminar esta ruta
- O agregar una verificación de que no existan admins antes de permitir crear uno nuevo

