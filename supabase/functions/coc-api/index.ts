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

    const cocEmail = Deno.env.get('COC_EMAIL');
    const cocPassword = Deno.env.get('COC_PASSWORD');
    
    if (!cocEmail || !cocPassword) {
      console.error('COC_EMAIL or COC_PASSWORD not configured');
      return new Response(
        JSON.stringify({ error: 'API credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Login to get temporary token
    console.log('Logging in to CoC API...');
    const loginResponse = await fetch('https://developer.clashofclans.com/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: cocEmail,
        password: cocPassword,
      }),
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error(`CoC login failed: ${loginResponse.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate with Clash of Clans API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const loginData = await loginResponse.json();
    const cocToken = loginData.temporaryAPIToken;
    
    if (!cocToken) {
      console.error('No token received from login');
      return new Response(
        JSON.stringify({ error: 'Failed to obtain API token' }),
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
