import type { EvionorQuestionnaireLead } from "./evionorAdmin.ts";
import { createEvionorServiceClient } from "./supabaseClients.ts";

export async function fetchNewResidentialLeads(): Promise<EvionorQuestionnaireLead[]> {
  const client = createEvionorServiceClient();
  const { data, error } = await client
    .from("questionnaire_responses")
    .select("id, name, email, phone, car_brand, car_model, km_per_year, phases, location, timeline, status, created_at")
    .eq("status", "new")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch EVIONOR leads: ${error.message}`);
  }

  return (data || []) as EvionorQuestionnaireLead[];
}

export async function markLeadAsAutoContacted(leadId: string) {
  const client = createEvionorServiceClient();
  const { error } = await client
    .from("questionnaire_responses")
    .update({ status: "auto contacted" })
    .eq("id", leadId);

  if (error) {
    throw new Error(`Failed to update lead ${leadId}: ${error.message}`);
  }
}
