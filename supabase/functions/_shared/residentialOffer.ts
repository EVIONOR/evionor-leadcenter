import { additionalItemPrices, formatPrice, priceList } from "./priceList.ts";
import {
  chargerTemplates,
  type ChargerTemplate,
  type QuestionnaireData,
} from "./questionnaire.ts";

export const RESIDENTIAL_OFFER_TEMPLATE_VERSION = "2024-05-07";
export const DEFAULT_RESIDENTIAL_SENDER = "EVIONOR";

export interface ResidentialOfferInput {
  contactName: string;
  email: string;
  phoneNumber: string;
  carBrand: string;
  carModel: string;
  customCar: string;
  zipCode?: string;
  city?: string;
  phases: "1" | "3";
  amperage: string;
  installLocation: string;
  buildingType: "családi_ház" | "társas_ház" | "sorház" | "";
  needsInstallation: boolean;
  needsElectricalPlanning: boolean;
  indoorOutdoor: "kültér" | "beltér";
  mountingSurface: "beton" | "fa" | "tégla" | "";
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
  selectedTemplateIds: string[];
  additionalItems: string[];
  senderName: string;
  carDisplayText: string;
}

export interface QuoteDescriptor {
  productName: string;
  productUrl: string;
  grossPrice: number;
}

export interface ResidentialOfferRenderResult {
  html: string;
  subject: string;
  quoteDescriptors: QuoteDescriptor[];
}

export function getAutomaticResidentialTemplateIds(
  questionnaire: Pick<QuestionnaireData, "phases" | "solarIntegration">,
): string[] {
  const { phases, solarIntegration } = questionnaire;
  const phaseFilter = (template: ChargerTemplate) =>
    template.phase === phases || template.phase === "1/3";
  const solarFilter = (template: ChargerTemplate) => {
    if (solarIntegration === "nem") {
      return !template.hasSolar;
    }

    return template.hasSolar;
  };

  return chargerTemplates.filter(phaseFilter).filter(solarFilter).map((t) => t.id);
}

function getTemplateById(id: string): ChargerTemplate | undefined {
  return chargerTemplates.find((t) => t.id === id);
}

function calculateTotalPrice(
  selectedTemplateIds: string[],
  additionalItems: string[],
): number {
  let totalPrice = 0;

  selectedTemplateIds.forEach((templateId) => {
    const template = getTemplateById(templateId);
    if (template?.basePrice) {
      totalPrice += template.basePrice;
    }
  });

  additionalItems.forEach((item) => {
    const price = additionalItemPrices[item];
    if (price) {
      totalPrice += price;
    }
  });

  return totalPrice;
}

function buildProductList(selectedTemplateIds: string[]): string {
  return selectedTemplateIds
    .map((templateId) => {
      const template = getTemplateById(templateId);
      return template ? template.products.join(", ") : null;
    })
    .filter(Boolean)
    .join(", ");
}

export function buildResidentialOffer(
  input: ResidentialOfferInput,
  quoteUrls: Record<string, string> = {},
): ResidentialOfferRenderResult {
  const {
    contactName,
    email,
    phoneNumber,
    carBrand,
    carModel,
    customCar,
    zipCode,
    city,
    phases,
    amperage,
    installLocation,
    buildingType,
    needsInstallation,
    needsElectricalPlanning,
    indoorOutdoor,
    mountingSurface,
    needsPole,
    distanceFromBox,
    spaceInBox,
    groundworkWallPenetration,
    otherComments,
    solarIntegration,
    loadManagement,
    builtInCable,
    needsApp,
    infrastructureDevelopment,
    infrastructureDetails,
    overvoltageProtection,
    networkExpansion,
    expansionPhase,
    expansionAmperage,
    selectedTemplateIds,
    additionalItems,
    senderName,
    carDisplayText,
  } = input;

  const totalPrice = calculateTotalPrice(selectedTemplateIds, additionalItems);
  const productList = buildProductList(selectedTemplateIds);
  const carInfo = carDisplayText || `${carBrand} ${carModel} ${customCar}`.trim();

  const quoteDescriptors: QuoteDescriptor[] = selectedTemplateIds.map((templateId) => {
    const template = getTemplateById(templateId);
    const productName = template?.products[0] || "Ismeretlen termék";
    const productPrice = template?.basePrice || 0;
    const productUrl = quoteUrls[productName] || "";

    return {
      grossPrice: productPrice,
      productName,
      productUrl,
    };
  });

  const subject = `${senderName} - ${carInfo} - ${formatPrice(totalPrice)}`;

  const html = `
<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Árajánlat EVIONOR-tól</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; }
        h1 { color: #444; }
        .mb-1 { margin-bottom: 1rem; }
        .mb-2 { margin-bottom: 2rem; }
        .product-list { font-weight: bold; }
        .total-price { font-size: 1.2rem; font-weight: bold; color: #0056b3; }
        .highlight { background-color: #ffffe0; padding: 2px 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Kedves ${contactName}!</h1>
        <p class="mb-1">Köszönjük, hogy az EVIONOR-t választotta! Az alábbiakban megtalálja az Önre szabott árajánlatot a ${carInfo} típusú autójához.</p>

        <div class="mb-2">
            <p><strong>Az Ön által választott termékek:</strong></p>
            <p class="product-list">${productList}</p>
        </div>

        <div class="mb-2">
            <p><strong>Telepítési helyszín:</strong> ${installLocation}, ${buildingType}</p>
            <p><strong>Fázisok száma:</strong> ${phases}</p>
            <p><strong>Amperage:</strong> ${amperage}A</p>
        </div>

        <div class="mb-2">
            <p><strong>További igények:</strong></p>
            <ul>
                ${needsInstallation ? "<li>Telepítés szükséges</li>" : ""}
                ${needsElectricalPlanning ? "<li>Elektromos tervezés szükséges</li>" : ""}
                ${loadManagement ? "<li>Terhelésmenedzsment igény</li>" : ""}
                ${needsApp ? "<li>Applikáció szükséges</li>" : ""}
                ${infrastructureDevelopment ? `<li>Infrastruktúra fejlesztés: ${infrastructureDetails}</li>` : ""}
                ${overvoltageProtection ? "<li>Túlfeszültség védelem szükséges</li>" : ""}
            </ul>
        </div>

        <p class="total-price mb-2">A termékek és szolgáltatások ára összesen: <span class="highlight">${formatPrice(totalPrice)}</span></p>

        <p class="mb-2">Az árajánlat részleteit a csatolt PDF dokumentumokban találja meg. Kérdés esetén keressen minket bizalommal!</p>

        <p>Üdvözlettel,<br>${senderName}</p>
    </div>
</body>
</html>
`;

  return {
    html,
    quoteDescriptors,
    subject,
  };
}
