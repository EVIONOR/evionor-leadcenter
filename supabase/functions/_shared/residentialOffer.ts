import { additionalItemPrices, formatPrice, priceList } from "./priceList.ts";
import { chargerTemplates, type ChargerTemplate, type QuestionnaireData } from "./questionnaire.ts";

export const RESIDENTIAL_OFFER_TEMPLATE_VERSION = "2026-03-19";
export const DEFAULT_RESIDENTIAL_SENDER = "Horváth Gáspár";

export const residentialAdditionalItems = [
  "RFID Tag",
  "Szabadon álló oszlop",
  "Fali hátlap kábeltartóval",
  "Töltőkábel (3m / 5m / 7m / 10m)",
  "Kábel akasztó",
  "Type 2-es fejtartó",
] as const;

const MESSAGES = {
  hu: {
    htmlLang: "hu",
    title: "EV-Töltő Beszerzési Ajánlat",
    headerTitle: "EV-Töltő Beszerzési Ajánlat",
    headerSubtitle: "Személyre szabott megoldás az Ön igényeihez",
    preheader: (name: string) => `Személyre szabott EV-töltő ajánlat az Ön igényei alapján – ${name}`,
    intro:
      "Köszönjük érdeklődését! Az Ön által megadott adatok alapján az alábbi ajánlatot készítettük. Kérdésekkel válaszoljon erre az email-re vagy hívjon minket a +36 20 581 9166 számon! Kollégáink azonnal válaszolnak.",
    greetingCompany: "Tisztelt Ügyfelünk!",
    greeting: (name: string) => `Tisztelt ${name}!`,
    customerData: "Ügyfél adatok",
    labelCustomer: "Ügyfél",
    labelEmail: "E-mail",
    labelPhone: "Telefonszám",
    labelVehicle: "Jármű",
    labelLocation: "Helyszín",
    labelBuildingType: "Épület típus",
    labelElectricalSystem: "Elektromos rendszer",
    phasesUnit: (phases: string, amperage: string) => `${phases} fázis, ${amperage} A`,
    buildingTypeFallback: "Nincs megadva",
    recommendedCharger: "Ajánlott töltő",
    characteristics: "Jellemzők",
    optionalItems: "Opciós tételek",
    chargerPriceLabel: "Töltő ára:",
    viewBtn: "Megnézem &rarr;",
    downloadQuoteBtn: "Ajánlat letöltése &#x1F4C4;",
    installCtaBtn: "Telepítéssel kérem! &rarr;",
    ownElectricianNote:
      "Van saját villanyszerelőd? Rendeld meg csak a töltőt! A telepítésben és a beüzemelésben díjmentesen támogatjuk!",
    additionalSuggestions: "Kiegészítő javaslatok",
    additionalRequirements: "További telepítési követelmények",
    note: "Megjegyzés",
    extraWorkNote:
      'A sztenderd telepítési tartalmon túli munkavégzésről a helyszínen készül lista. Az árlistája a <a href="https://www.evionor.hu" style="color: #0071e3; text-decoration: underline;">honlapunkon elérhető</a>.',
    needsPole: "Oszlop szükséges",
    needsElectricalPlanning: "Villamos tervezés szükséges",
    overvoltageProtection: "Túlfeszültség védelem",
    infrastructureDevelopment: (details: string) => `Infrastruktúra fejlesztés: ${details}`,
    networkExpansion: (phase: string, amperage: string) =>
      `Hálózatbővítés: ${phase} fázis, ${amperage} A`,
    groundworkLabel: "Földmunka/Faláttörés:",
    standardInstallation: "Sztenderd telepítés",
    standardInstallationIntro: "A telepítés magában foglalja:",
    standardInstallationItems: [
      "Áramvédő kapcsoló (Legrand) beépítése meglévő szekrénybe",
      "Kismegszakító (Legrand) beszerelése meglévő szekrénybe",
      "Kültéri vagy beltéri kábel rögzítése (5m)",
      "Töltőállomás szakszerű felszerelése",
      "Beüzemelés és átadás",
    ],
    otherCommentsTitle: "Egyéb megjegyzések",
    process: "Folyamat",
    processSteps: (needsInstallation: boolean) => [
      "Rendelje meg egyszerűen a termékeinket akár erre az emailre történő válasszal!",
      "A termékeket díjmentesen házhoz szállítjuk.",
      ...(needsInstallation ? ["Rendelés után azonnal egyeztetjük a telepítés részleteit."] : []),
    ],
    benefitsTitle: "Mit kap, ha termékeinket választja?",
    benefits: [
      "✅ Stabil és kényelmes autótöltést a mindennapokban.",
      "✅ Megbízható technológiát és gondtalan működést.",
      "✅ 5 év gyártói garanciával védjük a befektetését.",
      "✅ Vásárlás után élethosszig tartó szakmai segítséget.",
    ],
    benefitsTagline: "Az EVIONOR-al a skandináv megbízhatóságot választja.",
    closingQuestion: "További kérdés esetén állunk rendelkezésére!",
    regards: "Üdvözlettel,",
    teamLine: "Az EVIONOR Csapata",
    footerCompany: "EVIONOR Magyarország &copy; 2026",
    footerTagline: "Elektromos autó töltési megoldások",
    subject: "Elektromos autó töltő ajánlat",
    installationOnePhase: "Egyfázisú töltőtelepítés",
    installationThreePhase: "Háromfázisú töltőtelepítés",
    loadMgmtZaptec: "Zaptec Sense Terhelésmenedzsment",
    loadMgmtEasee: "Easee Equalizer Terhelésmenedzsment",
    loadMgmtChargeAmps: "Charge Amps Amp Guard Terhelésmenedzsment",
    char: {
      phases1or3: "Fázisok száma: 1/3 fázis kompatibilis",
      amperage6to32: "Töltési áramerősség: 6–32 A között állítható",
      safety: "Biztonság: Beépített hibaáram védelem",
      authRfidApp: "Hitelesítés: RFID/NFC vagy mobilalkalmazás",
      connectivity: "Kapcsolódás: Bluetooth, WiFi és 4G LTE-M (eSIM)",
      smartLoad: "Okos funkciók: Terhelésmenedzsment kompatibilis",
      extraSoftStart: "Extra funkciók: Lágy indítás, okosotthon integráció",
      stats: "Töltési adatok: Részletes töltési statisztikák",
      otaLte: "Szoftverfrissítések: Automatikus frissítés LTE-n",
      ip54: "Védettség: IP54, kültéri használatra",
      warranty: "✓ Gyártói garancia 5 év",
      aminaApp: "Applikáció: Nem támogatott",
      aminaLoad: "Terhelésmenedzsment: nem támogatott",
      aminaPlugCharge: 'Egyszerű "Plug & Charge" töltés 7,4kW-ig',
      haloAmperage: "Töltési áram: 1 fázis 6-32 A / 3 fázis 6-16A",
      haloAuth: "Hitelesítés: RFID",
      haloConn: "Kapcsolódás: WiFi és RFID",
      haloLoad: "Szabályzás: Terhelés menedzsment kompatibilis",
      haloExtra: "Extra funkciók: Extra 220V konnektor",
      haloOta: "Szoftverfrissítések: Automatikus frissítések",
      haloIp: "Védettség kültérre: IP66 töltőtest, IP44 csatlakozó",
    },
  },
  ro: {
    htmlLang: "ro",
    title: "Ofertă Stație de Încărcare EV",
    headerTitle: "Ofertă Stație de Încărcare EV",
    headerSubtitle: "Soluție personalizată pentru nevoile dumneavoastră",
    preheader: (name: string) =>
      `Ofertă personalizată pentru stație de încărcare EV – ${name}`,
    intro:
      "Vă mulțumim pentru interesul acordat! Pe baza datelor furnizate, am pregătit oferta de mai jos. Pentru întrebări, răspundeți la acest email sau sunați-ne la +36 20 581 9166! Colegii noștri vă răspund imediat.",
    greetingCompany: "Stimate client,",
    greeting: (name: string) => `Stimate ${name},`,
    customerData: "Date client",
    labelCustomer: "Client",
    labelEmail: "E-mail",
    labelPhone: "Telefon",
    labelVehicle: "Vehicul",
    labelLocation: "Locație",
    labelBuildingType: "Tip clădire",
    labelElectricalSystem: "Sistem electric",
    phasesUnit: (phases: string, amperage: string) => `${phases} fază/faze, ${amperage} A`,
    buildingTypeFallback: "Nespecificat",
    recommendedCharger: "Stație recomandată",
    characteristics: "Caracteristici",
    optionalItems: "Opțiuni suplimentare",
    chargerPriceLabel: "Preț stație:",
    viewBtn: "Vezi detalii &rarr;",
    downloadQuoteBtn: "Descarcă oferta &#x1F4C4;",
    installCtaBtn: "Doresc cu instalare! &rarr;",
    ownElectricianNote:
      "Aveți electricianul dvs.? Comandați doar stația! Asistăm gratuit la instalare și punere în funcțiune!",
    additionalSuggestions: "Recomandări suplimentare",
    additionalRequirements: "Cerințe suplimentare de instalare",
    note: "Notă",
    extraWorkNote:
      'Pentru lucrări în afara conținutului standard de instalare se întocmește o listă la fața locului. Lista de prețuri este <a href="https://www.evionor.hu" style="color: #0071e3; text-decoration: underline;">disponibilă pe site-ul nostru</a>.',
    needsPole: "Necesar stâlp",
    needsElectricalPlanning: "Necesar proiect electric",
    overvoltageProtection: "Protecție la supratensiune",
    infrastructureDevelopment: (details: string) => `Dezvoltare infrastructură: ${details}`,
    networkExpansion: (phase: string, amperage: string) =>
      `Extindere rețea: ${phase} fază/faze, ${amperage} A`,
    groundworkLabel: "Săpături/Străpungere perete:",
    standardInstallation: "Instalare standard",
    standardInstallationIntro: "Instalarea include:",
    standardInstallationItems: [
      "Montarea unui disjunctor diferențial (Legrand) în tabloul existent",
      "Montarea unui disjunctor (Legrand) în tabloul existent",
      "Fixarea cablului interior sau exterior (5m)",
      "Montarea profesională a stației de încărcare",
      "Punere în funcțiune și predare",
    ],
    otherCommentsTitle: "Alte observații",
    process: "Proces",
    processSteps: (needsInstallation: boolean) => [
      "Comandați simplu produsele noastre, chiar și ca răspuns la acest email!",
      "Livrăm produsele gratuit la domiciliu.",
      ...(needsInstallation ? ["După comandă coordonăm imediat detaliile instalării."] : []),
    ],
    benefitsTitle: "Ce primiți alegând produsele noastre?",
    benefits: [
      "✅ Încărcare stabilă și confortabilă în fiecare zi.",
      "✅ Tehnologie fiabilă și funcționare fără griji.",
      "✅ 5 ani garanție de la producător pentru investiția dvs.",
      "✅ Asistență profesională pe viață după achiziție.",
    ],
    benefitsTagline: "Cu EVIONOR alegeți fiabilitatea scandinavă.",
    closingQuestion: "Pentru întrebări suplimentare vă stăm la dispoziție!",
    regards: "Cu stimă,",
    teamLine: "Echipa EVIONOR",
    footerCompany: "EVIONOR Ungaria &copy; 2026",
    footerTagline: "Soluții de încărcare pentru autovehicule electrice",
    subject: "Ofertă stație de încărcare auto electric",
    installationOnePhase: "Instalare stație monofazată",
    installationThreePhase: "Instalare stație trifazată",
    loadMgmtZaptec: "Zaptec Sense - Management consum",
    loadMgmtEasee: "Easee Equalizer - Management consum",
    loadMgmtChargeAmps: "Charge Amps Amp Guard - Management consum",
    char: {
      phases1or3: "Număr faze: compatibil 1/3 faze",
      amperage6to32: "Curent încărcare: reglabil între 6–32 A",
      safety: "Siguranță: protecție diferențială integrată",
      authRfidApp: "Autentificare: RFID/NFC sau aplicație mobilă",
      connectivity: "Conectivitate: Bluetooth, WiFi și 4G LTE-M (eSIM)",
      smartLoad: "Funcții smart: compatibil management consum",
      extraSoftStart: "Funcții extra: pornire lină, integrare smart-home",
      stats: "Date încărcare: statistici detaliate",
      otaLte: "Actualizări software: automate prin LTE",
      ip54: "Protecție: IP54, pentru exterior",
      warranty: "✓ Garanție producător 5 ani",
      aminaApp: "Aplicație: nesuportată",
      aminaLoad: "Management consum: nesuportat",
      aminaPlugCharge: 'Încărcare simplă "Plug & Charge" până la 7,4kW',
      haloAmperage: "Curent încărcare: 1 fază 6-32 A / 3 faze 6-16A",
      haloAuth: "Autentificare: RFID",
      haloConn: "Conectivitate: WiFi și RFID",
      haloLoad: "Reglaj: compatibil management consum",
      haloExtra: "Funcții extra: priză 220V suplimentară",
      haloOta: "Actualizări software: automate",
      haloIp: "Protecție exterior: IP66 corp, IP44 conector",
    },
  },
} as const;

function getMessages(language: ResidentialLanguage = "hu") {
  return MESSAGES[language] || MESSAGES.hu;
}

export type ResidentialLanguage = "hu" | "ro";

export interface ResidentialOfferInput extends QuestionnaireData {
  additionalItems?: string[];
  carDisplayText?: string;
  language?: ResidentialLanguage;
  selectedTemplateIds?: string[];
  senderName?: string;
}

export interface ResidentialQuoteDescriptor {
  fileName: string;
  grossPrice: number;
  productName: string;
  productUrl: string;
}

export interface ResidentialOfferRenderResult {
  html: string;
  quoteDescriptors: ResidentialQuoteDescriptor[];
  quoteUrls: Record<string, string>;
  selectedProducts: string[];
  selectedTemplateIds: string[];
  subject: string;
}

interface LoadManagementPackage {
  name: string;
  price: number;
  url: string;
}

interface InstallationPackage {
  name: string;
  price: number;
  url: string;
}

const productUrls: Record<string, string> = {
  "Charge Amps Halo 11kW": "https://evionor.hu/collections/all/products/charge-amps-halo-7-4kw-ev-tolto",
  "Charge Amps Luna 22kW": "https://evionor.hu/collections/all/products/charge-amps-luna-22kw-ev-tolto",
  "AMINA 1 - 7.4kW": "https://evionor.hu/collections/all/products/amina-1-evtlt?_pos=1&_fid=bb7a6be86&_ss=c",
  "Easee Charge Up 22kW": "https://evionor.hu/collections/all/products/easee-charge-up-evtlt",
  "Zaptec Go 22kW": "https://evionor.hu/collections/all/products/zaptec-go-evtlt",
  "Zaptec Solar MID": "https://evionor.hu/collections/all/products/zaptec-go-2",
};

const cartUrls: Record<string, string> = {
  "AMINA 1 - 7.4kW": "https://evionor.hu/products/amina-1-1-fazisu-tolto-telepitessel",
  "Charge Amps Halo 11kW": "https://evionor.hu/products/charge-amps-halo-7-4kw-11kw-ev-tolto-telepites-csomag",
  "Charge Amps Luna 22kW": "https://evionor.hu/products/charge-amps-luna-22kw-ev-tolto-telepites-csomag",
  "Zaptec Go 22kW":
    "https://evionor.hu/collections/all/products/zaptec-go-22kw-telepitesi-csomagban?_pos=8&_fid=5b9cabd46&_ss=c",
  "Zaptec Solar MID": "https://evionor.hu/products/zaptec-go-22kw-ev-tolto-telepitesi-csomgaban",
  "Easee Charge Up 22kW": "https://evionor.hu/products/easee-charge-up-22kw-ev-tolto-telepitesi-csomgaban",
};

export function getAutomaticResidentialTemplateIds(
  data: Pick<ResidentialOfferInput, "phases" | "solarIntegration">,
): string[] {
  if (data.phases === "1") {
    return ["template2", "template1"];
  }

  if (data.solarIntegration !== "nem") {
    return ["template4"];
  }

  return ["template3b", "template3a"];
}

export function getRecommendedResidentialTemplateId(
  data: Pick<ResidentialOfferInput, "needsApp" | "phases" | "solarIntegration">,
): string {
  if (data.solarIntegration !== "nem") return "template4";
  if (data.phases === "3") return "template3b";
  if (data.needsApp) return "template1";
  return "template2";
}

function getProductUrl(productName: string): string {
  return productUrls[productName] || "https://evionor.hu/webshop/";
}

function getCartUrl(productName: string): string {
  return cartUrls[productName] || "https://evionor.hu/webshop/";
}

function getDisplayName(name: string, language: ResidentialLanguage = "hu"): string {
  if (language === "ro") {
    // Remove "22kW" / "11kW" / "7.4kW" suffix and replace with "stație de încărcare"
    return name.replace(/\s*-?\s*(22kW|11kW|7\.4kW)\s*/g, " ").replace(/\s+/g, " ").trim() + " stație de încărcare";
  }
  return name.replace(/22kW/g, "EV·TÖLTŐ");
}

// HUF -> RON conversion rate (1 RON ≈ 80 HUF)
const HUF_TO_RON_RATE = 80;

function formatPriceLocalized(price: number, language: ResidentialLanguage = "hu"): string {
  if (language === "ro") {
    const ron = Math.round(price / HUF_TO_RON_RATE);
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(ron);
  }
  return formatPrice(price);
}

function getLocalizedTemplateName(templateName: string, language: ResidentialLanguage = "hu"): string {
  if (language !== "ro") return templateName;
  // Patterns like:
  // "3 fázis - Standard - Zaptec Go 22kW" -> "Zaptec Go stație de încărcare EV trifazată până la 22kW"
  // "1 fázis - Standard - AMINA 1 - 7.4kW" -> "AMINA 1 stație de încărcare EV monofazată până la 7.4kW"
  // "1/3 fázis - Standard - Charge Amps Halo 11kW" -> "Charge Amps Halo stație de încărcare EV mono/trifazată până la 11kW"
  // "3 fázis - Napelemes - Zaptec Solar MID 22kW" -> "Zaptec Solar MID stație de încărcare EV trifazată cu integrare solară până la 22kW"
  const map: Record<string, string> = {
    "3 fázis - Standard - Zaptec Go 22kW": "Zaptec Go stație de încărcare EV trifazată până la 22kW",
    "3 fázis - Standard - Easee Charge Up 22kW": "Easee Charge Up stație de încărcare EV trifazată până la 22kW",
    "3 fázis - Standard - Charge Amps Luna 22kW": "Charge Amps Luna stație de încărcare EV trifazată până la 22kW",
    "1 fázis - Standard - AMINA 1 - 7.4kW": "AMINA 1 stație de încărcare EV monofazată până la 7.4kW",
    "1/3 fázis - Standard - Charge Amps Halo 11kW": "Charge Amps Halo stație de încărcare EV mono/trifazată până la 11kW",
    "3 fázis - Napelemes - Zaptec Solar MID 22kW": "Zaptec Solar MID stație de încărcare EV trifazată cu integrare solară până la 22kW",
  };
  return map[templateName] || templateName;
}

function getChargerImageUrl(productName: string): string {
  if (productName.includes("Zaptec Solar MID")) {
    return "https://evionor.hu/cdn/shop/files/ZaptecGo2_Productimage_quater_asphaltblack.webp?v=1762325254&width=600";
  }
  if (productName.includes("Zaptec Go 22kW") || (productName.includes("Zaptec Go") && !productName.includes("Solar"))) {
    return "https://evionor.hu/cdn/shop/files/Zaptec_Go_Home_Charging_2329.webp?v=1762272030&width=600";
  }
  if (productName.includes("Easee Charge Up")) {
    return "https://evionor.hu/cdn/shop/files/ChargingRobotAll_Front_Black_2K_8-bit_sRGB_Web_e31b280f-1e5a-4656-9124-c897b46649da.webp?v=1762426764&width=600";
  }
  if (productName.includes("Charge Amps Luna")) {
    return "https://evionor.hu/cdn/shop/files/PACKSHOT_-_Luna_Silver_-_Front_Transparent_HR.webp?v=1762427311&width=600";
  }
  if (productName.includes("AMINA 1") || productName.includes("Amina 1")) {
    return "https://evionor.hu/cdn/shop/files/Amina1-01_b6b7cf86-b2bf-4fee-bfd1-2eed3d1e2273.webp?v=1760611153&width=600";
  }
  if (productName.includes("Charge Amps Halo")) {
    return "https://evionor.hu/cdn/shop/files/PACKSHOTSHALOwCableFrontTransparentHR.webp?v=1760611158&width=600";
  }

  return "";
}

function getLoadManagementPackage(
  productName: string,
  language: ResidentialLanguage = "hu",
): LoadManagementPackage | null {
  const m = getMessages(language);
  if (productName.includes("Zaptec")) {
    return {
      name: m.loadMgmtZaptec,
      price: 127000,
      url: "https://evionor.hu/collections/all/products/zaptec-sense-gen-ct-clamp-csomag-ev-mero?_pos=14&_fid=c1e909eaa&_ss=c",
    };
  }

  if (productName.includes("Easee")) {
    return {
      name: m.loadMgmtEasee,
      price: 140000,
      url: "https://evionor.hu/collections/all/products/easee-equalizer-amp-csomag-ev-mero?_pos=9&_fid=c1e909eaa&_ss=c",
    };
  }

  if (productName.includes("Charge Amps")) {
    return {
      name: m.loadMgmtChargeAmps,
      price: 132000,
      url: "https://evionor.hu/collections/all/products/charge-amps-amp-guard-63a-ev-mero?_pos=10&_fid=53fe77cfa&_ss=c",
    };
  }

  return null;
}

function getInstallationPackage(
  productName: string,
  language: ResidentialLanguage = "hu",
): InstallationPackage {
  const m = getMessages(language);
  if (productName.includes("AMINA 1") || productName.includes("Amina 1") || productName.includes("Charge Amps Halo")) {
    return {
      name: m.installationOnePhase,
      price: 199000,
      url: "https://evionor.hu/collections/all?filter.p.product_type=Telep%C3%ADt%C3%A9s",
    };
  }

  return {
    name: m.installationThreePhase,
    price: 219000,
    url: "https://evionor.hu/collections/all/products/haromfazisu-toltotelepites-csomag?_pos=2&_fid=45b4bccd7&_ss=c",
  };
}

function findProductPrice(productName: string): number {
  const normalizedSearch = productName
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace("+ load balance", "")
    .replace("+ solar load balancing", "")
    .trim();

  let product = priceList.find((item) => {
    const normalizedProductName = item.name.toLowerCase().replace(/\s+/g, " ");
    return normalizedProductName === normalizedSearch;
  });

  if (!product) {
    product = priceList.find((item) => {
      const normalizedProductName = item.name.toLowerCase().replace(/\s+/g, " ");
      const searchWords = normalizedSearch.split(" ");
      return searchWords.every((word) => normalizedProductName.includes(word));
    });
  }

  return product?.price || 0;
}

function findOriginalPrice(productName: string): number | null {
  const normalizedSearch = productName
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace("+ load balance", "")
    .replace("+ solar load balancing", "")
    .trim();

  let product = priceList.find((item) => {
    const normalizedProductName = item.name.toLowerCase().replace(/\s+/g, " ");
    return normalizedProductName === normalizedSearch;
  });

  if (!product) {
    product = priceList.find((item) => {
      const normalizedProductName = item.name.toLowerCase().replace(/\s+/g, " ");
      const searchWords = normalizedSearch.split(" ");
      return searchWords.every((word) => normalizedProductName.includes(word));
    });
  }

  return product?.originalPrice || null;
}

function isCompanyName(name: string): boolean {
  const companyIndicators = ["kft", "bt", "zrt", "nyrt", "ltd", "inc", "corp", "gmbh", "kkt", "ev", "srl", "sa"];
  const lowerName = name.toLowerCase();
  return companyIndicators.some((indicator) => lowerName.includes(indicator)) || name.includes(".");
}

function getGreeting(name: string, language: ResidentialLanguage = "hu"): string {
  const m = getMessages(language);
  if (isCompanyName(name)) {
    return m.greetingCompany;
  }
  return m.greeting(name);
}

function buildCharLi(text: string, highlight = false): string {
  if (highlight) {
    return `<li style="font-size: 14px; background-color: #d1fae5; padding: 4px 8px; border-radius: 6px; font-weight: 700; color: #065f46;">${text}</li>`;
  }
  return `<li style="font-size: 14px;">${text}</li>`;
}

function getCharacteristics(productName: string, language: ResidentialLanguage = "hu"): string {
  const c = getMessages(language).char;
  const standardSmart = [
    c.phases1or3,
    c.amperage6to32,
    c.safety,
    c.authRfidApp,
    c.connectivity,
    c.smartLoad,
    c.extraSoftStart,
    c.stats,
    c.otaLte,
    c.ip54,
  ];

  if (
    productName.includes("Easee Charge Up") ||
    productName.includes("Zaptec Solar MID") ||
    productName.includes("Zaptec Go 22kW") ||
    (productName.includes("Zaptec Go") && !productName.includes("Solar")) ||
    productName.includes("Charge Amps Luna")
  ) {
    return standardSmart.map((item) => buildCharLi(item)).join("") + buildCharLi(c.warranty, true);
  }

  if (productName.includes("Amina 1") || productName.includes("AMINA 1")) {
    return [c.amperage6to32, c.safety, c.aminaApp, c.aminaLoad, c.aminaPlugCharge, c.ip54]
      .map((item) => buildCharLi(item))
      .join("") + buildCharLi(c.warranty, true);
  }

  if (productName.includes("Charge Amps Halo")) {
    return [
      c.phases1or3,
      c.haloAmperage,
      c.safety,
      c.haloAuth,
      c.haloConn,
      c.haloLoad,
      c.haloExtra,
      c.haloOta,
      c.haloIp,
    ]
      .map((item) => buildCharLi(item))
      .join("") + buildCharLi(c.warranty, true);
  }

  return "";
}


function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getSelectedTemplates(input: ResidentialOfferInput): ChargerTemplate[] {
  const requestedTemplateIds =
    input.selectedTemplateIds && input.selectedTemplateIds.length > 0
      ? input.selectedTemplateIds
      : getAutomaticResidentialTemplateIds(input);

  return requestedTemplateIds
    .map((templateId) => chargerTemplates.find((template) => template.id === templateId))
    .filter((template): template is ChargerTemplate => Boolean(template));
}

function getCarDisplayText(input: ResidentialOfferInput): string {
  if (input.carDisplayText && input.carDisplayText.trim().length > 0) {
    return input.carDisplayText;
  }

  if (input.customCar && input.customCar.trim().length > 0) {
    return input.customCar;
  }

  return `${input.carBrand} ${input.carModel}`.trim();
}

function getAdditionalItems(input: ResidentialOfferInput): string[] {
  return (input.additionalItems || []).filter((item) => item in additionalItemPrices);
}

function getResidentialSubject(input: ResidentialOfferInput): string {
  return getMessages(input.language).subject;
}

function getQuoteDescriptors(selectedTemplates: ChargerTemplate[]): ResidentialQuoteDescriptor[] {
  return selectedTemplates.map((template) => {
    const productName = template.products[0];
    return {
      fileName: "",
      grossPrice: findProductPrice(productName),
      productName,
      productUrl: getProductUrl(productName),
    };
  });
}

export function buildResidentialOffer(
  input: ResidentialOfferInput,
  quoteUrls: Record<string, string> = {},
): ResidentialOfferRenderResult {
  const language: ResidentialLanguage = input.language || "hu";
  const m = getMessages(language);
  const selectedTemplates = getSelectedTemplates(input);
  const selectedTemplateIds = selectedTemplates.map((template) => template.id);
  const selectedProducts = selectedTemplates.map((template) => template.products[0]);
  const additionalItems = getAdditionalItems(input);
  const senderName = input.senderName || DEFAULT_RESIDENTIAL_SENDER;
  const carDisplayText = getCarDisplayText(input);
  const buildingTypeLabel = input.buildingType ? input.buildingType.replace("_", " ") : m.buildingTypeFallback;
  const locationText = input.city && input.zipCode ? `${escapeHtml(input.city)}, ${escapeHtml(input.zipCode)}` : "";

  const productSections = selectedTemplates
    .map((template, templateIndex) => {
      const product = template.products[0];
      const chargerPrice = findProductPrice(product);
      const originalPrice = findOriginalPrice(product);
      const productUrl = getProductUrl(product);
      const loadManagementPackage = input.loadManagement ? getLoadManagementPackage(product, language) : null;
      const installationPackage = getInstallationPackage(product, language);
      const installationPrice = input.needsInstallation ? installationPackage.price : 0;
      const quoteUrl = quoteUrls[product];
      const isThreePhase = installationPackage.name === m.installationThreePhase;

      return `
        ${templateIndex > 0 ? '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0;"><tr><td style="height: 1px; background: linear-gradient(90deg, transparent 0%, #cbd5e1 30%, #cbd5e1 70%, transparent 100%);"></td></tr></table>' : ""}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
          <tr>
            <td style="padding: 16px 16px 6px 16px; border-bottom: 2px solid #e2e8f0;">
              <p style="margin: 0 0 2px 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">${m.recommendedCharger} ${templateIndex + 1}</p>
              <h2 style="margin: 0; color: #0a2540; font-size: 16px; font-weight: 700; letter-spacing: -0.3px;">${escapeHtml(getLocalizedTemplateName(template.name, language))}</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px;">
              ${
                getChargerImageUrl(product)
                  ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                <tr>
                  <td align="center" style="padding: 12px; background-color: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0;">
                    <a href="${productUrl}" style="display: inline-block; text-decoration: none;">
                      <img src="${getChargerImageUrl(product)}" alt="${escapeHtml(getDisplayName(product, language))}" width="240" style="max-width: 240px; width: 100%; height: auto; display: block; margin: 0 auto; border: 0;" />
                    </a>
                  </td>
                </tr>
              </table>
              `
                  : ""
              }
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 16px;">
                <tr>
                  <td style="padding: 14px;">
                    <p style="margin: 0 0 8px 0;"><a href="${productUrl}" style="color: #0a2540; font-size: 15px; font-weight: 700; text-decoration: none; border-bottom: 2px solid #0071e3; display: inline-block;">${escapeHtml(getDisplayName(product, language))}</a></p>
                    <p style="margin: 0; color: #0071e3; font-size: 20px; font-weight: 800;">${originalPrice ? `<span style="color: #94a3b8; text-decoration: line-through; font-size: 14px; font-weight: 400; margin-right: 8px;">${formatPriceLocalized(originalPrice, language)}</span>` : ""}${formatPriceLocalized(chargerPrice, language)}</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 14px;">
                    <p style="margin: 0 0 10px 0; color: #0a2540; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;">${m.characteristics}</p>
                    <ul style="margin: 0; padding: 0 0 0 18px; color: #4a5568; font-size: 13px; line-height: 1.8;">${getCharacteristics(product, language)}</ul>
                  </td>
                </tr>
              </table>
              ${
                loadManagementPackage || input.needsInstallation
                  ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px; background-color: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 14px;">
                    <h3 style="margin: 0 0 12px 0; color: #0a2540; font-size: 14px; font-weight: 700;">${m.optionalItems}</h3>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      ${
                        loadManagementPackage
                          ? `
                      <tr>
                        <td style="padding: 8px 0; width: 65%;"><a href="${loadManagementPackage.url}" target="_blank" style="color: #0a2540; font-size: 13px; font-weight: 600; text-decoration: none; border-bottom: 2px solid #0071e3; display: inline-block;">${escapeHtml(loadManagementPackage.name)}</a></td>
                        <td style="padding: 8px 0 8px 10px; color: #0071e3; font-size: 15px; font-weight: 800; text-align: right;">${formatPrice(loadManagementPackage.price)}</td>
                      </tr>
                      `
                          : ""
                      }
                      ${
                        input.needsInstallation
                          ? `
                      <tr>
                        <td style="padding: 8px 0; width: 65%;"><a href="${installationPackage.url}" target="_blank" style="color: #0a2540; font-size: 13px; font-weight: 600; text-decoration: none; border-bottom: 2px solid #0071e3; display: inline-block;">${escapeHtml(installationPackage.name)}</a></td>
                        <td style="padding: 8px 0 8px 10px; color: #0071e3; font-size: 15px; font-weight: 800; text-align: right;">${formatPrice(installationPrice)}</td>
                      </tr>
                      ${
                        isThreePhase
                          ? `
                      <tr>
                        <td colspan="2" style="padding: 6px 0 2px 0; font-size: 12px; color: #059669; font-style: italic; line-height: 1.4;">${m.ownElectricianNote}</td>
                      </tr>
                      `
                          : ""
                      }
                      `
                          : ""
                      }
                    </table>
                    ${
                      input.needsInstallation
                        ? `
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 14px;">
                      <tr>
                        <td align="center">
                          <a href="${getCartUrl(product)}" style="display: inline-block; background-color: #059669; color: #ffffff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 700;">${m.installCtaBtn}</a>
                        </td>
                      </tr>
                    </table>
                    `
                        : ""
                    }
                  </td>
                </tr>
              </table>
              `
                  : ""
              }
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px; background-color: #f0f7ff; border-radius: 10px; border: 2px solid #0071e3; overflow: hidden;">
                <tr>
                  <td style="padding: 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding: 0 0 12px 0; color: #0a2540; font-size: 14px; font-weight: 700;">${m.chargerPriceLabel}</td>
                        <td style="padding: 0 0 12px 0; color: #0071e3; font-size: 20px; font-weight: 800; text-align: right;">${originalPrice ? `<span style="color: #94a3b8; text-decoration: line-through; font-size: 14px; font-weight: 400; margin-right: 8px;">${formatPrice(originalPrice)}</span>` : ""}${formatPrice(chargerPrice)}</td>
                      </tr>
                    </table>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="padding-top: 4px;">
                          <a href="${productUrl}" style="display: inline-block; background-color: #0071e3; color: #ffffff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 700; letter-spacing: -0.2px;">${m.viewBtn}</a>
                          ${quoteUrl ? `<a href="${quoteUrl}" style="display: inline-block; background-color: #0a2540; color: #ffffff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 700; letter-spacing: -0.2px; margin-left: 8px;">${m.downloadQuoteBtn}</a>` : ""}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;
    })
    .join("");

  const additionalItemsSection =
    additionalItems.length > 0
      ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
      <tr>
        <td style="padding: 16px 16px 6px 16px; border-bottom: 2px solid #e2e8f0;">
          <h2 style="margin: 0; color: #0a2540; font-size: 16px; font-weight: 700; letter-spacing: -0.3px;">${m.additionalSuggestions}</h2>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 16px 16px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
            <tr>
              <td style="padding: 12px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  ${additionalItems
                    .map(
                      (item) => `
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-size: 13px; width: 65%; border-bottom: 1px solid #f1f5f9;">${escapeHtml(item)}</td>
                    <td style="padding: 8px 0 8px 10px; color: #0a2540; font-size: 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #f1f5f9;">${formatPrice(additionalItemPrices[item] || 0)}</td>
                  </tr>
                  `,
                    )
                    .join("")}
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    `
      : "";

  const additionalInstallationSection =
    input.needsInstallation &&
    (input.needsPole ||
      input.needsElectricalPlanning ||
      input.overvoltageProtection ||
      input.infrastructureDevelopment ||
      input.networkExpansion)
      ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
      <tr>
        <td style="padding: 16px 16px 6px 16px; border-bottom: 2px solid #e2e8f0;">
          <h2 style="margin: 0; color: #0a2540; font-size: 16px; font-weight: 700; letter-spacing: -0.3px;">${m.additionalRequirements}</h2>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 16px 16px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
            <tr>
              <td style="padding: 12px;">
                <ul style="margin: 0 0 10px 0; padding: 0 0 0 18px; color: #4a5568; font-size: 13px; line-height: 1.8;">
                  ${input.needsPole ? `<li>${m.needsPole}</li>` : ""}
                  ${input.needsElectricalPlanning ? `<li>${m.needsElectricalPlanning}</li>` : ""}
                  ${input.overvoltageProtection ? `<li>${m.overvoltageProtection}</li>` : ""}
                  ${input.infrastructureDevelopment && input.infrastructureDetails ? `<li>${m.infrastructureDevelopment(escapeHtml(input.infrastructureDetails))}</li>` : ""}
                  ${input.networkExpansion ? `<li>${m.networkExpansion(escapeHtml(input.expansionPhase), escapeHtml(input.expansionAmperage))}</li>` : ""}
                </ul>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #eff6ff; border-radius: 6px;">
                  <tr>
                    <td style="padding: 10px 12px; border-left: 3px solid #3b82f6; color: #1e3a8a; font-size: 12px; line-height: 1.6;">
                      <strong>${m.note}:</strong> ${m.extraWorkNote}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    `
      : "";

  const groundworkSection = input.groundworkWallPenetration
    ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
      <tr>
        <td style="padding: 14px; background-color: #fef3c7; border-radius: 10px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0 0 6px 0; color: #92400e; font-size: 13px; font-weight: 700;">${m.groundworkLabel}</p>
          <p style="margin: 0; color: #78350f; font-size: 13px; line-height: 1.6;">${escapeHtml(input.groundworkWallPenetration)}</p>
        </td>
      </tr>
    </table>
    `
    : "";

  const standardInstallationSection = input.needsInstallation
    ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
      <tr>
        <td style="padding: 16px 16px 6px 16px; border-bottom: 2px solid #e2e8f0;">
          <h2 style="margin: 0; color: #0a2540; font-size: 16px; font-weight: 700; letter-spacing: -0.3px;">${m.standardInstallation}</h2>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 16px 16px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
            <tr>
              <td style="padding: 12px;">
                <p style="margin: 0 0 10px 0; color: #4a5568; font-size: 13px; line-height: 1.7;">${m.standardInstallationIntro}</p>
                <ul style="margin: 0; padding: 0 0 0 18px; color: #4a5568; font-size: 13px; line-height: 1.8;">
                  ${m.standardInstallationItems.map((item) => `<li>${item}</li>`).join("")}
                </ul>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    `
    : "";

  const otherCommentsSection = input.otherComments
    ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
      <tr>
        <td style="padding: 14px; background-color: #eff6ff; border-radius: 10px; border-left: 4px solid #3b82f6;">
          <h2 style="margin: 0 0 10px 0; color: #1e40af; font-size: 14px; font-weight: 700;">${m.otherCommentsTitle}</h2>
          <p style="margin: 0; color: #1e3a8a; font-size: 13px; line-height: 1.6;">${escapeHtml(input.otherComments)}</p>
        </td>
      </tr>
    </table>
    `
    : "";

  const html = `
<!DOCTYPE html>
<html lang="${m.htmlLang}" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>${m.title}</title>
  <style>
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; margin: 0 auto !important; }
      .content-padding { padding: 20px 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; width: 100%; background-color: #f0f2f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all;">
    ${escapeHtml(m.preheader(input.contactName))}
  </div>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f2f5;">
    <tr>
      <td align="center" style="padding: 32px 12px;">
        <table role="presentation" class="email-container" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
          <tr>
            <td style="background: linear-gradient(135deg, #0a2540 0%, #1a3a5c 50%, #0071e3 100%); padding: 28px 24px 24px; text-align: center;" bgcolor="#0a2540">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 14px;" bgcolor="#ffffff">
                      <tr>
                        <td style="padding: 10px 24px; background-color: #ffffff; border-radius: 14px;" bgcolor="#ffffff">
                          <a href="https://evionor.hu" target="_blank" style="display: block; text-decoration: none;">
                            <img src="https://evionor.hu/cdn/shop/files/evionor-logo.png?v=1761743181" alt="EVIONOR" width="200" style="height: auto; display: block; border: 0; max-width: 100%;" />
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; line-height: 1.3;">${m.headerTitle}</h1>
              <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px;">${m.headerSubtitle}</p>
            </td>
          </tr>
          <tr>
            <td class="content-padding" style="padding: 28px 24px;">
              <p style="margin: 0 0 16px 0; color: #1a1a2e; font-size: 15px; line-height: 1.6; font-weight: 500;">${escapeHtml(getGreeting(input.contactName, language))}</p>
              <p style="margin: 0 0 32px 0; color: #4a5568; font-size: 14px; line-height: 1.7;">${m.intro}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 16px 6px 16px; border-bottom: 2px solid #e2e8f0;">
                    <h2 style="margin: 0; color: #0a2540; font-size: 16px; font-weight: 700; letter-spacing: -0.3px;">${m.customerData}</h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px 16px 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr><td style="color: #64748b; font-size: 11px; padding: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">${m.labelCustomer}</td></tr>
                      <tr><td style="color: #0a2540; font-size: 14px; font-weight: 600; padding: 0 0 12px 0;">${escapeHtml(input.contactName)}</td></tr>
                      <tr><td style="color: #64748b; font-size: 11px; padding: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">${m.labelEmail}</td></tr>
                      <tr><td style="color: #0a2540; font-size: 14px; font-weight: 500; padding: 0 0 12px 0;">${escapeHtml(input.email)}</td></tr>
                      ${
                        language === "ro"
                          ? ""
                          : `
                      <tr><td style="color: #64748b; font-size: 11px; padding: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">${m.labelPhone}</td></tr>
                      <tr><td style="color: #0a2540; font-size: 14px; font-weight: 500; padding: 0 0 12px 0;">${escapeHtml(input.phoneNumber)}</td></tr>
                      `
                      }
                      <tr><td style="color: #64748b; font-size: 11px; padding: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">${m.labelVehicle}</td></tr>
                      <tr><td style="color: #0a2540; font-size: 14px; font-weight: 500; padding: 0 0 12px 0;">${escapeHtml(carDisplayText)}</td></tr>
                      ${
                        locationText
                          ? `
                      <tr><td style="color: #64748b; font-size: 11px; padding: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">${m.labelLocation}</td></tr>
                      <tr><td style="color: #0a2540; font-size: 14px; font-weight: 500; padding: 0 0 12px 0;">${locationText}</td></tr>
                      `
                          : ""
                      }
                      <tr><td style="color: #64748b; font-size: 11px; padding: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">${m.labelBuildingType}</td></tr>
                      <tr><td style="color: #0a2540; font-size: 14px; font-weight: 500; padding: 0 0 12px 0;">${escapeHtml(buildingTypeLabel)}</td></tr>
                      <tr><td style="color: #64748b; font-size: 11px; padding: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">${m.labelElectricalSystem}</td></tr>
                      <tr><td style="color: #0a2540; font-size: 14px; font-weight: 500; padding: 0 0 4px 0;">${escapeHtml(m.phasesUnit(input.phases, input.amperage))}</td></tr>
                    </table>
                  </td>
                </tr>
              </table>
              ${productSections}
              ${additionalItemsSection}
              ${additionalInstallationSection}
              ${groundworkSection}
              ${standardInstallationSection}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 16px 6px 16px; border-bottom: 2px solid #e2e8f0;">
                    <h2 style="margin: 0; color: #0a2540; font-size: 16px; font-weight: 700; letter-spacing: -0.3px;">${m.process}</h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px 16px 16px;">
                    <ol style="margin: 0; padding: 0 0 0 18px; color: #4a5568; font-size: 13px; line-height: 2;">
                      ${m.processSteps(!!input.needsInstallation).map((step) => `<li>${step}</li>`).join("")}
                    </ol>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px; background-color: #f0f9ff; border-radius: 12px; border: 1px solid #bae6fd;">
                <tr>
                  <td style="padding: 16px 16px 6px 16px; border-bottom: 2px solid #bae6fd;">
                    <h2 style="margin: 0; color: #0a2540; font-size: 16px; font-weight: 700; letter-spacing: -0.3px;">${m.benefitsTitle}</h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 16px 18px 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      ${m.benefits.map((b) => `<tr><td style="padding: 4px 0; color: #334155; font-size: 13px; line-height: 1.6;">${b}</td></tr>`).join("")}
                    </table>
                    <p style="margin: 14px 0 0 0; color: #0369a1; font-size: 13px; font-weight: 700; font-style: italic;">${m.benefitsTagline}</p>
                  </td>
                </tr>
              </table>
              ${otherCommentsSection}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 2px solid #e2e8f0;">
                <tr>
                  <td style="padding-top: 24px;">
                    <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 14px; line-height: 1.6;">${m.closingQuestion}</p>
                    <p style="margin: 0 0 6px 0; color: #64748b; font-size: 13px;">${m.regards}</p>
                    <p style="margin: 0 0 14px 0; color: #0a2540; font-size: 14px; font-weight: 700;">${escapeHtml(senderName)}</p>
                    <p style="margin: 0 0 6px 0; color: #0a2540; font-size: 13px; font-weight: 700;">${m.teamLine}</p>
                    <p style="margin: 0 0 4px 0;"><a href="tel:+36205819166" style="color: #0071e3; font-size: 13px; text-decoration: none;">+36 20 581 9166</a></p>
                    <p style="margin: 0 0 4px 0;"><a href="mailto:info@evionor.hu" style="color: #0071e3; font-size: 13px; text-decoration: none;">info@evionor.hu</a></p>
                    <p style="margin: 0;"><a href="https://www.evionor.hu" style="color: #0071e3; font-size: 13px; text-decoration: none;">www.evionor.hu</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #0a2540; padding: 20px 24px; text-align: center;" bgcolor="#0a2540">
              <p style="margin: 0 0 4px 0; color: #ffffff; font-size: 12px;">${m.footerCompany}</p>
              <p style="margin: 0; color: #ffffff; font-size: 11px;">${m.footerTagline}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();


  const quoteDescriptors = getQuoteDescriptors(selectedTemplates);

  return {
    html,
    quoteDescriptors,
    quoteUrls,
    selectedProducts,
    selectedTemplateIds,
    subject: getResidentialSubject(input),
  };
}
