export interface EVModel {
  brand: string;
  model: string;
  consumption: number; // kWh/100km
  year?: string;
}

export const evDatabase: EVModel[] = [
  { brand: "Tesla", model: "Model 3 Standard Range", consumption: 13.6 },
  { brand: "Tesla", model: "Model 3 Long Range", consumption: 14.2 },
  { brand: "Tesla", model: "Model 3 Performance", consumption: 15.1 },
  { brand: "Tesla", model: "Model Y Standard Range", consumption: 15.0 },
  { brand: "Tesla", model: "Model Y Long Range", consumption: 15.7 },
  { brand: "Tesla", model: "Model Y Performance", consumption: 16.5 },
  { brand: "Tesla", model: "Model S Long Range", consumption: 18.5 },
  { brand: "Tesla", model: "Model S Plaid", consumption: 19.8 },
  { brand: "Tesla", model: "Model X Long Range", consumption: 20.8 },
  { brand: "Tesla", model: "Model X Plaid", consumption: 22.0 },
  { brand: "Volkswagen", model: "ID.3 Pro", consumption: 16.2 },
  { brand: "Volkswagen", model: "ID.3 Pro S", consumption: 16.8 },
  { brand: "Volkswagen", model: "ID.4 Pure", consumption: 17.5 },
  { brand: "Volkswagen", model: "ID.4 Pro", consumption: 18.0 },
  { brand: "Volkswagen", model: "ID.5 Pro", consumption: 17.3 },
  { brand: "Volkswagen", model: "ID.Buzz Pro", consumption: 21.5 },
  { brand: "BMW", model: "i3", consumption: 14.5 },
  { brand: "BMW", model: "i4 eDrive40", consumption: 16.8 },
  { brand: "BMW", model: "i4 M50", consumption: 19.5 },
  { brand: "BMW", model: "iX xDrive40", consumption: 20.0 },
  { brand: "BMW", model: "iX xDrive50", consumption: 21.5 },
  { brand: "BMW", model: "iX3", consumption: 18.9 },
  { brand: "BMW", model: "iX1 xDrive30", consumption: 17.3 },
  { brand: "Mercedes-Benz", model: "EQA 250", consumption: 17.5 },
  { brand: "Mercedes-Benz", model: "EQB 250+", consumption: 18.0 },
  { brand: "Mercedes-Benz", model: "EQC 400", consumption: 22.0 },
  { brand: "Mercedes-Benz", model: "EQE 350+", consumption: 17.5 },
  { brand: "Mercedes-Benz", model: "EQS 450+", consumption: 18.0 },
  { brand: "Mercedes-Benz", model: "EQS SUV 450+", consumption: 21.0 },
  { brand: "Audi", model: "e-tron 50", consumption: 22.0 },
  { brand: "Audi", model: "e-tron 55", consumption: 23.5 },
  { brand: "Audi", model: "e-tron GT", consumption: 20.0 },
  { brand: "Audi", model: "Q4 e-tron 40", consumption: 18.5 },
  { brand: "Audi", model: "Q8 e-tron 55", consumption: 23.0 },
  { brand: "Hyundai", model: "IONIQ 5 Standard Range", consumption: 17.0 },
  { brand: "Hyundai", model: "IONIQ 5 Long Range", consumption: 17.5 },
  { brand: "Hyundai", model: "IONIQ 6 Long Range", consumption: 14.3 },
  { brand: "Hyundai", model: "Kona Electric 39kWh", consumption: 14.7 },
  { brand: "Hyundai", model: "Kona Electric 65kWh", consumption: 15.2 },
  { brand: "Kia", model: "EV6 Standard Range", consumption: 17.0 },
  { brand: "Kia", model: "EV6 Long Range", consumption: 17.2 },
  { brand: "Kia", model: "EV9 Long Range", consumption: 22.5 },
  { brand: "Kia", model: "Niro EV", consumption: 16.2 },
  { brand: "Kia", model: "e-Soul 64kWh", consumption: 16.0 },
  { brand: "Nissan", model: "Leaf 40kWh", consumption: 17.0 },
  { brand: "Nissan", model: "Leaf e+ 62kWh", consumption: 18.5 },
  { brand: "Nissan", model: "Ariya 63kWh", consumption: 17.5 },
  { brand: "Nissan", model: "Ariya 87kWh", consumption: 19.0 },
  { brand: "Renault", model: "Zoe R135", consumption: 17.0 },
  { brand: "Renault", model: "Megane E-Tech EV60", consumption: 16.0 },
  { brand: "Renault", model: "Kangoo E-Tech", consumption: 20.0 },
  { brand: "Peugeot", model: "e-208", consumption: 16.0 },
  { brand: "Peugeot", model: "e-2008", consumption: 17.5 },
  { brand: "Peugeot", model: "e-Rifter", consumption: 20.5 },
  { brand: "Fiat", model: "500e", consumption: 14.0 },
  { brand: "BYD", model: "Atto 3", consumption: 17.0 },
  { brand: "BYD", model: "Han", consumption: 18.0 },
  { brand: "BYD", model: "Tang", consumption: 22.0 },
  { brand: "BYD", model: "Dolphin", consumption: 14.0 },
  { brand: "BYD", model: "Seal", consumption: 16.0 },
  { brand: "BYD", model: "Seal U", consumption: 18.5 },
  { brand: "Skoda", model: "Enyaq iV 60", consumption: 17.0 },
  { brand: "Skoda", model: "Enyaq iV 80", consumption: 17.5 },
  { brand: "Skoda", model: "Enyaq Coupe iV 80", consumption: 17.0 },
  { brand: "Volvo", model: "C40 Recharge", consumption: 18.5 },
  { brand: "Volvo", model: "XC40 Recharge", consumption: 19.0 },
  { brand: "Volvo", model: "EX30 Single Motor", consumption: 16.0 },
  { brand: "Volvo", model: "EX90 Twin Motor", consumption: 21.0 },
  { brand: "Ford", model: "Mustang Mach-E Standard Range", consumption: 18.5 },
  { brand: "Ford", model: "Mustang Mach-E Extended Range", consumption: 19.0 },
  { brand: "Ford", model: "E-Transit", consumption: 30.0 },
  { brand: "Opel", model: "Corsa-e", consumption: 16.5 },
  { brand: "Opel", model: "Mokka-e", consumption: 17.5 },
  { brand: "Opel", model: "Combo-e", consumption: 20.5 },
  { brand: "Citroën", model: "e-C4", consumption: 17.0 },
  { brand: "Citroën", model: "ë-Berlingo", consumption: 20.5 },
  { brand: "Mazda", model: "MX-30", consumption: 17.5 },
  { brand: "Porsche", model: "Taycan", consumption: 20.0 },
  { brand: "Porsche", model: "Taycan Cross Turismo", consumption: 21.5 },
  { brand: "Smart", model: "#1 Pro+", consumption: 16.5 },
  { brand: "Smart", model: "#3 Pro+", consumption: 16.0 },
  { brand: "MG", model: "4 Electric Standard", consumption: 16.0 },
  { brand: "MG", model: "4 Electric Long Range", consumption: 17.0 },
  { brand: "MG", model: "ZS EV", consumption: 17.5 },
  { brand: "MG", model: "Marvel R", consumption: 19.5 },
  { brand: "NIO", model: "ET5", consumption: 17.5 },
  { brand: "NIO", model: "ET7", consumption: 18.0 },
  { brand: "NIO", model: "EL6", consumption: 20.5 },
  { brand: "Polestar", model: "2 Standard Range", consumption: 16.5 },
  { brand: "Polestar", model: "2 Long Range", consumption: 17.0 },
  { brand: "XPeng", model: "P7", consumption: 15.5 },
  { brand: "XPeng", model: "G6", consumption: 17.0 },
];

const popularBrands = [
  "Tesla", "Volkswagen", "BMW", "Mercedes-Benz", "Audi",
  "Skoda", "Renault", "Peugeot", "Opel", "Hyundai", "Kia",
  "BYD", "MG"
];

export const getBrands = (): string[] => {
  const allBrands = [...new Set(evDatabase.map(ev => ev.brand))];
  const popular = popularBrands.filter(b => allBrands.includes(b));
  const rest = allBrands.filter(b => !popularBrands.includes(b)).sort();
  return [...popular, ...rest];
};

export const getModelsByBrandFallback = (brand: string): EVModel[] => {
  return evDatabase.filter(ev => ev.brand === brand);
};

export const getConsumptionFallback = (brand: string, model: string): number => {
  const ev = evDatabase.find(ev => ev.brand === brand && ev.model === model);
  return ev?.consumption || 17.0;
};
