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
    console.log('[process-leads] Starting automatic lead processing...');

    const evionorUrl = Deno.env.get('EVIONOR_SUPABASE_URL');
    const evionorServiceKey = Deno.env.get('EVIONOR_SUPABASE_SERVICE_KEY');

    if (!evionorUrl || !evionorServiceKey) {
      throw new Error('EVIONOR Supabase credentials not configured');
    }

    const client = createClient(evionorUrl, evionorServiceKey, {
      auth: { persistSession: false }
    });

    // Step 1: Check if automatic processing is enabled
    console.log('[process-leads] Checking automatic processing setting...');
    const { data: settingData, error: settingError } = await client
      .from('lead_manager_settings')
      .select('setting_value')
      .eq('setting_key', 'automatic_processing_enabled')
      .single();

    if (settingError || !settingData?.setting_value?.enabled) {
      console.log('[process-leads] Automatic processing is disabled, skipping...');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Automatic processing is disabled',
          processed: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log('[process-leads] Automatic processing is enabled');

    // Step 2: Fetch all unprocessed leads (status != qualified)
    const { data: leads, error: leadsError } = await client
      .from('questionnaire_responses')
      .select('*')
      .neq('status', 'qualified')
      .order('created_at', { ascending: true });

    if (leadsError) {
      console.error('[process-leads] Error fetching leads:', leadsError);
      throw leadsError;
    }

    console.log(`[process-leads] Found ${leads?.length || 0} leads to process`);

    if (!leads || leads.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No leads to process',
          processed: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    let processedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Step 3: Process each lead
    for (const lead of leads) {
      try {
        console.log(`[process-leads] Processing lead ${lead.id} (${lead.email})`);

        // Step 3a: Apply "Fill Form" logic
        const leadData = {
          contactName: lead.name || "",
          email: lead.email || "",
          phoneNumber: lead.phone || "",
          carBrand: lead.car_brand || "",
          carModel: lead.car_model || "",
          location: lead.location || "",
          phases: lead.phases || "1",
        };

        // Step 3b: Apply "Autofill" logic
        const autofillData = {
          ...leadData,
          zipCode: "",
          city: "",
          amperage: "32",
          installLocation: "Garázs",
          buildingType: "",
          needsInstallation: true,
          needsElectricalPlanning: false,
          indoorOutdoor: "beltér",
          mountingSurface: "",
          needsBackplate: false,
          needsPole: false,
          distanceFromBox: "10",
          spaceInBox: "nemtudom",
          groundworkWallPenetration: "",
          otherComments: "",
          solarIntegration: "nem",
          loadManagement: true,
          builtInCable: false,
          needsApp: true,
          infrastructureDevelopment: false,
          infrastructureDetails: "",
          overvoltageProtection: false,
          networkExpansion: false,
          expansionPhase: "",
          expansionAmperage: "",
        };

        // Step 3c: Generate email HTML (simplified version)
        const emailSubject = `EVIONOR - Töltő ajánlat ${autofillData.contactName} részére`;
        const emailHtml = generateEmailHtml(autofillData);

        console.log(`[process-leads] Generated email for ${lead.email}`);

        // Step 3d: Send email
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (!resendApiKey) {
          throw new Error('RESEND_API_KEY not configured');
        }

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'EVIONOR <hello@evionor.hu>',
            to: [lead.email],
            subject: emailSubject,
            html: emailHtml,
          }),
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          throw new Error(`Email send failed: ${errorText}`);
        }

        console.log(`[process-leads] Email sent to ${lead.email}`);

        // Step 3e: Mark as qualified
        const { error: updateError } = await client
          .from('questionnaire_responses')
          .update({ status: 'qualified' })
          .eq('id', lead.id);

        if (updateError) {
          console.error(`[process-leads] Error updating lead ${lead.id}:`, updateError);
          throw updateError;
        }

        console.log(`[process-leads] Lead ${lead.id} marked as qualified`);
        processedCount++;

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[process-leads] Error processing lead ${lead.id}:`, errorMsg);
        errors.push(`Lead ${lead.id}: ${errorMsg}`);
        errorCount++;
      }
    }

    console.log(`[process-leads] Processing complete. Processed: ${processedCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${processedCount} leads with ${errorCount} errors`,
        processed: processedCount,
        errors: errorCount > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[process-leads] Fatal error:', errorMsg);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMsg 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Email generation function (simplified from EmailGenerator.tsx)
function generateEmailHtml(data: any): string {
  const greeting = data.contactName.includes('Kft') || data.contactName.includes('Zrt') 
    ? `Kedves ${data.contactName}!` 
    : `Kedves ${data.contactName}!`;

  return `<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EV-Töltő Ajánlat</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0071e3 0%, #005bb5 100%); padding: 24px 32px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">EV-Töltő Ajánlat</h1>
      <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Személyre szabott megoldás az Ön igényeihez</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 32px;">
      <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">${greeting}</p>
      
      <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">
        Köszönjük érdeklődését az elektromos töltőberendezések iránt. Az Ön adatai alapján összeállítottuk ajánlatunkat.
      </p>

      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 24px 0;">
        <h3 style="margin: 0 0 12px 0; color: #111827; font-size: 16px;">Az Ön adatai:</h3>
        <p style="margin: 6px 0; color: #6b7280; font-size: 14px;">Autó: ${data.carBrand} ${data.carModel}</p>
        <p style="margin: 6px 0; color: #6b7280; font-size: 14px;">Fázis: ${data.phases} fázis</p>
        <p style="margin: 6px 0; color: #6b7280; font-size: 14px;">Áramerősség: ${data.amperage}A</p>
        <p style="margin: 6px 0; color: #6b7280; font-size: 14px;">Telepítési hely: ${data.installLocation}</p>
      </div>

      <p style="margin: 24px 0 0 0; color: #374151; font-size: 15px; line-height: 1.6;">
        Kollégánk hamarosan felveszi Önnel a kapcsolatot a részletek egyeztetése végett.
      </p>

      <p style="margin: 24px 0 0 0; color: #374151; font-size: 15px; line-height: 1.6;">
        Üdvözlettel,<br>
        <strong>EVIONOR Csapata</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #6b7280; font-size: 12px;">
        © ${new Date().getFullYear()} EVIONOR. Minden jog fenntartva.
      </p>
      <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 12px;">
        <a href="https://evionor.hu" style="color: #0071e3; text-decoration: none;">evionor.hu</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
