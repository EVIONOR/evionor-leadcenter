import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";
import { corsHeaders } from "../_shared/cors.ts";
import { requireEvionorAdmin } from "../_shared/evionorAdmin.ts";

const B2B_AUTOMATION_KEY = "b2b_automation_enabled";
const B2B_AUTO_GROUP_KEY = "b2b_auto_group_enabled";

function createLocalClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
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

async function setSetting(key: string, enabled: boolean): Promise<void> {
  const client = createLocalClient();
  const { error } = await client.from("settings").upsert(
    { key, value: { enabled } },
    { onConflict: "key" },
  );
  if (error) throw error;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    await requireEvionorAdmin(body.access_token);

    const action = body.action;

    if (action === "get") {
      const automationEnabled = await getSetting(B2B_AUTOMATION_KEY);
      const autoGroupEnabled = await getSetting(B2B_AUTO_GROUP_KEY);
      return new Response(
        JSON.stringify({ success: true, automationEnabled, autoGroupEnabled }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    if (action === "set_automation") {
      if (typeof body.enabled !== "boolean") throw new Error("enabled must be a boolean");
      await setSetting(B2B_AUTOMATION_KEY, body.enabled);
      return new Response(
        JSON.stringify({ success: true, automationEnabled: body.enabled }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    if (action === "set_auto_group") {
      if (typeof body.enabled !== "boolean") throw new Error("enabled must be a boolean");
      await setSetting(B2B_AUTO_GROUP_KEY, body.enabled);
      return new Response(
        JSON.stringify({ success: true, autoGroupEnabled: body.enabled }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    throw new Error(`Unsupported action: ${String(action)}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    );
  }
});
