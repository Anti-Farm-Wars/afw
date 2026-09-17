ALTER TABLE public.war_match_results ADD COLUMN IF NOT EXISTS team_size integer;

CREATE TABLE IF NOT EXISTS public.hunter_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  min_encounters integer NOT NULL DEFAULT 10,
  live_days integer NOT NULL DEFAULT 14,
  retired_days integer NOT NULL DEFAULT 30,
  min_size_samples integer NOT NULL DEFAULT 3,
  size_consistency_pct numeric NOT NULL DEFAULT 70,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.hunter_settings TO authenticated;
GRANT ALL ON public.hunter_settings TO service_role;

ALTER TABLE public.hunter_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "War tracker viewers can read hunter settings"
ON public.hunter_settings FOR SELECT TO authenticated
USING (public.can_view_war_tracker(auth.uid()));

CREATE POLICY "Primary admin can manage hunter settings"
ON public.hunter_settings FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'primary_admin'))
WITH CHECK (public.has_role(auth.uid(), 'primary_admin'));

CREATE TRIGGER update_hunter_settings_updated_at
BEFORE UPDATE ON public.hunter_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.hunter_settings (min_encounters)
SELECT 10 WHERE NOT EXISTS (SELECT 1 FROM public.hunter_settings);

CREATE OR REPLACE FUNCTION public.get_hunter_lists()
RETURNS TABLE(
  opponent_tag text,
  opponent_name text,
  encounters bigint,
  first_seen timestamptz,
  last_seen timestamptz,
  days_since_last integer,
  usual_team_size integer,
  size_samples bigint,
  size_consistency numeric,
  consistent_composition boolean,
  association_type text,
  is_blacklisted boolean,
  top_opponents text[],
  list_type text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
WITH s AS (
  SELECT * FROM public.hunter_settings ORDER BY created_at LIMIT 1
),
enc AS (
  SELECT r.opponent_tag,
         r.clan_tag,
         date_trunc('day', r.created_at) AS d,
         max(r.opponent_name) AS opponent_name,
         min(r.created_at) AS first_at,
         max(r.created_at) AS last_at,
         mode() WITHIN GROUP (ORDER BY r.team_size) AS team_size
  FROM public.war_match_results r
  WHERE r.opponent_tag IS NOT NULL AND r.is_match = false
  GROUP BY r.opponent_tag, r.clan_tag, date_trunc('day', r.created_at)
),
agg AS (
  SELECT e.opponent_tag,
         (array_agg(e.opponent_name ORDER BY e.last_at DESC) FILTER (WHERE e.opponent_name IS NOT NULL))[1] AS opponent_name,
         count(*) AS encounters,
         min(e.first_at) AS first_seen,
         max(e.last_at) AS last_seen,
         mode() WITHIN GROUP (ORDER BY e.team_size) AS usual_team_size,
         count(e.team_size) AS size_samples,
         (array_agg(DISTINCT e.clan_tag))[1:5] AS top_opponents
  FROM enc e
  GROUP BY e.opponent_tag
),
sizes AS (
  SELECT e.opponent_tag, count(*) AS matching_size
  FROM enc e
  JOIN agg a ON a.opponent_tag = e.opponent_tag
  WHERE e.team_size IS NOT NULL AND e.team_size = a.usual_team_size
  GROUP BY e.opponent_tag
),
assoc AS (
  SELECT normalize.tag AS clan_tag,
         (array_agg(normalize.association_type))[1] AS association_type,
         bool_or(lower(trim(normalize.association_type)) = 'blacklist') AS is_blacklisted
  FROM (
    SELECT '#' || upper(regexp_replace(ca.clan_tag, '^#', '')) AS tag, ca.association_type
    FROM public.clan_associations ca
  ) normalize
  GROUP BY normalize.tag
)
SELECT a.opponent_tag,
       a.opponent_name,
       a.encounters,
       a.first_seen,
       a.last_seen,
       EXTRACT(day FROM (now() - a.last_seen))::int AS days_since_last,
       a.usual_team_size,
       a.size_samples,
       CASE WHEN a.size_samples > 0
            THEN round((COALESCE(sz.matching_size, 0)::numeric / a.size_samples) * 100, 2)
            ELSE NULL END AS size_consistency,
       CASE WHEN a.size_samples < (SELECT min_size_samples FROM s) THEN true
            ELSE (COALESCE(sz.matching_size, 0)::numeric / a.size_samples) * 100 >= (SELECT size_consistency_pct FROM s)
       END AS consistent_composition,
       ac.association_type,
       COALESCE(ac.is_blacklisted, false) AS is_blacklisted,
       a.top_opponents,
       CASE
         WHEN a.last_seen < now() - make_interval(days => (SELECT retired_days FROM s)) THEN 'retired'
         WHEN a.last_seen >= now() - make_interval(days => (SELECT live_days FROM s))
              AND (CASE WHEN a.size_samples < (SELECT min_size_samples FROM s) THEN true
                        ELSE (COALESCE(sz.matching_size, 0)::numeric / a.size_samples) * 100 >= (SELECT size_consistency_pct FROM s) END)
           THEN 'live'
         ELSE 'hunting'
       END AS list_type
FROM agg a
LEFT JOIN sizes sz ON sz.opponent_tag = a.opponent_tag
LEFT JOIN assoc ac ON ac.clan_tag = a.opponent_tag
WHERE a.encounters >= (SELECT min_encounters FROM s)
ORDER BY a.encounters DESC
$function$;

REVOKE ALL ON FUNCTION public.get_hunter_lists() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_hunter_lists() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_hunter_lists() TO authenticated;