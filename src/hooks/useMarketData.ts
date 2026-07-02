import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/* ── Domain → market code mapping ─────────────────────────── */
const DOMAIN_MARKET_MAP: Record<string, string> = {
  "evionor.hu": "HU",
  "evionor.ro": "RO",
  "evionor.de": "DE",
  "evionor.at": "AT",
  "evionor.ch": "CH",
  "evionor.fr": "FR",
  "evionor.nl": "NL",
  "evionor.cz": "CZ",
  "evionor.pl": "PL",
  "evionor.es": "ES",
  "evionor.hr": "HR",
  "evionor.sk": "SK",
};

/* ── Currency formatting config ───────────────────────────── */
const CURRENCY_CONFIG: Record<string, { locale: string; symbol: string; thousandSep: string }> = {
  HUF: { locale: "hu-HU", symbol: "Ft", thousandSep: "." },
  EUR: { locale: "de-DE", symbol: "€", thousandSep: "." },
  RON: { locale: "ro-RO", symbol: "Lei", thousandSep: "." },
  CHF: { locale: "de-CH", symbol: "CHF", thousandSep: "'" },
  CZK: { locale: "cs-CZ", symbol: "Kč", thousandSep: " " },
  PLN: { locale: "pl-PL", symbol: "zł", thousandSep: " " },
};

/* ── Detect current market from hostname ──────────────────── */
export function detectMarket(): string {
  try {
    const hostname = window.location.hostname;
    for (const [domain, code] of Object.entries(DOMAIN_MARKET_MAP)) {
      if (hostname === domain || hostname.endsWith("." + domain)) return code;
    }
  } catch {
    // SSR or test environment
  }
  return "HU"; // default fallback
}

/* ── Price/link types ─────────────────────────────────────── */
interface MarketPrice {
  product_handle: string;
  product_title: string;
  price: number;
  compare_at_price: number | null;
  currency: string;
  market_code: string;
}

interface MarketLink {
  market_code: string;
  link_type: string;
  url: string;
}

interface MarketConfig {
  market_code: string;
  currency: string;
  domain: string;
  default_locale: string;
  active: boolean;
  price_multiplier: number;
}

/* ── Main hook ────────────────────────────────────────────── */
export function useMarketData() {
  const market = detectMarket();

  const { data: config } = useQuery({
    queryKey: ["market_config", market],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("market_config")
        .select("*")
        .eq("market_code", market)
        .single();
      if (error) throw error;
      return data as MarketConfig;
    },
    staleTime: 1000 * 60 * 30, // 30 min cache
  });

  const { data: prices } = useQuery({
    queryKey: ["market_prices", market],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("market_prices")
        .select("*")
        .eq("market_code", market)
        .limit(500);
      if (error) throw error;
      return data as MarketPrice[];
    },
    staleTime: 1000 * 60 * 30,
  });

  const { data: links } = useQuery({
    queryKey: ["market_links", market],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("market_links")
        .select("*")
        .eq("market_code", market);
      if (error) throw error;
      return data as MarketLink[];
    },
    staleTime: 1000 * 60 * 30,
  });

  /* ── Derived helpers ──────────────────────────────── */
  const currency = config?.currency || "HUF";
  const cc = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.HUF;

  /** Build a price→handle lookup map for fast access */
  const priceMap = new Map<string, MarketPrice>();
  if (prices) {
    for (const p of prices) {
      priceMap.set(p.product_handle, p);
    }
  }

  /** Format a numeric amount in the market's currency */
  const formatPrice = (amount: number): string => {
    const formatted = new Intl.NumberFormat(cc.locale, {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
    return `${formatted} ${cc.symbol}`;
  };

  /** Get the current market price for a product handle */
  const getPrice = (handle: string): number | null => {
    return priceMap.get(handle)?.price ?? null;
  };

  /** Get compare-at price (original / list price) */
  const getCompareAtPrice = (handle: string): number | null => {
    return priceMap.get(handle)?.compare_at_price ?? null;
  };

  /** Get a full product URL for this market */
  const getProductUrl = (handle: string): string => {
    const tpl = links?.find((l) => l.link_type === "product_page");
    const base = tpl?.url || `https://evionor.hu/collections/all/products/{handle}`;
    return base.replace("{handle}", handle);
  };

  /** Get a market link by type (shop, installation, contact, etc.) */
  const getLink = (type: string): string => {
    const link = links?.find((l) => l.link_type === type);
    return link?.url || "#";
  };

  /** Get product title */
  const getProductTitle = (handle: string): string | null => {
    return priceMap.get(handle)?.product_title ?? null;
  };

  return {
    market,
    currency,
    currencySymbol: cc.symbol,
    config,
    prices: prices || [],
    links: links || [],
    priceMap,
    formatPrice,
    getPrice,
    getCompareAtPrice,
    getProductUrl,
    getLink,
    getProductTitle,
    loading: !prices || !links,
  };
}
