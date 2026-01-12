-- Step 1: Remove foreign key constraint temporarily
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- After running: npx prisma db push
-- Step 2: Re-add the constraint (run this after db push completes)
-- ALTER TABLE public.profiles 
-- ADD CONSTRAINT profiles_id_fkey 
-- FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
