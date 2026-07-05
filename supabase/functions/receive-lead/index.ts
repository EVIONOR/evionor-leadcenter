import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_RAW_PAYLOAD_BYTES = 20 * 1024; // 20 KB — plenty for a form submission
const MAX_STRING_FIELD_LENGTH = 500;

function asBoundedString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, MAX_STRING_FIELD_LENGTH);
}

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

    const rawBody = await req.text();
    if (rawBody.length > MAX_RAW_PAYLOAD_BYTES) {
      return new Response(
        JSON.stringify({ success: false, error: 'Payload too large' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 413 }
      );
    }

    const payload = JSON.parse(rawBody);
    if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Payload must be a JSON object' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Received webhook payload (keys):', Object.keys(payload));

    // Extract and bound-check data from the payload — never trust field sizes/types from the caller
    const leadData = {
      contact_name: asBoundedString(payload.contactName) ?? asBoundedString(payload.name),
      email: asBoundedString(payload.email),
      phone_number: asBoundedString(payload.phoneNumber) ?? asBoundedString(payload.phone),
      car_brand: asBoundedString(payload.carBrand),
      car_model: asBoundedString(payload.carModel),
      zip_code: asBoundedString(payload.zipCode),
      city: asBoundedString(payload.city),
      status: 'new',
      raw_data: payload
    };

    if (!leadData.email && !leadData.phone_number) {
      return new Response(
        JSON.stringify({ success: false, error: 'At least one of email or phone is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Insert the lead into the database
    const { data, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error.message);
      throw error;
    }

    console.log('Lead inserted successfully, id:', data.id);

    return new Response(
      JSON.stringify({ success: true, lead: data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing webhook:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});