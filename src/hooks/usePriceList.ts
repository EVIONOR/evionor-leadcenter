import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMarketData } from "@/hooks/useMarketData";

export interface ProductPrice {
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  handle?: string;
}

/**
 * Hook that fetches the price list dynamically from Supabase market_prices.
 * Returns the same shape as the old static priceList export for backward compatibility.
 */
export function usePriceList() {
  const { market, currency, formatPrice, loading: marketLoading } = useMarketData();

  const { data: priceList, isLoading } = useQuery({
    queryKey: ["priceList", market],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("market_prices")
        .select("product_handle, product_title, price, compare_at_price, currency")
        .eq("market_code", market)
        .order("product_title")
        .limit(500);
      if (error) throw error;
      return (data || []).map((row) => ({
        name: row.product_title,
        price: row.price,
        originalPrice: row.compare_at_price ?? undefined,
        category: categorizeProduct(row.product_handle),
        handle: row.product_handle,
      })) as ProductPrice[];
    },
    staleTime: 1000 * 60 * 30,
  });

  return {
    priceList: priceList || [],
    formatPrice,
    currency,
    market,
    loading: isLoading || marketLoading,
  };
}

/** Categorize a product by its handle — matches the old priceList category field */
function categorizeProduct(handle: string): string {
  if (
    handle.includes("ev-charger") ||
    handle.includes("charger-22kw") ||
    handle.includes("charger-7") ||
    handle.includes("charger-11kw") ||
    handle.includes("charge-up") ||
    handle.includes("charge-max") ||
    handle.includes("charge-core") ||
    handle.includes("charge-pro") ||
    handle.includes("halo") ||
    handle.includes("luna") ||
    handle.includes("dawn") ||
    handle.includes("aura") ||
    handle.includes("nexblue")
  ) {
    // Exclude bundles and installations
    if (handle.includes("bundle") || handle.includes("installation") || handle.includes("survey")) {
      return "csomag";
    }
    return "töltő";
  }
  if (handle.includes("cable") || handle.includes("econnect") || handle.includes("type2-type1") || handle.includes("e-move")) {
    return "kábel";
  }
  if (handle.includes("meter") || handle.includes("equalizer") || handle.includes("sense") || handle.includes("enegic") || handle.includes("perific") || handle.includes("amp-guard") || handle.includes("ct-clamp")) {
    return "mérő";
  }
  if (handle.includes("installation") || handle.includes("survey")) {
    return "szolgáltatás";
  }
  return "kiegészítő";
}
