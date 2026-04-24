import type { EvionorLanguage, EvionorQuestionnaireLead } from "./evionorAdmin.ts";
import { createEvionorServiceClient } from "./supabaseClients.ts";

const SELECT_FIELDS =
  "id, name, email, phone, car_brand, car_model, km_per_year, phases, location, timeline, status, created_at";

async function fetchFromTable(
  table: string,
  language: EvionorLanguage,
): Promise<EvionorQuestionnaireLead[]> {
  const client = createEvionorServiceClient();
  const { data, error } = await client
    .from(table)
    .select(SELECT_FIELDS)
    .eq("status", "new")
    .order("created_at", { ascending: true });

  if (error) {
    // Gracefully skip if RO table does not exist yet.
    if (language === "ro") {
      console.warn(`RO residential table not available: ${error.message}`);
      return [];
    }
    throw new Error(`Failed to fetch EVIONOR leads (${table}): ${error.message}`);
  }

  return ((data || []) as EvionorQuestionnaireLead[]).map((lead) => ({
    ...lead,
    language,
  }));
}

export async function fetchNewResidentialLeads(): Promise<EvionorQuestionnaireLead[]> {
  const [huLeads, roLeads] = await Promise.all([
    fetchFromTable("questionnaire_responses", "hu"),
    fetchFromTable("questionnaire_responses_ro", "ro"),
  ]);

  return [...huLeads, ...roLeads].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return aTime - bTime;
  });
}

export async function markLeadAsAutoContacted(leadId: string, language: EvionorLanguage = "hu") {
  const client = createEvionorServiceClient();
  const table = language === "ro" ? "questionnaire_responses_ro" : "questionnaire_responses";
  const { error } = await client
    .from(table)
    .update({ status: "auto contacted" })
    .eq("id", leadId);

  if (error) {
    throw new Error(`Failed to update lead ${leadId} in ${table}: ${error.message}`);
  }
}
