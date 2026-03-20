import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";
import { corsHeaders } from "../_shared/cors.ts";
import { requireEvionorAdmin } from "../_shared/evionorAdmin.ts";
import { sendHtmlEmail } from "../_shared/sendMail.ts";
import { buildB2BAutoEmail } from "../_shared/b2bOffer.ts";

const B2B_AUTOMATION_KEY = "b2b_automation_enabled";
const B2B_AUTO_GROUP_KEY = "b2b_auto_group_enabled";

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

function createLocalClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
}

function createEvionorClient() {
  return createClient(
    Deno.env.get("EVIONOR_SUPABASE_URL") ?? "",
    Deno.env.get("EVIONOR_SUPABASE_SERVICE_KEY") ?? "",
    { auth: { persistSession: false } },
  );
}

async function getSetting(key: string): Promise<boolean> {
  const client = createLocalClient();
  const { data } = await client
    .from("settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (!data?.value || typeof data.value !== "object" || Array.isArray(data.value)) return false;
  return (data.value as Record<string, unknown>).enabled === true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const mode = typeof body.mode === "string" ? body.mode : "scheduled";

    if (mode === "manual" || mode === "dry-run") {
      await requireEvionorAdmin(body.access_token);
    }

    // Check if automation is enabled for scheduled runs
    if (mode === "scheduled") {
      const enabled = await getSetting(B2B_AUTOMATION_KEY);
      if (!enabled) {
        return jsonResponse({ success: true, mode, message: "B2B automation is disabled", processed: 0 }, 200);
      }
    }

    const localClient = createLocalClient();
    const evionorClient = createEvionorClient();

    // Step 1: Auto-group - if enabled, create qualification records for new B2B leads
    const autoGroupEnabled = await getSetting(B2B_AUTO_GROUP_KEY);
    let autoGrouped = 0;

    if (autoGroupEnabled) {
      // Get all B2B leads from EVIONOR
      const { data: b2bLeads } = await evionorClient
        .from("b2b_questionnaire_responses")
        .select("id, company_name, name, email, phone")
        .order("created_at", { ascending: true });

      // Get all existing qualifications
      const { data: existingQuals } = await localClient
        .from("b2b_qualifications")
        .select("source_b2b_id");

      const existingIds = new Set((existingQuals || []).map((q: { source_b2b_id: string | null }) => q.source_b2b_id));

      // Create qualification records for new leads that don't have one
      const newLeads = (b2bLeads || []).filter((l: { id: string }) => !existingIds.has(l.id));

      for (const lead of newLeads) {
        const { error } = await localClient.from("b2b_qualifications").insert({
          source_b2b_id: lead.id,
          company_name: lead.company_name,
          contact_name: lead.name,
          email: lead.email,
          phone: lead.phone,
          status: "auto_email",
        });
        if (!error) autoGrouped++;
      }
    }

    // Step 2: Fetch leads with status "auto_email"
    const { data: autoEmailLeads, error: fetchError } = await localClient
      .from("b2b_qualifications")
      .select("id, source_b2b_id, company_name, contact_name, email, phone, status")
      .eq("status", "auto_email");

    if (fetchError) throw fetchError;

    const leads = autoEmailLeads || [];
    const result = {
      mode,
      autoGrouped,
      processed: leads.length,
      sent: 0,
      errors: [] as string[],
    };

    if (mode === "dry-run") {
      return jsonResponse({ success: true, ...result }, 200);
    }

    // Step 3: Send emails and update status
    for (const lead of leads) {
      if (!lead.email) {
        result.errors.push(`Lead ${lead.id}: no email`);
        continue;
      }

      try {
        const offer = buildB2BAutoEmail({
          companyName: lead.company_name || "",
          contactName: lead.contact_name || lead.email,
          email: lead.email,
          phone: lead.phone || "",
        });

        await sendHtmlEmail({
          cc: ["info@evionor.hu"],
          from: "Horváth Gáspár - EVIONOR <hello@notifications.evionor.hu>",
          html: offer.html,
          subject: offer.subject,
          to: lead.email,
        });

        // Update status to auto_contacted
        await localClient
          .from("b2b_qualifications")
          .update({ status: "auto_contacted" })
          .eq("id", lead.id);

        result.sent++;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        result.errors.push(`Lead ${lead.id} (${lead.email}): ${msg}`);
      }
    }

    return jsonResponse({ success: true, ...result }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonResponse({ success: false, error: message }, 400);
  }
});
