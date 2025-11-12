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
    
    // Expected paths: /coc-api/clan/:tag, /coc-api/clan/:tag/cwl, or /coc-api/player/:tag
    const isCWL = path[path.length - 1] === 'cwl';
    const type = isCWL ? path[path.length - 3] : path[path.length - 2]; // 'clan' or 'player'
    const tag = isCWL ? path[path.length - 2] : path[path.length - 1];

    if (!tag || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing tag or type parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use the configured CoC API token
    const cocToken = Deno.env.get('COC_API_TOKEN');
    
    if (!cocToken) {
      console.error('COC_API_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'API token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Using configured CoC API token');

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

    // If it's a CWL lookup
    if (isCWL && type === 'clan') {
      try {
        const cwlUrl = `https://api.clashofclans.com/v1/clans/${encodedTag}/currentwar/leaguegroup`;
        const cwlResponse = await fetch(cwlUrl, {
          headers: {
            'Authorization': `Bearer ${cocToken}`,
            'Accept': 'application/json',
          },
        });

        if (cwlResponse.ok) {
          const cwlData = await cwlResponse.json();
          
          // Fetch detailed war data for each war in the rounds
          console.log('Fetching detailed war data for CWL rounds...');
          const warDetails = [];
          
          for (const round of cwlData.rounds || []) {
            console.log(`Processing round with ${round.warTags?.length || 0} war tags`);
            for (const warTag of round.warTags || []) {
              if (warTag && warTag !== '#0') {
                try {
                  const cleanWarTag = warTag.replace(/^#/, '');
                  const encodedWarTag = encodeURIComponent(`#${cleanWarTag}`);
                  const warUrl = `https://api.clashofclans.com/v1/clanwarleagues/wars/${encodedWarTag}`;
                  
                  console.log(`Fetching war: ${warTag}`);
                  const warResponse = await fetch(warUrl, {
                    headers: {
                      'Authorization': `Bearer ${cocToken}`,
                      'Accept': 'application/json',
                    },
                  });
                  
                  if (warResponse.ok) {
                    const warData = await warResponse.json();
                    // Add the war tag to the war data for easier filtering
                    warData.tag = warTag;
                    warDetails.push(warData);
                    console.log(`✅ Fetched war ${warTag} - State: ${warData.state}`);
                  } else {
                    console.log(`❌ Failed to fetch war ${warTag}: ${warResponse.status}`);
                  }
                } catch (error) {
                  console.log(`Error fetching war ${warTag}:`, error);
                }
              }
            }
          }
          
          console.log(`Total war details fetched: ${warDetails.length}`);
          
          // Calculate total stars and destruction for each clan
          const clanStats = new Map();
          
          for (const war of warDetails) {
            // Process clan stats
            if (war.clan) {
              const clanTag = war.clan.tag;
              if (!clanStats.has(clanTag)) {
                clanStats.set(clanTag, {
                  name: war.clan.name,
                  tag: clanTag,
                  stars: 0,
                  destructionPercentage: 0,
                  attacks: 0,
                  badgeUrls: war.clan.badgeUrls,
                });
              }
              const stats = clanStats.get(clanTag);
              stats.stars += war.clan.stars || 0;
              stats.destructionPercentage += war.clan.destructionPercentage || 0;
              stats.attacks += war.clan.attacks || 0;
            }
            
            // Process opponent stats
            if (war.opponent) {
              const opponentTag = war.opponent.tag;
              if (!clanStats.has(opponentTag)) {
                clanStats.set(opponentTag, {
                  name: war.opponent.name,
                  tag: opponentTag,
                  stars: 0,
                  destructionPercentage: 0,
                  attacks: 0,
                  badgeUrls: war.opponent.badgeUrls,
                });
              }
              const stats = clanStats.get(opponentTag);
              stats.stars += war.opponent.stars || 0;
              stats.destructionPercentage += war.opponent.destructionPercentage || 0;
              stats.attacks += war.opponent.attacks || 0;
            }
          }
          
          // Calculate average destruction percentage
          const warCount = warDetails.length / 2; // Each clan appears twice (once as clan, once as opponent)
          for (const stats of clanStats.values()) {
            if (stats.attacks > 0) {
              stats.destructionPercentage = stats.destructionPercentage / warCount;
            }
          }
          
          // Update clan data with calculated stats
          const enrichedClans = cwlData.clans.map((clan: any) => {
            const stats = clanStats.get(clan.tag);
            return {
              ...clan,
              stars: stats?.stars || 0,
              destructionPercentage: stats?.destructionPercentage || 0,
            };
          });
          
          return new Response(
            JSON.stringify({
              ...cwlData,
              clans: enrichedClans,
              warDetails: warDetails,
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          return new Response(
            JSON.stringify({ error: 'Not in CWL or CWL data not available' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (error) {
        console.error('Error fetching CWL data:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch CWL data' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // If it's a clan lookup, also check for associations and war data
    if (type === 'clan') {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: association } = await supabase
        .from('clan_associations')
        .select('*')
        .eq('clan_tag', `#${cleanTag}`)
        .maybeSingle();

      // Fetch current war data
      let currentWar = null;
      try {
        console.log('Fetching current war data...');
        const currentWarUrl = `https://api.clashofclans.com/v1/clans/${encodedTag}/currentwar`;
        const currentWarResponse = await fetch(currentWarUrl, {
          headers: {
            'Authorization': `Bearer ${cocToken}`,
            'Accept': 'application/json',
          },
        });
        console.log('Current war response status:', currentWarResponse.status);
        if (currentWarResponse.ok) {
          currentWar = await currentWarResponse.json();
          console.log('Current war state:', currentWar?.state);
        } else {
          console.log('Current war response not ok:', await currentWarResponse.text());
        }
      } catch (error) {
        console.log('Error fetching current war data:', error);
      }

      // Fetch war log history
      let warLog = null;
      try {
        console.log('Fetching war log data...');
        const warLogUrl = `https://api.clashofclans.com/v1/clans/${encodedTag}/warlog`;
        const warLogResponse = await fetch(warLogUrl, {
          headers: {
            'Authorization': `Bearer ${cocToken}`,
            'Accept': 'application/json',
          },
        });
        console.log('War log response status:', warLogResponse.status);
        if (warLogResponse.ok) {
          warLog = await warLogResponse.json();
          console.log('War log items count:', warLog?.items?.length || 0);
        } else {
          console.log('War log response not ok:', await warLogResponse.text());
        }
      } catch (error) {
        console.log('Error fetching war log data:', error);
      }

      return new Response(
        JSON.stringify({
          clan: cocData,
          association: association,
          currentWar: currentWar,
          warLog: warLog,
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
