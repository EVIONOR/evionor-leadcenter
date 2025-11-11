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
    const evionorServiceKey = Deno.env.get('EVIONOR_SUPABASE_SERVICE_KEY');

    if (!evionorUrl || !evionorServiceKey) {
      throw new Error('EVIONOR Supabase credentials not configured');
    }

    console.log('Checking admin role for user');

    const evionorSupabase = createClient(evionorUrl, evionorServiceKey);

    const { userId } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('Checking admin role for user:', userId);

    const { data, error } = await evionorSupabase.rpc('has_role', {
      _user_id: userId,
      _role: 'admin'
    });

    if (error) {
      console.error('Error checking admin role:', error);
      throw error;
    }

    console.log('Admin check result:', data);

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
