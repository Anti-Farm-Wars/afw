import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').filter(Boolean);
    
    // Expected paths: /coc-api/clan/:tag or /coc-api/player/:tag
    const type = path[path.length - 2]; // 'clan' or 'player'
    const tag = path[path.length - 1];

    if (!tag || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing tag or type parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cocToken = Deno.env.get('COC_API_TOKEN');
    if (!cocToken) {
      console.error('COC_API_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'API token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean the tag - remove # if present and encode it properly
    const cleanTag = tag.replace(/^#/, '');
    const encodedTag = encodeURIComponent(`#${cleanTag}`);

    console.log(`Fetching ${type} data for tag: #${cleanTag}`);

    let cocUrl = '';
    if (type === 'clan') {
      cocUrl = `https://api.clashofclans.com/v1/clans/${encodedTag}`;
    } else if (type === 'player') {
      cocUrl = `https://api.clashofclans.com/v1/players/${encodedTag}`;
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid type. Use "clan" or "player"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cocResponse = await fetch(cocUrl, {
      headers: {
        'Authorization': `Bearer ${cocToken}`,
        'Accept': 'application/json',
      },
    });

    if (!cocResponse.ok) {
      const errorText = await cocResponse.text();
      console.error(`CoC API error: ${cocResponse.status} - ${errorText}`);
      
      let errorMessage = 'Failed to fetch data from Clash of Clans API';
      if (cocResponse.status === 404) {
        errorMessage = `${type === 'clan' ? 'Clan' : 'Player'} not found`;
      } else if (cocResponse.status === 403) {
        errorMessage = 'API access denied. Please check your IP address.';
      } else if (cocResponse.status === 429) {
        errorMessage = 'Too many requests. Please try again later.';
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: cocResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cocData = await cocResponse.json();

    // If it's a clan lookup, also check for associations
    if (type === 'clan') {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: association } = await supabase
        .from('clan_associations')
        .select('*')
        .eq('clan_tag', `#${cleanTag}`)
        .maybeSingle();

      return new Response(
        JSON.stringify({
          clan: cocData,
          association: association,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(cocData),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in coc-api function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
