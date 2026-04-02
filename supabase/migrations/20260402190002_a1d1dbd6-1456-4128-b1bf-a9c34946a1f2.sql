
CREATE TABLE public.league_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_name text NOT NULL,
  spin_time timestamptz NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'scheduled',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.league_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view league schedules"
ON public.league_schedules FOR SELECT
USING (true);

CREATE POLICY "Staff can insert league schedules"
ON public.league_schedules FOR INSERT
WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update league schedules"
ON public.league_schedules FOR UPDATE
USING (public.is_staff(auth.uid()));

CREATE POLICY "Admins can delete league schedules"
ON public.league_schedules FOR DELETE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'primary_admin'));

CREATE TRIGGER update_league_schedules_updated_at
BEFORE UPDATE ON public.league_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.league_schedules;
