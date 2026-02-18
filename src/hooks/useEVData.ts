import { useQuery } from "@tanstack/react-query";
import { EVModel, evDatabase, getBrands, getModelsByBrandFallback, getConsumptionFallback } from "@/data/evDatabase";
import { OpenEVDataset, transformOpenEVData, getBrandsFromEV } from "@/data/openEvTransform";

export interface UseEVDataReturn {
  models: EVModel[];
  brands: string[];
  getModelsByBrand: (brand: string) => EVModel[];
  getConsumption: (brand: string, model: string) => number;
  getOnboardChargerKw: (brand: string, model: string) => number | undefined;
  isLoading: boolean;
  isUsingFallback: boolean;
}

export function useEVData(): UseEVDataReturn {
  const { data, isLoading, isError } = useQuery<OpenEVDataset>({
    queryKey: ["openev-data"],
    queryFn: async () => {
      const response = await fetch("/ev-data.json");
      if (!response.ok) throw new Error(`Failed: ${response.status}`);
      return response.json();
    },
    staleTime: 48 * 60 * 60 * 1000,
    gcTime: 72 * 60 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });

  const isUsingFallback = isLoading || isError || !data;

  const models = isUsingFallback ? evDatabase : transformOpenEVData(data!);
  const brands = isUsingFallback ? getBrands() : getBrandsFromEV(models);

  const getModelsByBrand = (brand: string): EVModel[] => {
    if (isUsingFallback) return getModelsByBrandFallback(brand);
    return models.filter(m => m.brand === brand);
  };

  const getConsumption = (brand: string, model: string): number => {
    if (isUsingFallback) return getConsumptionFallback(brand, model);
    const ev = models.find(m => m.brand === brand && m.model === model);
    return ev?.consumption || 17.0;
  };

  const getOnboardChargerKw = (brand: string, model: string): number | undefined => {
    const ev = models.find(m => m.brand === brand && m.model === model);
    return ev?.onboardChargerKw;
  };

  return {
    models,
    brands,
    getModelsByBrand,
    getConsumption,
    getOnboardChargerKw,
    isLoading,
    isUsingFallback,
  };
}
