import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Allowed tables whitelist
const ALLOWED_TABLES = new Set([
  "questionnaire_responses",
  "questionnaire_responses_ro",
  "b2b_questionnaire_responses",
  "b2b_questionnaire_responses_ro",
  "product_clicks",
  "roi_calculator_results",
  "saved_questionnaire_responses",
  "lead_manager_settings",
]);

async function verifyEvionorAuth(evionorUrl: string, evionorAnonKey: string, accessToken: string): Promise<{ userId: string } | null> {
  const authClient = createClient(evionorUrl, evionorAnonKey, {
    auth: { persistSession: false },
  });

  const { data: { user }, error } = await authClient.auth.getUser(accessToken);
  if (error || !user) {
    console.error("Auth verification failed:", error?.message);
    return null;
  }
  return { userId: user.id };
}

async function checkAdminRole(evionorUrl: string, evionorServiceKey: string, userId: string): Promise<boolean> {
  const client = createClient(evionorUrl, evionorServiceKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await client.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });

  if (error) {
    console.error("Admin role check failed:", error);
    return false;
  }

  return data === true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const evionorUrl = Deno.env.get("EVIONOR_SUPABASE_URL");
    const evionorAnonKey = Deno.env.get("EVIONOR_SUPABASE_ANON_KEY");
    const evionorServiceKey = Deno.env.get("EVIONOR_SUPABASE_SERVICE_KEY");

    if (!evionorUrl || !evionorAnonKey) {
      throw new Error("EVIONOR Supabase credentials not configured");
    }

    const body = await req.json();
    const { action, table, query, update, data: insertData, setting_key, setting_value, access_token } = body;

    // --- Authentication: require a valid EVIONOR access token ---
    if (!access_token || typeof access_token !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Authentication required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const authResult = await verifyEvionorAuth(evionorUrl, evionorAnonKey, access_token);
    if (!authResult) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid or expired token" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // --- Authorization: verify admin role ---
    if (!evionorServiceKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration error" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const isAdmin = await checkAdminRole(evionorUrl, evionorServiceKey, authResult.userId);
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: "Insufficient permissions" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // --- Table whitelist validation ---
    const targetTable = table || query?.table;
    if (targetTable && !ALLOWED_TABLES.has(targetTable)) {
      return new Response(
        JSON.stringify({ success: false, error: `Access to table '${targetTable}' is not allowed` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    console.log("Authenticated user:", authResult.userId, "Action:", action);

    // Create client for EVIONOR Supabase with service key
    const client = createClient(evionorUrl, evionorServiceKey, {
      auth: { persistSession: false },
    });

    let result;

    switch (action) {
      case "query_table": {
        if (!table) throw new Error("Table name is required");
        const { data, error } = await client.from(table).select("*").limit(100);
        if (error) throw error;
        result = { data, count: data?.length || 0 };
        break;
      }

      case "custom_query": {
        if (!query) throw new Error("Query parameters are required");
        const queryBuilder = client.from(query.table).select(query.select || "*", { count: "exact" });

        if (query.filters) {
          Object.entries(query.filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              queryBuilder.eq(key, value);
            }
          });
        }

        if (query.limit) queryBuilder.limit(query.limit);
        if (query.offset) queryBuilder.range(query.offset, query.offset + (query.limit || 100) - 1);

        if (query.order) {
          queryBuilder.order(query.order.column || "created_at", {
            ascending: query.order.ascending !== false,
          });
        } else {
          queryBuilder.order("created_at", { ascending: false });
        }

        const { data: customData, error: customError, count: totalCount } = await queryBuilder;
        if (customError) {
          const errorMsg = typeof customError.message === "string"
            ? customError.message
            : JSON.stringify(customError.message || customError);
          throw new Error(`Query failed: ${errorMsg}${customError.code ? ` (code: ${customError.code})` : ""}`);
        }
        result = { data: customData, count: totalCount || 0 };
        break;
      }

      case "update": {
        if (!update || !update.id || !table || !update.data) {
          throw new Error("Update action requires: table, update.id, and update.data");
        }
        const { data: updatedData, error: updateError } = await client
          .from(table)
          .update(update.data)
          .eq("id", update.id)
          .select()
          .single();
        if (updateError) throw updateError;
        result = { data: updatedData };
        break;
      }

      case "insert": {
        if (!table || !insertData) throw new Error("Insert action requires: table and data");
        const { data: insertedData, error: insertError } = await client
          .from(table)
          .insert(insertData)
          .select()
          .single();
        if (insertError) throw insertError;
        result = { data: insertedData };
        break;
      }

      case "get_setting": {
        if (!setting_key) throw new Error("Setting key is required");
        const { data: settingData, error: getSettingError } = await client
          .from("lead_manager_settings")
          .select("setting_value")
          .eq("setting_key", setting_key)
          .single();
        if (getSettingError) {
          result = { data: { enabled: false } };
        } else {
          result = { data: settingData?.setting_value || { enabled: false } };
        }
        break;
      }

      case "update_setting": {
        if (!setting_key || setting_value === undefined) {
          throw new Error("Setting key and value are required");
        }
        const { data: upsertedSetting, error: upsertError } = await client
          .from("lead_manager_settings")
          .upsert(
            {
              setting_key: setting_key,
              setting_value: setting_value,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "setting_key" },
          )
          .select()
          .single();
        if (upsertError) throw upsertError;
        result = { data: upsertedSetting };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in query-evionor function:", errorMessage);

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
