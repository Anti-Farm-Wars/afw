REVOKE EXECUTE ON FUNCTION public.get_opponent_match_counts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_opponent_match_counts() TO authenticated;