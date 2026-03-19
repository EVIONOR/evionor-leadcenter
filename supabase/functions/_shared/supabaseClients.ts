import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

export function createLocalServiceClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Local Supabase service credentials are not configured");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export function getLocalSupabaseUrl(): string {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");

  if (!supabaseUrl) {
    throw new Error("Local Supabase URL is not configured");
  }

  return supabaseUrl;
}

export function createEvionorServiceClient() {
  const evionorUrl = Deno.env.get("EVIONOR_SUPABASE_URL");
  const evionorServiceKey = Deno.env.get("EVIONOR_SUPABASE_SERVICE_KEY");

  if (!evionorUrl || !evionorServiceKey) {
    throw new Error("EVIONOR Supabase service credentials are not configured");
  }

  return createClient(evionorUrl, evionorServiceKey, {
    auth: { persistSession: false },
  });
}
