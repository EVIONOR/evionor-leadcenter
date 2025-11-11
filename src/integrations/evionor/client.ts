// EVIONOR Supabase Client
// This client connects to the EVIONOR Supabase project via edge functions
// Do not use this client directly in the frontend - always go through edge functions

import { supabase } from "@/integrations/supabase/client";
import type { ProductClick, QuestionnaireResponse, RoiCalculatorResult } from "./types";

/**
 * Query EVIONOR database tables through the edge function
 * @param table - Name of the table to query
 * @param options - Query options (limit, select, filters, pagination, etc.)
 */
export async function queryEvionorTable<T>(
  table: "product_clicks" | "questionnaire_responses" | "roi_calculator_results",
  options?: {
    limit?: number;
    offset?: number;
    select?: string;
    filters?: Record<string, any>;
    order?: { column: string; ascending?: boolean };
  },
) {
  const { data, error } = await supabase.functions.invoke<{ data: T[]; count: number }>("query-evionor", {
    body: {
      action: "custom_query",
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
}) {
  const filters: Record<string, any> = {};
  
  if (options?.status && options.status !== 'all') {
    filters.status = options.status;
  }

  const result = queryEvionorTable<QuestionnaireResponse>("questionnaire_responses", { 
    limit: options?.limit || 20,
    offset: options?.offset || 0,
    filters: Object.keys(filters).length > 0 ? filters : undefined,
    order: { column: 'created_at', ascending: false }
  });
  
  return result;
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
export async function updateQuestionnaireStatus(id: string, status: string) {
  const { data, error } = await supabase.functions.invoke<{ data: QuestionnaireResponse }>("query-evionor", {
    body: {
      action: "update",
      table: "questionnaire_responses",
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
