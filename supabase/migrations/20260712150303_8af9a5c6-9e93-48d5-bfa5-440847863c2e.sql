
CREATE OR REPLACE FUNCTION public.can_view_war_tracker(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('primary_admin', 'admin', 'mod', 'war_tracker')
  )
$$;

CREATE TABLE public.war_match_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_clans integer NOT NULL DEFAULT 0,
  clans_in_war integer NOT NULL DEFAULT 0,
  successful_matches integer NOT NULL DEFAULT 0,
  mismatches integer NOT NULL DEFAULT 0,
  mismatch_percentage numeric NOT NULL DEFAULT 0,
  blacklisted_matches integer NOT NULL DEFAULT 0,
  association_matches integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'running',
  run_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.war_match_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid NOT NULL REFERENCES public.war_match_scans(id) ON DELETE CASCADE,
  clan_tag text NOT NULL,
  clan_name text,
  opponent_tag text,
  opponent_name text,
  war_state text,
  is_match boolean NOT NULL DEFAULT false,
  is_blacklisted boolean NOT NULL DEFAULT false,
  is_association boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_war_match_results_scan_id ON public.war_match_results(scan_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.war_match_scans TO authenticated;
GRANT ALL ON public.war_match_scans TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.war_match_results TO authenticated;
GRANT ALL ON public.war_match_results TO service_role;

ALTER TABLE public.war_match_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.war_match_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "War tracker viewers can read scans"
ON public.war_match_scans FOR SELECT TO authenticated
USING (public.can_view_war_tracker(auth.uid()));

CREATE POLICY "War tracker viewers can read results"
ON public.war_match_results FOR SELECT TO authenticated
USING (public.can_view_war_tracker(auth.uid()));

CREATE TRIGGER update_war_match_scans_updated_at
BEFORE UPDATE ON public.war_match_scans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
