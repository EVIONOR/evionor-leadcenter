import type { Json } from "../../../src/integrations/supabase/types.ts";
import { createLocalServiceClient } from "./supabaseClients.ts";

export const RESIDENTIAL_AUTOMATION_ENABLED_KEY = "residential_automation_enabled";

interface AutomationSetting {
  enabled: boolean;
}

function isAutomationSetting(value: Json): value is AutomationSetting {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return "enabled" in value && typeof value.enabled === "boolean";
}

export async function getResidentialAutomationEnabled(): Promise<boolean> {
  const client = createLocalServiceClient();
  const { data, error } = await client
    .from("settings")
    .select("value")
    .eq("key", RESIDENTIAL_AUTOMATION_ENABLED_KEY)
    .maybeSingle();

  if (error || !data || !isAutomationSetting(data.value)) {
    return false;
  }

  return data.value.enabled;
}

export async function setResidentialAutomationEnabled(enabled: boolean): Promise<boolean> {
  const client = createLocalServiceClient();
  const { error } = await client.from("settings").upsert(
    {
      key: RESIDENTIAL_AUTOMATION_ENABLED_KEY,
      value: { enabled },
    },
    { onConflict: "key" },
  );

  if (error) {
    throw new Error(`Failed to update automation setting: ${error.message}`);
  }

  return enabled;
}
