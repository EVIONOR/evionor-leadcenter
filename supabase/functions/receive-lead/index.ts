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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload = await req.json();
    console.log('Received webhook payload:', payload);

    // Extract data from the payload
    const leadData = {
      contact_name: payload.contactName || payload.name || null,
      email: payload.email || null,
      phone_number: payload.phoneNumber || payload.phone || null,
      car_brand: payload.carBrand || null,
      car_model: payload.carModel || null,
      zip_code: payload.zipCode || null,
      city: payload.city || null,
      status: 'new',
      raw_data: payload
    };

    console.log('Inserting lead data:', leadData);

    // Insert the lead into the database
    const { data, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Lead inserted successfully:', data);

    return new Response(
      JSON.stringify({ success: true, lead: data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
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