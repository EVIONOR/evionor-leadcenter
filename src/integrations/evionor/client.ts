// EVIONOR Supabase Client
// This client connects to the EVIONOR Supabase project via edge functions
// Do not use this client directly in the frontend - always go through edge functions

import { supabase } from "@/integrations/supabase/client";
import { evionorAuth } from "@/integrations/evionor/auth-client";
import type {
  B2BQuestionnaireResponse,
  ProductClick,
  QuestionnaireResponse,
  RoiCalculatorResult,
  SavedQuestionnaireResponse,
  SavedQuestionnaireResponseInsert,
} from "./types";

type EvionorFilterValue = boolean | number | string | null;

interface ResidentialAutomationSettingResponse {
  blocked?: number;
  blockedLeads?: Array<{
    email: string;
    leadId: string;
    missingFields: string[];
  }>;
  enabled?: boolean;
  error?: string;
  processed?: number;
  success: boolean;
}

/**
 * Get the current EVIONOR access token for authenticated requests
 */
async function getAccessToken(): Promise<string> {
  const { data: { session } } = await evionorAuth.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Not authenticated");
  }
  return session.access_token;
}

/**
 * Query EVIONOR database tables through the edge function
 */
export async function queryEvionorTable<T>(
  table:
    | "product_clicks"
    | "questionnaire_responses"
    | "questionnaire_responses_ro"
    | "roi_calculator_results"
    | "b2b_questionnaire_responses"
    | "b2b_questionnaire_responses_ro",
  options?: {
    limit?: number;
    offset?: number;
    select?: string;
    filters?: Record<string, EvionorFilterValue>;
    order?: { column: string; ascending?: boolean };
  },
) {
  const access_token = await getAccessToken();

  const { data, error } = await supabase.functions.invoke<{ data: T[]; count: number }>("query-evionor", {
    body: {
      action: "custom_query",
      access_token,
      query: {
        table,
        select: options?.select || "*",
        limit: options?.limit || 20,
        offset: options?.offset || 0,
        filters: options?.filters,
        order: options?.order,
      },
    },
  });

  if (error) {
    console.error("Error querying EVIONOR table:", error);
    throw error;
  }

  return data;
}

/**
 * Get all product clicks
 */
export async function getProductClicks(limit = 100) {
  return queryEvionorTable<ProductClick>("product_clicks", { limit });
}

/**
 * Get all questionnaire responses
 */
export async function getQuestionnaireResponses(options?: {
  limit?: number;
  offset?: number;
  status?: string;
  language?: "hu" | "ro";
}) {
  const filters: Record<string, EvionorFilterValue> = {};

  if (options?.status && options.status !== 'all') {
    filters.status = options.status;
  }

  const table = options?.language === "ro" ? "questionnaire_responses_ro" : "questionnaire_responses";

  return queryEvionorTable<QuestionnaireResponse>(table, {
    limit: options?.limit || 20,
    offset: options?.offset || 0,
    filters: Object.keys(filters).length > 0 ? filters : undefined,
    order: { column: 'created_at', ascending: false }
  });
}

/**
 * Get all ROI calculator results
 */
export async function getRoiCalculatorResults(limit = 100) {
  return queryEvionorTable<RoiCalculatorResult>("roi_calculator_results", { limit });
}

/**
 * Update questionnaire response status
 */
export async function updateQuestionnaireStatus(id: string, status: string, language: "hu" | "ro" = "hu") {
  const access_token = await getAccessToken();

  const table = language === "ro" ? "questionnaire_responses_ro" : "questionnaire_responses";

  const { data, error } = await supabase.functions.invoke<{ data: QuestionnaireResponse }>("query-evionor", {
    body: {
      action: "update",
      table,
      access_token,
      update: {
        id,
        data: { status }
      }
    },
  });

  if (error) {
    console.error("Error updating questionnaire status:", error);
    throw error;
  }

  return data;
}

/**
 * Save a saved questionnaire response
 */
export async function saveSavedQuestionnaireResponse(
  responseData: SavedQuestionnaireResponseInsert
) {
  const access_token = await getAccessToken();

  const { data, error } = await supabase.functions.invoke<{ data: SavedQuestionnaireResponse }>("query-evionor", {
    body: {
      action: "insert",
      table: "saved_questionnaire_responses",
      access_token,
      data: responseData,
    },
  });

  if (error) {
    console.error("Error saving questionnaire response:", error);
    throw error;
  }

  return data;
}

/**
 * Get automatic processing setting
 */
export async function getAutomaticProcessingSetting(): Promise<boolean> {
  const access_token = await getAccessToken();

  const { data, error } = await supabase.functions.invoke<ResidentialAutomationSettingResponse>("manage-residential-automation", {
    body: {
      access_token,
      action: "get",
    },
  });

  if (error) {
    console.error("Error getting automatic processing setting:", error);
    return false;
  }

  return data?.success ? (data.enabled ?? false) : false;
}

/**
 * Set automatic processing setting
 */
export async function setAutomaticProcessingSetting(enabled: boolean): Promise<void> {
  const access_token = await getAccessToken();

  const { data, error } = await supabase.functions.invoke<ResidentialAutomationSettingResponse>("manage-residential-automation", {
    body: {
      access_token,
      action: "set",
      enabled,
    },
  });

  if (error) {
    console.error("Error setting automatic processing setting:", error);
    throw error;
  }

  if (!data?.success) {
    throw new Error(data?.error || "Failed to update automatic processing setting");
  }
}

/**
 * Manually trigger lead processing
 */
export async function triggerLeadProcessing(): Promise<void> {
  const access_token = await getAccessToken();

  const { error } = await supabase.functions.invoke("process-residential-offers", {
    body: {
      access_token,
      mode: "manual",
    },
  });

  if (error) {
    console.error("Error triggering lead processing:", error);
    throw error;
  }
}

export interface ResidentialAutomationDryRunResult {
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
  success: boolean;
}

export async function runResidentialAutomationDryRun(): Promise<ResidentialAutomationDryRunResult> {
  const access_token = await getAccessToken();

  const { data, error } = await supabase.functions.invoke<ResidentialAutomationDryRunResult>(
    "process-residential-offers",
    {
      body: {
        access_token,
        mode: "dry-run",
      },
    },
  );

  if (error || !data) {
    console.error("Error running residential automation dry run:", error);
    throw error || new Error("No dry run data returned");
  }

  return data;
}

export async function runResidentialAutomationTestSend(): Promise<ResidentialAutomationDryRunResult> {
  const access_token = await getAccessToken();

  const { data, error } = await supabase.functions.invoke<ResidentialAutomationDryRunResult>(
    "process-residential-offers",
    {
      body: {
        access_token,
        mode: "test-send",
      },
    },
  );

  if (error || !data) {
    console.error("Error running residential automation test send:", error);
    throw error || new Error("No test send data returned");
  }

  return data;
}

/**
 * Get B2B questionnaire responses from EVIONOR
 */
export async function getB2BQuestionnaireResponses(options?: {
  limit?: number;
  offset?: number;
  language?: "hu" | "ro";
}) {
  const table = options?.language === "ro" ? "b2b_questionnaire_responses_ro" : "b2b_questionnaire_responses";
  return queryEvionorTable<B2BQuestionnaireResponse>(table, {
    limit: options?.limit || 20,
    offset: options?.offset || 0,
    order: { column: 'created_at', ascending: false }
  });
}

/**
 * B2B Automation settings
 */
interface B2BAutomationSettings {
  automationEnabled: boolean;
  autoGroupEnabled: boolean;
  success: boolean;
  error?: string;
}

export async function getB2BAutomationSettings(): Promise<{ automationEnabled: boolean; autoGroupEnabled: boolean }> {
  const access_token = await getAccessToken();

  const { data, error } = await supabase.functions.invoke<B2BAutomationSettings>("manage-b2b-automation", {
    body: { access_token, action: "get" },
  });

  if (error) {
    console.error("Error getting B2B automation settings:", error);
    return { automationEnabled: false, autoGroupEnabled: false };
  }

  return {
    automationEnabled: data?.automationEnabled ?? false,
    autoGroupEnabled: data?.autoGroupEnabled ?? false,
  };
}

export async function setB2BAutomationEnabled(enabled: boolean): Promise<void> {
  const access_token = await getAccessToken();

  const { data, error } = await supabase.functions.invoke<B2BAutomationSettings>("manage-b2b-automation", {
    body: { access_token, action: "set_automation", enabled },
  });

  if (error || !data?.success) {
    throw new Error(data?.error || "Failed to update B2B automation setting");
  }
}

export async function setB2BAutoGroupEnabled(enabled: boolean): Promise<void> {
  const access_token = await getAccessToken();

  const { data, error } = await supabase.functions.invoke<B2BAutomationSettings>("manage-b2b-automation", {
    body: { access_token, action: "set_auto_group", enabled },
  });

  if (error || !data?.success) {
    throw new Error(data?.error || "Failed to update B2B auto group setting");
  }
}
