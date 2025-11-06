export interface QuestionnaireData {
  // Alapadatok
  contactName: string;
  email: string;
  phoneNumber: string;
  carBrand: string;
  carModel: string;
  customCar: string;
  zipCode: string;
  city: string;
  phases: "1" | "3";
  amperage: string;
  installLocation: string;
  buildingType: "családi_ház" | "társas_ház" | "sorház" | "";
  needsInstallation: boolean;
  needsElectricalPlanning: boolean;
  indoorOutdoor: "kültér" | "beltér";
  mountingSurface: "beton" | "fa" | "tégla" | "";
  needsBackplate: boolean;
  needsPole: boolean;
  distanceFromBox: string;
  spaceInBox: "igen" | "nem" | "nemtudom";
  groundworkWallPenetration: string;
  otherComments: string;

  // Töltő specifikációk
  solarIntegration: "nem" | "1fázis" | "3fázis";
  loadManagement: boolean;
  builtInCable: boolean;
  needsApp: boolean;
  infrastructureDevelopment: boolean;
  infrastructureDetails: string;
  overvoltageProtection: boolean;
  networkExpansion: boolean;
  expansionPhase: string;
  expansionAmperage: string;
}

export interface ChargerTemplate {
  id: string;
  name: string;
  phase: "1" | "3";
  hasApp: boolean;
  location: string;
  hasSolar: boolean;
  products: string[];
  basePrice?: number;
}

export const chargerTemplates: ChargerTemplate[] = [
  {
    id: "template1",
    name: "1 fázis - App kontroll - Kertbe/Belülre",
    phase: "1",
    hasApp: true,
    location: "indoor",
    hasSolar: false,
    products: ["Charge Amps Halo"],
    basePrice: 299000
  },
  {
    id: "template2",
    name: "1 fázis - Kültérre - RFID",
    phase: "1",
    hasApp: false,
    location: "outdoor",
    hasSolar: false,
    products: ["Amina 1 (nincs kilógó kábel)"],
    basePrice: 195000
  },
  {
    id: "template3a",
    name: "3 fázis - Standard - Easee Charge Up",
    phase: "3",
    hasApp: true,
    location: "any",
    hasSolar: false,
    products: ["Easee Charge Up"],
    basePrice: 359000
  },
  {
    id: "template3b",
    name: "3 fázis - Standard - Zaptec Go",
    phase: "3",
    hasApp: true,
    location: "any",
    hasSolar: false,
    products: ["Zaptec Go"],
    basePrice: 359000
  },
  {
    id: "template3c",
    name: "3 fázis - Standard - Charge Amps Luna 22kW",
    phase: "3",
    hasApp: true,
    location: "any",
    hasSolar: false,
    products: ["Charge Amps Luna 22kW"],
    basePrice: 365000
  },
  {
    id: "template4",
    name: "3 fázis - Napelemes",
    phase: "3",
    hasApp: true,
    location: "any",
    hasSolar: true,
    products: ["Zaptec Go 2"],
    basePrice: 505000
  }
];
