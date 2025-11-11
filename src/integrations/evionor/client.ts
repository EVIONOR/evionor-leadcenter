// EVIONOR Supabase Client
// This client connects to the EVIONOR Supabase project via edge functions
// Do not use this client directly in the frontend - always go through edge functions

import { supabase } from "@/integrations/supabase/client";
import type { ProductClick, QuestionnaireResponse, RoiCalculatorResult } from "./types";

/**
 * Query EVIONOR database tables through the edge function
 * @param table - Name of the table to query
 * @param options - Query options (limit, select, etc.)
 */
export async function queryEvionorTable<T>(
  table: "product_clicks" | "questionnaire_responses" | "roi_calculator_results",
  options?: {
    limit?: number;
    select?: string;
  },
) {
  const { data, error } = await supabase.functions.invoke<{ data: T[]; count: number }>("query-evionor", {
    body: {
      action: "custom_query",
      query: {
        table,
        select: options?.select || "*",
        limit: options?.limit || 100,
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
export async function getQuestionnaireResponses(limit = 100) {
  const result = queryEvionorTable<QuestionnaireResponse>("questionnaire_responses", { limit });
  console.log({ result });
  return result;
}

/**
 * Get all ROI calculator results
 */
export async function getRoiCalculatorResults(limit = 100) {
  return queryEvionorTable<RoiCalculatorResult>("roi_calculator_results", { limit });
}
