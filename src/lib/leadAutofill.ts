// Shared autofill logic for leads
// Used both in manual form filling and automatic processing

export interface LeadPrefillData {
  contactName: string;
  email: string;
  phoneNumber: string;
  carBrand: string;
  carModel: string;
  location?: string;
  phases?: string;
}

export interface AutofillData {
  amperage: string;
  installLocation: string;
  needsInstallation: boolean;
  needsElectricalPlanning: boolean;
  indoorOutdoor: "kültér" | "beltér";
  mountingSurface: "beton" | "fa" | "tégla" | "";
  needsBackplate: boolean;
  needsPole: boolean;
  distanceFromBox: string;
  spaceInBox: "igen" | "nem" | "nemtudom";
  groundworkWallPenetration: string;
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
  otherComments: string;
  buildingType: "családi_ház" | "társas_ház" | "sorház" | "";
  city: string;
  zipCode: string;
}

// Default values for autofill
export const getDefaultAutofillData = (): AutofillData => ({
  amperage: "32",
  installLocation: "Garázs",
  needsInstallation: true,
  needsElectricalPlanning: false,
  indoorOutdoor: "beltér",
  mountingSurface: "",
  needsBackplate: false,
  needsPole: false,
  distanceFromBox: "10",
  spaceInBox: "nemtudom",
  groundworkWallPenetration: "",
  solarIntegration: "nem",
  loadManagement: true,
  builtInCable: false,
  needsApp: true,
  infrastructureDevelopment: false,
  infrastructureDetails: "",
  overvoltageProtection: false,
  networkExpansion: false,
  expansionPhase: "",
  expansionAmperage: "",
  otherComments: "",
  buildingType: "családi_ház",
  city: "",
  zipCode: "",
});

// Merge prefill data with autofill defaults
export const mergeLeadData = (
  prefillData: LeadPrefillData,
  autofillData: AutofillData = getDefaultAutofillData()
) => {
  return {
    ...autofillData,
    ...prefillData,
    // Ensure phases has a default value if not provided
    phases: prefillData.phases || "1",
  };
};
