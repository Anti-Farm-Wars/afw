CREATE OR REPLACE FUNCTION public.get_opponent_match_counts()
RETURNS TABLE (opponent_tag text, times_matched bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.opponent_tag, COUNT(DISTINCT r.scan_id) AS times_matched
  FROM public.war_match_results r
  WHERE r.opponent_tag IS NOT NULL
    AND public.can_view_war_tracker(auth.uid())
  GROUP BY r.opponent_tag
$$;

GRANT EXECUTE ON FUNCTION public.get_opponent_match_counts() TO authenticated;