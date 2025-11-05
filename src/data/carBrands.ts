export interface CarBrand {
  brand: string;
  models: string[];
}

export const carBrands: CarBrand[] = [
  {
    brand: "Tesla",
    models: ["Model 3", "Model Y", "Model S", "Model X"]
  },
  {
    brand: "Volkswagen",
    models: ["ID.3", "ID.4", "ID.5", "ID.Buzz"]
  },
  {
    brand: "BMW",
    models: ["i3", "i4", "iX", "iX3", "iX1"]
  },
  {
    brand: "Mercedes",
    models: ["EQA", "EQB", "EQC", "EQE", "EQS", "EQS SUV"]
  },
  {
    brand: "Audi",
    models: ["e-tron", "e-tron GT", "Q4 e-tron", "Q8 e-tron"]
  },
  {
    brand: "Hyundai",
    models: ["IONIQ 5", "IONIQ 6", "Kona Electric"]
  },
  {
    brand: "Kia",
    models: ["EV6", "EV9", "Niro EV", "e-Soul"]
  },
  {
    brand: "Nissan",
    models: ["Leaf", "Ariya"]
  },
  {
    brand: "Renault",
    models: ["Zoe", "Megane E-Tech", "Kangoo E-Tech"]
  },
  {
    brand: "Peugeot",
    models: ["e-208", "e-2008", "e-Rifter"]
  },
  {
    brand: "Fiat",
    models: ["500e"]
  },
  {
    brand: "BYD",
    models: ["Atto 3", "Han", "Tang", "Dolphin", "Seal", "Seal U"]
  },
  {
    brand: "NIO",
    models: ["ET5", "ET7", "ES6", "ES7", "ES8", "EL6", "EL7"]
  },
  {
    brand: "XPeng",
    models: ["P5", "P7", "G6", "G9"]
  },
  {
    brand: "MG",
    models: ["4 Electric", "5 Electric", "ZS EV", "Marvel R"]
  },
  {
    brand: "Ora",
    models: ["Funky Cat", "Good Cat"]
  },
  {
    brand: "Hongqi",
    models: ["E-HS9", "E-QM5"]
  },
  {
    brand: "Aiways",
    models: ["U5", "U6"]
  },
  {
    brand: "Lynk & Co",
    models: ["01"]
  },
  {
    brand: "Polestar",
    models: ["2", "3", "4"]
  },
  {
    brand: "Zeekr",
    models: ["001", "X"]
  },
  {
    brand: "Seres",
    models: ["3"]
  },
  {
    brand: "Maxus",
    models: ["Euniq 6"]
  },
  {
    brand: "Skywell",
    models: ["ET5"]
  },
  {
    brand: "Voyah",
    models: ["Free"]
  },
  {
    brand: "Skoda",
    models: ["Enyaq", "Enyaq Coupe"]
  },
  {
    brand: "Volvo",
    models: ["C40", "XC40 Recharge", "EX30", "EX90"]
  },
  {
    brand: "Ford",
    models: ["Mustang Mach-E", "E-Transit"]
  },
  {
    brand: "Opel",
    models: ["Corsa-e", "Mokka-e", "Combo-e"]
  },
  {
    brand: "Citroën",
    models: ["e-C4", "ë-Berlingo"]
  },
  {
    brand: "Mazda",
    models: ["MX-30"]
  },
  {
    brand: "Porsche",
    models: ["Taycan", "Taycan Cross Turismo"]
  },
  {
    brand: "Smart",
    models: ["#1", "#3"]
  },
  {
    brand: "Egyéb",
    models: ["Egyéb modell"]
  }
];

export const getModelsByBrand = (brand: string): string[] => {
  const carBrand = carBrands.find(cb => cb.brand === brand);
  return carBrand ? carBrand.models : [];
};
