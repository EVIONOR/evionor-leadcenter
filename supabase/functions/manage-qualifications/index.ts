import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function verifyEvionorAuth(accessToken: string): Promise<{ userId: string } | null> {
  const evionorUrl = Deno.env.get("EVIONOR_SUPABASE_URL");
  const evionorAnonKey = Deno.env.get("EVIONOR_SUPABASE_ANON_KEY");
  if (!evionorUrl || !evionorAnonKey) return null;

  const authClient = createClient(evionorUrl, evionorAnonKey, {
    auth: { persistSession: false },
  });

  const { data: { user }, error } = await authClient.auth.getUser(accessToken);
  if (error || !user) return null;
  return { userId: user.id };
}

async function checkAdminRole(userId: string): Promise<boolean> {
  const evionorUrl = Deno.env.get("EVIONOR_SUPABASE_URL");
  const evionorServiceKey = Deno.env.get("EVIONOR_SUPABASE_SERVICE_KEY");
  if (!evionorUrl || !evionorServiceKey) return false;

  const client = createClient(evionorUrl, evionorServiceKey, {
    auth: { persistSession: false },
  });

  const { data } = await client.rpc("has_role", { _user_id: userId, _role: "admin" });
  return data === true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, access_token, ...params } = await req.json();

    // Authenticate
    if (!access_token) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const auth = await verifyEvionorAuth(access_token);
    if (!auth) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const isAdmin = await checkAdminRole(auth.userId);
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // Use service role to bypass RLS
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let result;

    switch (action) {
      case "list": {
        const { data, error } = await supabase
          .from("b2b_qualifications")
          .select("source_b2b_id, status, id");
        if (error) throw error;
        result = { data };
        break;
      }

      case "update_status": {
        const { id, status } = params;
        if (!id || !status) throw new Error("id and status required");
        const { error } = await supabase
          .from("b2b_qualifications")
          .update({ status })
          .eq("id", id);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "insert": {
        const { data: insertData } = params;
        if (!insertData) throw new Error("data required");
        const { data, error } = await supabase
          .from("b2b_qualifications")
          .insert(insertData)
          .select()
          .single();
        if (error) throw error;
        result = { data };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Error in manage-qualifications:", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
