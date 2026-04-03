
-- Add new role values to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'mod';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'view_sync';
