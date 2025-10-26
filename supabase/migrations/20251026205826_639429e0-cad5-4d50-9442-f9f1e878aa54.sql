-- Drop functions with CASCADE
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;
DROP FUNCTION IF EXISTS public.is_staff(uuid) CASCADE;

-- Drop and recreate enum
DROP TYPE IF EXISTS app_role CASCADE;
CREATE TYPE app_role AS ENUM ('primary_admin', 'admin', 'staff');

-- Drop and recreate user_roles table with new enum
DROP TABLE IF EXISTS public.user_roles CASCADE;
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Recreate helper functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('primary_admin', 'admin', 'staff')
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create association_types table
CREATE TABLE public.association_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.association_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view association types"
  ON public.association_types FOR SELECT
  USING (true);

CREATE POLICY "Primary admin can manage association types"
  ON public.association_types FOR ALL
  USING (has_role(auth.uid(), 'primary_admin'::app_role));

-- Create player_associations table
CREATE TABLE public.player_associations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_tag TEXT NOT NULL,
  player_name TEXT NOT NULL,
  association_type_id UUID REFERENCES public.association_types(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.player_associations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view player associations"
  ON public.player_associations FOR SELECT
  USING (true);

CREATE POLICY "Staff can insert player associations"
  ON public.player_associations FOR INSERT
  WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "Staff can update player associations"
  ON public.player_associations FOR UPDATE
  USING (is_staff(auth.uid()));

CREATE POLICY "Admins can delete player associations"
  ON public.player_associations FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'primary_admin'::app_role));

-- Add association_type_id to clan_associations
ALTER TABLE public.clan_associations 
  ADD COLUMN IF NOT EXISTS association_type_id UUID REFERENCES public.association_types(id) ON DELETE SET NULL;

-- Recreate clan_associations policies
CREATE POLICY "Staff can insert clan associations"
  ON public.clan_associations FOR INSERT
  WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "Staff can update clan associations"
  ON public.clan_associations FOR UPDATE
  USING (is_staff(auth.uid()));

CREATE POLICY "Admins can delete clan associations"
  ON public.clan_associations FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'primary_admin'::app_role));

-- Recreate user_roles policies
CREATE POLICY "Primary admin can manage all roles"
  ON public.user_roles FOR ALL
  USING (has_role(auth.uid(), 'primary_admin'::app_role));

CREATE POLICY "Admins can create staff roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) AND 
    role = 'staff'::app_role
  );

CREATE POLICY "Staff can view all roles"
  ON public.user_roles FOR SELECT
  USING (is_staff(auth.uid()));

-- Trigger for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_player_associations_updated_at
  BEFORE UPDATE ON public.player_associations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();