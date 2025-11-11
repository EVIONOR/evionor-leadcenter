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
    const evionorAnonKey = Deno.env.get('EVIONOR_SUPABASE_ANON_KEY');
    const evionorServiceKey = Deno.env.get('EVIONOR_SUPABASE_SERVICE_KEY');

    if (!evionorUrl || !evionorAnonKey) {
      throw new Error('EVIONOR Supabase credentials not configured');
    }

    console.log('Connecting to EVIONOR Supabase:', evionorUrl);

    const { action, table, query, update } = await req.json();
    
    // Use service key for all queries to bypass RLS
    const useServiceKey = true;
    const apiKey = useServiceKey && evionorServiceKey ? evionorServiceKey : evionorAnonKey;
    
    // Create client for EVIONOR Supabase
    const client = createClient(evionorUrl, apiKey, {
      auth: {
        persistSession: false
      }
    });

    console.log('Action requested:', action, 'Using service key:', useServiceKey);

    let result;

    switch (action) {
      case 'list_tables':
        // Query pg_catalog to list tables using service key
        const { data: tables, error: tablesError } = await client.rpc('get_tables_list');
        
        if (tablesError) {
          console.error('Error listing tables:', tablesError);
          // Fallback: try direct query
          const response = await fetch(`${evionorUrl}/rest/v1/rpc/get_tables_list`, {
            method: 'POST',
            headers: {
              'apikey': apiKey,
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            // If RPC doesn't exist, return instructions
            result = { 
              tables: [],
              message: 'Could not list tables. This requires a custom RPC function in your EVIONOR database.',
              instruction: 'Create this function in your EVIONOR Supabase SQL editor:\n\nCREATE OR REPLACE FUNCTION get_tables_list()\nRETURNS TABLE (table_name text, table_schema text) \nLANGUAGE sql\nSECURITY DEFINER\nAS $$\n  SELECT tablename::text, schemaname::text \n  FROM pg_tables \n  WHERE schemaname = \'public\'\n  ORDER BY tablename;\n$$;'
            };
          } else {
            const data = await response.json();
            result = { tables: data };
          }
        } else {
          result = { tables };
        }
        break;
      
      case 'get_schema':
        if (!table) {
          throw new Error('Table name is required for get_schema action');
        }
        
        console.log('Getting schema for table:', table);
        
        // Query information about columns
        const { data: columns, error: schemaError } = await client.rpc('get_table_schema', { table_name: table });
        
        if (schemaError) {
          console.error('Error getting schema:', schemaError);
          result = {
            message: 'Could not get schema. Create this RPC function in EVIONOR Supabase:\n\nCREATE OR REPLACE FUNCTION get_table_schema(table_name text)\nRETURNS TABLE (\n  column_name text,\n  data_type text,\n  is_nullable text\n)\nLANGUAGE sql\nSECURITY DEFINER\nAS $$\n  SELECT \n    column_name::text,\n    data_type::text,\n    is_nullable::text\n  FROM information_schema.columns\n  WHERE table_schema = \'public\'\n    AND table_name = $1\n  ORDER BY ordinal_position;\n$$;'
          };
        } else {
          result = { schema: columns };
        }
        break;

      case 'query_table':
        if (!table) {
          throw new Error('Table name is required for query_table action');
        }

        console.log('Querying table:', table);

        const { data, error } = await client
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

        console.log('Running custom query on table:', query.table, 'filters:', query.filters);

        const queryBuilder = client.from(query.table).select(query.select || '*', { count: 'exact' });

        // Apply filters
        if (query.filters) {
          Object.entries(query.filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              queryBuilder.eq(key, value);
            }
          });
        }

        // Apply pagination
        if (query.limit) {
          queryBuilder.limit(query.limit);
        }

        if (query.offset) {
          queryBuilder.range(query.offset, query.offset + (query.limit || 100) - 1);
        }

        // Apply ordering
        if (query.order) {
          queryBuilder.order(query.order.column || 'created_at', { 
            ascending: query.order.ascending !== false 
          });
        } else {
          queryBuilder.order('created_at', { ascending: false });
        }

        const { data: customData, error: customError, count: totalCount } = await queryBuilder;

        if (customError) {
          console.error('Error running custom query:', {
            message: customError.message,
            details: customError.details,
            hint: customError.hint,
            code: customError.code
          });
          throw new Error(`Query failed: ${customError.message} (${customError.code})`);
        }

        result = { data: customData, count: totalCount || 0 };
        break;

      case 'update':
        if (!update || !update.id || !table || !update.data) {
          throw new Error('Update action requires: table, update.id, and update.data');
        }

        console.log('Updating record in table:', table, 'id:', update.id);

        const { data: updatedData, error: updateError } = await client
          .from(table)
          .update(update.data)
          .eq('id', update.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating record:', updateError);
          throw updateError;
        }

        result = { data: updatedData };
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
    const errorDetails = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : { message: String(error) };
    
    console.error('Error in query-evionor function:', errorDetails);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorDetails.message,
        details: errorDetails
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
