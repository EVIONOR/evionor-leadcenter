export interface QuestionnaireData {
  // Alapadatok
  carType: string;
  zipCode: string;
  city: string;
  phases: "1" | "3";
  amperage: string;
  installLocation: string;
  buildingType: "családi_ház" | "társas_ház" | "sorház" | "";
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
}

export const chargerTemplates: ChargerTemplate[] = [
  {
    id: "template1",
    name: "1 fázis - App kontroll - Kertbe/Belülre",
    phase: "1",
    hasApp: true,
    location: "indoor",
    hasSolar: false,
    products: ["Charge Amps HALO"]
  },
  {
    id: "template2",
    name: "1 fázis - Kültérre - RFID",
    phase: "1",
    hasApp: false,
    location: "outdoor",
    hasSolar: false,
    products: ["AMINA 1 (nincs kilógó kábel)"]
  },
  {
    id: "template3",
    name: "3 fázis - Standard",
    phase: "3",
    hasApp: true,
    location: "any",
    hasSolar: false,
    products: ["EASEE CHARGE UP", "ZAPTEC GO + LOAD BALANCE"]
  },
  {
    id: "template4",
    name: "3 fázis - Napelemes",
    phase: "3",
    hasApp: true,
    location: "any",
    hasSolar: true,
    products: ["Zaptec GO 2 + SOLAR LOAD BALANCING"]
  }
];
