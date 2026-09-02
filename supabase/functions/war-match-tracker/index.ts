import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CLANS_URL = 'https://fwastats.com/Clans.json';
const BATCH_SIZE = 8;

const normalizeTag = (tag: string) => `#${(tag || '').replace(/^#/, '').toUpperCase()}`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceKey);

  let scanId: string | null = null;

  try {
    // Identify the runner (optional — cron calls without a user)
    let runBy: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      try {
        const { data } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        runBy = data.user?.id ?? null;
      } catch (_) { /* ignore */ }
    }

    // --- Resolve a CoC API token (static or dynamically generated) ---
    const cocEmail = Deno.env.get('COC_EMAIL');
    const cocPassword = Deno.env.get('COC_PASSWORD');
    let cocToken = Deno.env.get('COC_API_TOKEN');

    const generateKey = async (): Promise<string | null> => {
      if (!cocEmail || !cocPassword) return null;
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const keyGenResponse = await fetch('https://get-sc-key.vercel.app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            game: 'clashofclans',
            email: cocEmail,
            password: cocPassword,
            fixedIp: ipData.ip,
          }),
        });
        if (keyGenResponse.ok) {
          const keyData = await keyGenResponse.json();
          if (keyData.key) return keyData.key as string;
        }
        console.log('Key generation returned', keyGenResponse.status);
      } catch (error) {
        console.log('Dynamic key generation failed:', error);
      }
      return null;
    };

    const generated = await generateKey();
    if (generated) cocToken = generated;

    if (!cocToken) {
      return new Response(JSON.stringify({ error: 'API token not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }


    // --- Fetch tracked FWA clans ---
    const clansResp = await fetch(CLANS_URL);
    if (!clansResp.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch tracked clans list' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const trackedClans: Array<{ tag: string; name: string }> = await clansResp.json();
    const trackedSet = new Set(trackedClans.map((c) => normalizeTag(c.tag)));

    // --- Load associations (tag -> types) ---
    const { data: associations } = await supabase
      .from('clan_associations')
      .select('clan_tag, association_type');
    const assocMap = new Map<string, string[]>();
    for (const a of associations ?? []) {
      const key = normalizeTag(a.clan_tag);
      const arr = assocMap.get(key) ?? [];
      arr.push((a.association_type || '').trim().toLowerCase());
      assocMap.set(key, arr);
    }

    // --- Create scan row ---
    const { data: scan, error: scanErr } = await supabase
      .from('war_match_scans')
      .insert({ total_clans: trackedClans.length, status: 'running', run_by: runBy })
      .select('id')
      .single();
    if (scanErr) throw scanErr;
    scanId = scan.id;

    let okResponses = 0;
    let forbidden = 0;

    const fetchCurrentWar = async (tag: string, retry = true): Promise<any> => {
      const encoded = encodeURIComponent(normalizeTag(tag));
      const url = `https://api.clashofclans.com/v1/clans/${encoded}/currentwar`;
      try {
        const resp = await fetch(url, {
          headers: { Authorization: `Bearer ${cocToken}`, Accept: 'application/json' },
        });
        if (resp.status === 403) {
          forbidden += 1;
          if (retry) {
            const fresh = await generateKey();
            if (fresh && fresh !== cocToken) {
              cocToken = fresh;
              return await fetchCurrentWar(tag, false);
            }
          }
          return null;
        }
        if (!resp.ok) return null;
        okResponses += 1;
        return await resp.json();
      } catch (_) {
        return null;
      }
    };

    const results: any[] = [];
    let clansInWar = 0;
    let successfulMatches = 0;
    let mismatches = 0;
    let blacklistedMatches = 0;
    let associationMatches = 0;


    for (let i = 0; i < trackedClans.length; i += BATCH_SIZE) {
      const batch = trackedClans.slice(i, i + BATCH_SIZE);
      const wars = await Promise.all(batch.map((c) => fetchCurrentWar(c.tag)));

      batch.forEach((clan, idx) => {
        const war = wars[idx];
        const clanTag = normalizeTag(clan.tag);
        const state = war?.state ?? 'notInWar';
        const hasOpponent = war && war.state !== 'notInWar' && war.opponent?.tag;

        if (!hasOpponent) {
          results.push({
            scan_id: scanId,
            clan_tag: clanTag,
            clan_name: clan.name,
            opponent_tag: null,
            opponent_name: null,
            war_state: state,
            is_match: false,
            is_blacklisted: false,
            is_association: false,
          });
          return;
        }

        clansInWar += 1;
        const opponentTag = normalizeTag(war.opponent.tag);
        const opponentName = war.opponent.name ?? null;
        const isMatch = trackedSet.has(opponentTag);
        const oppAssoc = assocMap.get(opponentTag) ?? [];
        const isBlacklisted = oppAssoc.includes('blacklist');
        const isAssociation = oppAssoc.length > 0;

        if (isMatch) successfulMatches += 1;
        else mismatches += 1;
        if (isBlacklisted) blacklistedMatches += 1;
        if (isAssociation) associationMatches += 1;

        results.push({
          scan_id: scanId,
          clan_tag: clanTag,
          clan_name: clan.name,
          opponent_tag: opponentTag,
          opponent_name: opponentName,
          war_state: state,
          is_match: isMatch,
          is_blacklisted: isBlacklisted,
          is_association: isAssociation,
        });
      });
    }

    // Persist results in chunks
    for (let i = 0; i < results.length; i += 500) {
      const { error: insErr } = await supabase
        .from('war_match_results')
        .insert(results.slice(i, i + 500));
      if (insErr) throw insErr;
    }

    const decided = successfulMatches + mismatches;
    const mismatchPct = decided > 0 ? Number(((mismatches / decided) * 100).toFixed(2)) : 0;

    const summary = {
      total_clans: trackedClans.length,
      clans_in_war: clansInWar,
      successful_matches: successfulMatches,
      mismatches,
      mismatch_percentage: mismatchPct,
      blacklisted_matches: blacklistedMatches,
      association_matches: associationMatches,
      status: 'completed',
    };

    await supabase.from('war_match_scans').update(summary).eq('id', scanId);

    return new Response(JSON.stringify({ scan_id: scanId, ...summary }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('war-match-tracker error:', error);
    if (scanId) {
      await supabase.from('war_match_scans').update({ status: 'failed' }).eq('id', scanId);
    }
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
