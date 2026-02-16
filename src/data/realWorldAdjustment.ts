const realWorldAdjustmentFactors: Record<string, number> = {
  // Efficient
  "Tesla": 0.85,
  "Lucid": 0.85,
  "Rimac": 0.85,
  // Good
  "Hyundai": 0.83,
  "Kia": 0.83,
  "Genesis": 0.83,
  "Polestar": 0.82,
  "Volvo": 0.82,
  // Average
  "Volkswagen": 0.81,
  "Skoda": 0.81,
  "Toyota": 0.81,
  "Nissan": 0.81,
  "Honda": 0.80,
  "Renault": 0.80,
  "Peugeot": 0.80,
  "Opel": 0.80,
  "Citroën": 0.80,
  "Fiat": 0.80,
  "Ford": 0.80,
  "Mazda": 0.80,
  "Smart": 0.80,
  "MG": 0.80,
  // Below average
  "BMW": 0.78,
  "Mercedes-Benz": 0.78,
  "Audi": 0.78,
  "Porsche": 0.78,
  "Maserati": 0.78,
  "Rolls-Royce": 0.78,
  // Heavy
  "Land Rover": 0.76,
  // Chinese brands
  "BYD": 0.80,
  "NIO": 0.80,
  "XPeng": 0.80,
  "Zeekr": 0.80,
  "Hongqi": 0.80,
  "Aiways": 0.80,
  "Seres": 0.80,
  "Maxus": 0.80,
  "Skywell": 0.80,
  "Voyah": 0.80,
  "Ora": 0.80,
  "Lynk & Co": 0.80,
};

export function getAdjustmentFactor(brand: string): number {
  return realWorldAdjustmentFactors[brand] ?? 0.80;
}
