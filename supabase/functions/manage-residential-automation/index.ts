import { corsHeaders } from "../_shared/cors.ts";
import { requireEvionorAdmin } from "../_shared/evionorAdmin.ts";
import { fetchNewResidentialLeads } from "../_shared/residentialAutomation.ts";
import { auditResidentialLead } from "../_shared/residentialOfferServer.ts";
import {
  getResidentialAutomationEnabled,
  setResidentialAutomationEnabled,
} from "../_shared/settings.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    await requireEvionorAdmin(body.access_token);

    const action = body.action;
    if (action === "get") {
      const enabled = await getResidentialAutomationEnabled();
      return new Response(JSON.stringify({ success: true, enabled }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (action === "set") {
      if (typeof body.enabled !== "boolean") {
        throw new Error("enabled must be a boolean");
      }

      if (body.enabled) {
        const leads = await fetchNewResidentialLeads();
        const blockedLeads = leads
          .map(auditResidentialLead)
          .filter((lead) => lead.missingFields.length > 0);

        if (blockedLeads.length > 0) {
          return new Response(
            JSON.stringify({
              success: false,
              enabled: false,
              error: `Residential automation cannot be enabled while ${blockedLeads.length} new lead(s) are missing required fields. Run the dry run to review the blocked leads.`,
              blocked: blockedLeads.length,
              blockedLeads,
              processed: leads.length,
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            },
          );
        }
      }

      const enabled = await setResidentialAutomationEnabled(body.enabled);
      return new Response(JSON.stringify({ success: true, enabled }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    throw new Error(`Unsupported action: ${String(action)}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ success: false, error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
