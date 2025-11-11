import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const evionorUrl = Deno.env.get('EVIONOR_SUPABASE_URL');
    const evionorKey = Deno.env.get('EVIONOR_SUPABASE_ANON_KEY');

    if (!evionorUrl || !evionorKey) {
      throw new Error('EVIONOR Supabase credentials not configured');
    }

    console.log('Connecting to EVIONOR Supabase:', evionorUrl);

    // Create client for EVIONOR Supabase
    const evionorSupabase = createClient(evionorUrl, evionorKey);

    const { action, table, query } = await req.json();

    console.log('Action requested:', action);

    let result;

    switch (action) {
      case 'list_tables':
        // Note: Cannot query information_schema via REST API
        // Return a message asking for specific table names
        result = { 
          message: 'Cannot list tables via REST API. Please provide specific table names to query.',
          suggestion: 'Use action "query_table" with a table name, or check your EVIONOR Supabase dashboard for available tables.'
        };
        break;

      case 'query_table':
        if (!table) {
          throw new Error('Table name is required for query_table action');
        }

        console.log('Querying table:', table);

        const { data, error } = await evionorSupabase
          .from(table)
          .select('*')
          .limit(100);

        if (error) {
          console.error('Error querying table:', error);
          throw error;
        }

        result = { data, count: data?.length || 0 };
        break;

      case 'custom_query':
        if (!query) {
          throw new Error('Query parameters are required for custom_query action');
        }

        console.log('Running custom query on table:', query.table);

        const queryBuilder = evionorSupabase.from(query.table).select(query.select || '*');

        if (query.limit) {
          queryBuilder.limit(query.limit);
        }

        const { data: customData, error: customError } = await queryBuilder;

        if (customError) {
          console.error('Error running custom query:', customError);
          throw customError;
        }

        result = { data: customData, count: customData?.length || 0 };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log('Query successful');

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in query-evionor function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
