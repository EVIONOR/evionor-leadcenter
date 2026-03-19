import { corsHeaders } from "../_shared/cors.ts";
import { fetchNewResidentialLeads, markLeadAsAutoContacted } from "../_shared/residentialAutomation.ts";
import {
  auditResidentialLead,
  buildResidentialOfferWithQuotes,
  normalizeResidentialLead,
} from "../_shared/residentialOfferServer.ts";
import { requireEvionorAdmin, type EvionorQuestionnaireLead } from "../_shared/evionorAdmin.ts";
import { sendHtmlEmail } from "../_shared/sendMail.ts";
import { getResidentialAutomationEnabled } from "../_shared/settings.ts";

interface ProcessResult {
  blocked: number;
  blockedLeads: Array<{
    email: string;
    leadId: string;
    missingFields: string[];
  }>;
  errors: string[];
  mode: string;
  processed: number;
  sent: number;
  skipped: number;
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const mode = typeof body.mode === "string" ? body.mode : "scheduled";

    if (mode === "dry-run" || mode === "manual") {
      await requireEvionorAdmin(body.access_token);
    }

    if (mode === "scheduled") {
      const enabled = await getResidentialAutomationEnabled();
      if (!enabled) {
        return jsonResponse(
          {
            success: true,
            mode,
            message: "Residential automation is disabled",
            processed: 0,
          },
          200,
        );
      }
    } else if (mode !== "dry-run" && mode !== "manual") {
      throw new Error(`Unsupported mode: ${mode}`);
    }

    const leads = await fetchNewResidentialLeads();
    const result: ProcessResult = {
      blocked: 0,
      blockedLeads: [],
      errors: [],
      mode,
      processed: leads.length,
      sent: 0,
      skipped: 0,
    };

    for (const lead of leads) {
      const audit = auditResidentialLead(lead);
      if (audit.missingFields.length > 0) {
        result.blocked += 1;
        result.skipped += 1;
        result.blockedLeads.push(audit);
        continue;
      }

      if (mode === "dry-run") {
        continue;
      }

      try {
        const offerInput = normalizeResidentialLead(lead);
        const renderedOffer = await buildResidentialOfferWithQuotes(offerInput);

        await sendHtmlEmail({
          cc: ["info@evionor.hu"],
          from: `${offerInput.senderName} - EVIONOR <hello@notifications.evionor.hu>`,
          html: renderedOffer.html,
          subject: renderedOffer.subject,
          to: ["istvansandornagy@gmail.com", "misho.shubitidze@travlrd.com"],
        });

        await markLeadAsAutoContacted(lead.id);
        result.sent += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        result.errors.push(`Lead ${lead.id} (${lead.email}): ${message}`);
      }
    }

    return jsonResponse(
      {
        success: true,
        ...result,
      },
      200,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonResponse({ success: false, error: message }, 400);
  }
});
