import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const evionorUrl = Deno.env.get('EVIONOR_SUPABASE_URL');
    const evionorAnonKey = Deno.env.get('EVIONOR_SUPABASE_ANON_KEY');
    const evionorServiceKey = Deno.env.get('EVIONOR_SUPABASE_SERVICE_KEY');

    if (!evionorUrl || !evionorAnonKey || !evionorServiceKey) {
      throw new Error('EVIONOR Supabase credentials not configured');
    }

    const { userId, access_token } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Verify the access token is valid and belongs to the claimed userId
    if (!access_token || typeof access_token !== 'string') {
      return new Response(
        JSON.stringify({ isAdmin: false, error: 'Authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const authClient = createClient(evionorUrl, evionorAnonKey, {
      auth: { persistSession: false },
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser(access_token);
    if (authError || !user || user.id !== userId) {
      return new Response(
        JSON.stringify({ isAdmin: false, error: 'Invalid or mismatched token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check admin role using service key
    const evionorSupabase = createClient(evionorUrl, evionorServiceKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await evionorSupabase.rpc('has_role', {
      _user_id: userId,
      _role: 'admin'
    });

    if (error) {
      console.error('Error checking admin role:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ isAdmin: data === true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in check-admin-role function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ isAdmin: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
