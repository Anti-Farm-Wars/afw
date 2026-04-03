
-- Update is_staff to include mod
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('primary_admin', 'admin', 'staff', 'mod')
  )
$$;

-- Create has_any_role function
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- Fix search_path on update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Update admin INSERT policy for user_roles
DROP POLICY IF EXISTS "Admins can create staff roles" ON public.user_roles;
CREATE POLICY "Admins can create staff and mod roles"
ON public.user_roles
FOR INSERT
TO public
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  AND role IN ('staff'::app_role, 'mod'::app_role, 'view_sync'::app_role)
);
