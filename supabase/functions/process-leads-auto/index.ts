import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadData {
  contactName: string;
  email: string;
  phoneNumber: string;
  carBrand: string;
  carModel: string;
  location: string;
  phases: string;
  amperage: string;
  installLocation: string;
  needsInstallation: boolean;
  needsElectricalPlanning: boolean;
  indoorOutdoor: string;
  mountingSurface: string;
  needsBackplate: boolean;
  needsPole: boolean;
  distanceFromBox: string;
  spaceInBox: string;
  groundworkWallPenetration: string;
  solarIntegration: string;
  loadManagement: boolean;
  builtInCable: boolean;
  needsApp: boolean;
  infrastructureDevelopment: boolean;
  infrastructureDetails: string;
  overvoltageProtection: boolean;
  networkExpansion: boolean;
  expansionPhase: string;
  expansionAmperage: string;
  otherComments: string;
  buildingType: string;
  city: string;
  zipCode: string;
  customCar: string;
}

// Get default autofill data
const getDefaultAutofillData = () => ({
  amperage: "32",
  installLocation: "Garázs",
  needsInstallation: true,
  needsElectricalPlanning: false,
  indoorOutdoor: "beltér",
  mountingSurface: "",
  needsBackplate: false,
  needsPole: false,
  distanceFromBox: "10",
  spaceInBox: "nemtudom",
  groundworkWallPenetration: "",
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
  otherComments: "",
  buildingType: "családi_ház",
  city: "",
  zipCode: "",
  customCar: "",
});

// Merge lead data with autofill defaults
const mergeLeadData = (leadResponse: any): LeadData => {
  const autofillData = getDefaultAutofillData();
  
  return {
    contactName: leadResponse.name || "",
    email: leadResponse.email || "",
    phoneNumber: leadResponse.phone || "",
    carBrand: leadResponse.car_brand || "",
    carModel: leadResponse.car_model || "",
    location: leadResponse.location || "",
    phases: leadResponse.phases || "1",
    ...autofillData,
  };
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting automatic lead processing...");

    // Initialize Supabase clients
    const evionorClient = createClient(
      Deno.env.get("EVIONOR_SUPABASE_URL")!,
      Deno.env.get("EVIONOR_SUPABASE_SERVICE_KEY")!
    );

    const localClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if auto-processing is enabled
    const { data: settingsData, error: settingsError } = await localClient
      .from("settings")
      .select("value")
      .eq("key", "auto_process_leads")
      .single();

    if (settingsError) {
      console.error("Error fetching settings:", settingsError);
      throw settingsError;
    }

    if (!settingsData?.value?.enabled) {
      console.log("Auto-processing is disabled. Skipping.");
      return new Response(
        JSON.stringify({ success: true, message: "Auto-processing is disabled" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch unprocessed leads (status != "qualified")
    const { data: leads, error: leadsError } = await evionorClient
      .from("questionnaire_responses")
      .select("*")
      .neq("status", "qualified")
      .order("created_at", { ascending: true });

    if (leadsError) {
      console.error("Error fetching leads:", leadsError);
      throw leadsError;
    }

    if (!leads || leads.length === 0) {
      console.log("No unprocessed leads found.");
      return new Response(
        JSON.stringify({ success: true, message: "No leads to process" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${leads.length} leads to process`);

    const results = [];

    for (const lead of leads) {
      try {
        console.log(`Processing lead ${lead.id}...`);

        // Step 1 & 2: Merge lead data with autofill defaults
        const fullLeadData = mergeLeadData(lead);

        // Step 3 & 4: Generate and send email
        const emailHtml = generateEmailHTML(fullLeadData);
        
        const { error: emailError } = await localClient.functions.invoke("send-email", {
          body: {
            to: fullLeadData.email,
            subject: "EV-Töltő Beszerzési Ajánlat",
            html: emailHtml,
            from: "EVIONOR <hello@evionor.hu>",
          },
        });

        if (emailError) {
          console.error(`Error sending email for lead ${lead.id}:`, emailError);
          results.push({ id: lead.id, success: false, error: emailError.message });
          continue;
        }

        // Step 5: Mark as qualified
        const { error: updateError } = await evionorClient
          .from("questionnaire_responses")
          .update({ status: "qualified" })
          .eq("id", lead.id);

        if (updateError) {
          console.error(`Error updating lead ${lead.id}:`, updateError);
          results.push({ id: lead.id, success: false, error: updateError.message });
          continue;
        }

        console.log(`Successfully processed lead ${lead.id}`);
        results.push({ id: lead.id, success: true });
      } catch (error: any) {
        console.error(`Error processing lead ${lead.id}:`, error);
        results.push({ id: lead.id, success: false, error: error.message });
      }
    }

    console.log("Automatic lead processing completed");

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in process-leads-auto function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Simplified email generation (placeholder - you'll need to integrate with EmailGenerator logic)
const generateEmailHTML = (data: LeadData): string => {
  // This is a simplified version - you would need to integrate the full email template
  // from src/components/questionnaire/EmailGenerator.tsx
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>EV-Töltő Beszerzési Ajánlat</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h1>EV-Töltő Beszerzési Ajánlat</h1>
        <p>Tisztelt ${data.contactName}!</p>
        <p>Köszönjük érdeklődését! Az Ön által megadott adatok alapján az alábbi ajánlatot készítettük.</p>
        
        <h2>Ügyfél adatok</h2>
        <ul>
          <li><strong>Név:</strong> ${data.contactName}</li>
          <li><strong>Email:</strong> ${data.email}</li>
          <li><strong>Telefon:</strong> ${data.phoneNumber}</li>
          <li><strong>Jármű:</strong> ${data.carBrand} ${data.carModel}</li>
          <li><strong>Helyszín:</strong> ${data.location}</li>
          <li><strong>Fázis:</strong> ${data.phases} fázis</li>
          <li><strong>Áramerősség:</strong> ${data.amperage} A</li>
        </ul>

        <p>Hamarosan kollégánk felveszi Önnel a kapcsolatot a részletekkel kapcsolatban.</p>
        
        <p>Üdvözlettel,<br>Az EVIONOR Csapata</p>
        <p>
          <a href="tel:+36205819166">+36 20 581 9166</a><br>
          <a href="mailto:info@evionor.hu">info@evionor.hu</a><br>
          <a href="https://www.evionor.hu">www.evionor.hu</a>
        </p>
      </body>
    </html>
  `;
};

serve(handler);
