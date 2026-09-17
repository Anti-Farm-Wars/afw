import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', ...extra },
  });

const VALID_LISTS = ['hunting', 'live', 'retired', 'all'] as const;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const expectedKey = Deno.env.get('HUNTERS_API_KEY');
  if (!expectedKey) return json({ error: 'API key not configured' }, 500);

  const url = new URL(req.url);
  const provided =
    req.headers.get('x-api-key') ??
    (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '') ??
    url.searchParams.get('key');

  if (!provided || provided !== expectedKey) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const listParam = (url.searchParams.get('list') ?? 'all').toLowerCase();
  if (!VALID_LISTS.includes(listParam as typeof VALID_LISTS[number])) {
    return json({ error: `Invalid list. Use one of: ${VALID_LISTS.join(', ')}` }, 400);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data, error } = await supabase.rpc('get_hunter_lists');
  if (error) {
    console.error('get_hunter_lists failed:', error.message);
    return json({ error: 'Failed to load hunter lists' }, 500);
  }

  const rows = (data ?? []).map((r: any) => ({
    tag: r.opponent_tag,
    name: r.opponent_name,
    encounters: Number(r.encounters),
    first_seen: r.first_seen,
    last_seen: r.last_seen,
    days_since_last: r.days_since_last,
    usual_team_size: r.usual_team_size,
    size_samples: Number(r.size_samples ?? 0),
    size_consistency: r.size_consistency === null ? null : Number(r.size_consistency),
    consistent_composition: r.consistent_composition,
    association_type: r.association_type,
    blacklisted: r.is_blacklisted,
    matched_fwa_clans: r.top_opponents ?? [],
    list: r.list_type,
  }));

  const hunting = rows;
  const live = rows.filter((r) => r.list === 'live');
  const retired = rows.filter((r) => r.list === 'retired');

  const payload =
    listParam === 'all'
      ? {
          generated_at: new Date().toISOString(),
          counts: { hunting: hunting.length, live: live.length, retired: retired.length },
          hunting_clans: hunting,
          live_hunters: live,
          retired_hunters: retired,
        }
      : {
          generated_at: new Date().toISOString(),
          list: listParam,
          count: listParam === 'live' ? live.length : listParam === 'retired' ? retired.length : hunting.length,
          clans: listParam === 'live' ? live : listParam === 'retired' ? retired : hunting,
        };

  return json(payload, 200, { 'Cache-Control': 'public, max-age=300' });
});
