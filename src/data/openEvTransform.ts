import { EVModel } from "./evDatabase";
import { getAdjustmentFactor } from "./realWorldAdjustment";

export interface OpenEVVehicle {
  make: { slug: string; name: string };
  model: { slug: string; name: string };
  year: number;
  trim?: { slug: string; name: string };
  variant?: { slug: string; name: string; kind?: string };
  battery: {
    pack_capacity_kwh_net?: number;
    pack_capacity_kwh_gross?: number;
  };
  range: {
    rated: Array<{ cycle: string; range_km: number }>;
  };
  unique_code: string;
}

export interface OpenEVDataset {
  schema_version: string;
  generated_at: string;
  vehicle_count: number;
  vehicles: OpenEVVehicle[];
}

const cyclePriority = ["wltp", "epa", "nedc", "cltc", "jc08"];

function getBestRange(rated: Array<{ cycle: string; range_km: number }>): { cycle: string; range_km: number } | null {
  for (const cycle of cyclePriority) {
    const found = rated.find(r => r.cycle.toLowerCase() === cycle);
    if (found) return found;
  }
  return rated[0] || null;
}

function convertToWLTPEquivalent(cycle: string, range_km: number): number {
  switch (cycle.toLowerCase()) {
    case "wltp": return range_km;
    case "epa": return range_km * 1.15;
    case "nedc": return range_km * 0.85;
    case "cltc": return range_km * 0.90;
    case "jc08": return range_km * 0.90;
    default: return range_km * 0.90;
  }
}

function buildDisplayModel(v: OpenEVVehicle): string {
  const parts = [v.model.name];
  if (v.trim?.name && v.trim.name !== "Base") parts.push(v.trim.name);
  if (v.variant?.name) parts.push(v.variant.name);
  parts.push(`(${v.year})`);
  return parts.join(" ");
}

export function transformOpenEVData(dataset: OpenEVDataset): EVModel[] {
  const results: EVModel[] = [];

  for (const v of dataset.vehicles) {
    const batteryKwh = v.battery.pack_capacity_kwh_net || v.battery.pack_capacity_kwh_gross;
    if (!batteryKwh) continue;

    const bestRange = getBestRange(v.range.rated);
    if (!bestRange || bestRange.range_km <= 0) continue;

    const wltpEquivalent = convertToWLTPEquivalent(bestRange.cycle, bestRange.range_km);
    const factor = getAdjustmentFactor(v.make.name);
    const adjustedRange = wltpEquivalent * factor;
    const consumption = Math.round((batteryKwh / (adjustedRange / 100)) * 10) / 10;

    results.push({
      brand: v.make.name,
      model: buildDisplayModel(v),
      consumption,
      year: String(v.year),
    });
  }

  return results;
}

const popularBrands = [
  "Tesla", "Volkswagen", "BMW", "Mercedes-Benz", "Audi",
  "Skoda", "Renault", "Peugeot", "Opel", "Hyundai", "Kia",
  "BYD", "MG"
];

export function getBrandsFromEV(models: EVModel[]): string[] {
  const allBrands = [...new Set(models.map(m => m.brand))];
  const popular = popularBrands.filter(b => allBrands.includes(b));
  const rest = allBrands.filter(b => !popularBrands.includes(b)).sort();
  return [...popular, ...rest];
}
