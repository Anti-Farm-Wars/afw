-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('primary_staff', 'staff');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is any staff
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('primary_staff', 'staff')
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Staff can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Primary staff can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'primary_staff'))
WITH CHECK (public.has_role(auth.uid(), 'primary_staff'));

-- Create clan_associations table
CREATE TABLE public.clan_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clan_tag TEXT NOT NULL UNIQUE,
    clan_name TEXT NOT NULL,
    association_type TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.clan_associations ENABLE ROW LEVEL SECURITY;

-- RLS policies for clan_associations
CREATE POLICY "Anyone can view associations"
ON public.clan_associations
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Staff can insert associations"
ON public.clan_associations
FOR INSERT
TO authenticated
WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update associations"
ON public.clan_associations
FOR UPDATE
TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Primary staff can delete associations"
ON public.clan_associations
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'primary_staff'));

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clan_associations_updated_at
BEFORE UPDATE ON public.clan_associations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();