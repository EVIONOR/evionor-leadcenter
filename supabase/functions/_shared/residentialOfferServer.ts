import {
  buildResidentialOffer,
  DEFAULT_RESIDENTIAL_SENDER,
  getAutomaticResidentialTemplateIds,
  RESIDENTIAL_OFFER_TEMPLATE_VERSION,
  type ResidentialOfferInput,
  type ResidentialOfferRenderResult,
} from "./residentialOffer.ts";
import type { EvionorQuestionnaireLead } from "./evionorAdmin.ts";
import { createResidentialQuotePdf } from "./quotePdf.ts";
import { createLocalServiceClient } from "./supabaseClients.ts";

export interface ResidentialLeadAuditResult {
  email: string;
  leadId: string;
  missingFields: string[];
}

const AUTOMATION_REQUIRED_FIELDS = [
  { key: "name", label: "name" },
  { key: "email", label: "email" },
  { key: "phone", label: "phone" },
  { key: "car_brand", label: "car_brand" },
  { key: "car_model", label: "car_model" },
] as const;

function isSupportedPhase(value: string): value is "1" | "3" {
  return value === "1" || value === "3";
}

export function auditResidentialLead(lead: EvionorQuestionnaireLead): ResidentialLeadAuditResult {
  const missingFields = AUTOMATION_REQUIRED_FIELDS.filter(({ key }) => {
    const value = lead[key];
    return typeof value !== "string" || value.trim().length === 0;
  }).map(({ label }) => label);

  return {
    email: lead.email,
    leadId: lead.id,
    missingFields,
  };
}

export function normalizeResidentialLead(lead: EvionorQuestionnaireLead): ResidentialOfferInput {
  const phases: "1" | "3" = isSupportedPhase(lead.phases) ? lead.phases : "3";
  const normalizedInput: ResidentialOfferInput = {
    additionalItems: [],
    amperage: "32",
    buildingType: "",
    builtInCable: false,
    carBrand: lead.car_brand,
    carDisplayText: `${lead.car_brand} ${lead.car_model}`.trim(),
    carModel: lead.car_model,
    city: "",
    contactName: lead.name,
    customCar: "",
    distanceFromBox: "10",
    email: lead.email,
    expansionAmperage: "",
    expansionPhase: "",
    groundworkWallPenetration: "",
    indoorOutdoor: "beltér",
    infrastructureDetails: "",
    infrastructureDevelopment: false,
    installLocation: "Garázs",
    language: lead.language || "hu",
    loadManagement: true,
    mountingSurface: "",
    needsApp: true,
    needsElectricalPlanning: false,
    needsInstallation: true,
    needsPole: false,
    networkExpansion: false,
    otherComments: "",
    overvoltageProtection: false,
    phases,
    phoneNumber: lead.phone,
    selectedTemplateIds: getAutomaticResidentialTemplateIds({
      phases,
      solarIntegration: "nem",
    }),
    senderName: DEFAULT_RESIDENTIAL_SENDER,
    solarIntegration: "nem",
    spaceInBox: "nemtudom",
    zipCode: "",
  };

  return normalizedInput;
}

async function hashText(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .slice(0, 8)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function createQuoteFileName(input: ResidentialOfferInput, productName: string, grossPrice: number): Promise<string> {
  const source = [
    RESIDENTIAL_OFFER_TEMPLATE_VERSION,
    input.contactName,
    input.email,
    productName,
    String(grossPrice),
  ].join("|");
  const hash = await hashText(source);
  return `ajanlat-${slugify(input.contactName)}-${slugify(productName)}-${hash}.pdf`;
}

export async function buildResidentialOfferWithQuotes(
  input: ResidentialOfferInput,
): Promise<ResidentialOfferRenderResult> {
  const initialOffer = buildResidentialOffer(input);
  const storageClient = createLocalServiceClient();
  const quoteUrls: Record<string, string> = {};

  for (const descriptor of initialOffer.quoteDescriptors) {
    const fileName = await createQuoteFileName(input, descriptor.productName, descriptor.grossPrice);
    const pdfBytes = await createResidentialQuotePdf({
      customerCity: input.city,
      customerEmail: input.email,
      customerName: input.contactName,
      customerPhone: input.phoneNumber,
      customerZip: input.zipCode,
      grossPrice: descriptor.grossPrice,
      productName: descriptor.productName,
      productUrl: descriptor.productUrl,
    });

    const { error } = await storageClient.storage
      .from("quotes")
      .upload(fileName, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (error) {
      throw new Error(`Failed to upload quote PDF for ${descriptor.productName}: ${error.message}`);
    }

    const { data } = storageClient.storage.from("quotes").getPublicUrl(fileName);
    quoteUrls[descriptor.productName] = data.publicUrl;
  }

  return buildResidentialOffer(input, quoteUrls);
}
