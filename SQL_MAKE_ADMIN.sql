-- SQL para hacer admin a un usuario en Supabase
-- Ejecuta esto en el SQL Editor de Supabase

-- Opción 1: Si el usuario ya existe, actualiza su rol
UPDATE "User"
SET role = 'ADMIN'
WHERE email = 'picassoglitch@gmail.com';

-- Opción 2: Si el usuario no existe, créalo como admin
-- (Esto solo funciona si el usuario ya se registró en Supabase Auth)
INSERT INTO "User" (id, email, role, "createdAt")
VALUES (
  gen_random_uuid(),
  'picassoglitch@gmail.com',
  'ADMIN',
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET role = 'ADMIN';

-- Verificar que se actualizó correctamente
SELECT id, email, role, "createdAt"
FROM "User"
WHERE email = 'picassoglitch@gmail.com';


