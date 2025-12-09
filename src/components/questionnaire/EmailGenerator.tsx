import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionnaireData, chargerTemplates, ChargerTemplate } from "@/types/questionnaire";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Copy, Mail, X } from "lucide-react";
import { toast } from "sonner";
import { additionalItemPrices, formatPrice, priceList } from "@/data/priceList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveSavedQuestionnaireResponse } from "@/integrations/evionor/client";
import { supabase } from "@/integrations/supabase/client";

interface EmailGeneratorProps {
  data: QuestionnaireData;
  autoGenerate?: boolean;
}

const additionalItems = [
  "RFID Tag",
  "Szabadon álló oszlop",
  "Fali hátlap kábeltartóval",
  "Töltőkábel (3m / 5m / 7m / 10m)",
  "Kábel akasztó",
  "Type 2-es fejtartó",
];

interface LoadManagementPackage {
  name: string;
  price: number;
  url: string;
}

// Terhelésmenedzsment csomagok töltő brandenként
const getLoadManagementPackage = (productName: string): LoadManagementPackage | null => {
  if (productName.includes("Zaptec")) {
    return {
      name: "Zaptec Sense Terhelésmenedzsment",
      price: 127000,
      url: "https://evionor.hu/collections/all/products/zaptec-sense-gen-ct-clamp-csomag-ev-mero?_pos=14&_fid=c1e909eaa&_ss=c",
    };
  }
  if (productName.includes("Easee")) {
    return {
      name: "Easee Equalizer Terhelésmenedzsment",
      price: 143000,
      url: "https://evionor.hu/collections/all/products/easee-equalizer-amp-csomag-ev-mero?_pos=9&_fid=c1e909eaa&_ss=c",
    };
  }
  if (productName.includes("Charge Amps")) {
    return {
      name: "Charge Amps Amp Guard Terhelésmenedzsment",
      price: 132000,
      url: "https://evionor.hu/collections/all/products/charge-amps-amp-guard-63a-ev-mero?_pos=10&_fid=53fe77cfa&_ss=c",
    };
  }
  return null;
};

interface InstallationPackage {
  name: string;
  price: number;
  url: string;
}

// Telepítési csomagok töltő típus alapján
const getInstallationPackage = (productName: string): InstallationPackage => {
  // 1 fázisú töltők: Amina 1, Charge Amps Halo
  if (productName.includes("AMINA 1") || productName.includes("Amina 1") || productName.includes("Charge Amps Halo")) {
    return {
      name: "Egyfázisú töltőtelepítés",
      price: 199000,
      url: "https://evionor.hu/collections/all?filter.p.product_type=Telep%C3%ADt%C3%A9s",
    };
  }
  // 3 fázisú töltők: összes többi (Zaptec Go, Zaptec Solar MID, Easee Charge Up, Charge Amps Luna)
  return {
    name: "Háromfázisú töltőtelepítés",
    price: 219000,
    url: "https://evionor.hu/collections/all/products/haromfazisu-toltotelepites-csomag?_pos=2&_fid=45b4bccd7&_ss=c",
  };
};

export const EmailGenerator = ({ data, autoGenerate = false }: EmailGeneratorProps) => {
  const [selectedTemplates, setSelectedTemplates] = useState<ChargerTemplate[]>([]);
  const [selectedAdditionals, setSelectedAdditionals] = useState<string[]>([]);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [senderName, setSenderName] = useState<string>("Horváth Gáspár");
  const [isSending, setIsSending] = useState(false);

  // Auto-select templates based on phase when autoGenerate is true
  useEffect(() => {
    if (autoGenerate && selectedTemplates.length === 0) {
      const templates: ChargerTemplate[] = [];
      if (data.phases === "1") {
        // 1 phase: amina 1, charge amps halo
        const amina = chargerTemplates.find((t) => t.id === "template2");
        const halo = chargerTemplates.find((t) => t.id === "template1");
        if (amina) templates.push(amina);
        if (halo) templates.push(halo);
      } else if (data.phases === "3") {
        // 3 phase: zaptec go, easee charge up
        const zaptec = chargerTemplates.find((t) => t.id === "template3b");
        const easee = chargerTemplates.find((t) => t.id === "template3a");
        if (zaptec) templates.push(zaptec);
        if (easee) templates.push(easee);
      }
      setSelectedTemplates(templates);
    }
  }, [autoGenerate, data.phases]);

  // Auto-generate email when templates are selected in auto mode
  useEffect(() => {
    if (autoGenerate && selectedTemplates.length > 0 && !generatedEmail) {
      setTimeout(() => {
        generateEmail();
      }, 500);
    }
  }, [autoGenerate, selectedTemplates]);

  // Termék URL mapping (webshop product pages)
  const productUrls: { [key: string]: string } = {
    "Charge Amps Halo 11kW": "https://evionor.hu/collections/all/products/charge-amps-halo-7-4kw-ev-tolto",
    "Charge Amps Luna 22kW": "https://evionor.hu/collections/all/products/charge-amps-luna-22kw-ev-tolto",
    "AMINA 1 - 7.4kW": "https://evionor.hu/collections/all/products/amina-1-evtlt?_pos=1&_fid=bb7a6be86&_ss=c",
    "Easee Charge Up 22kW": "https://evionor.hu/collections/all/products/easee-charge-up-evtlt",
    "Zaptec Go 22kW": "https://evionor.hu/collections/all/products/zaptec-go-evtlt",
    "Zaptec Solar MID": "https://evionor.hu/collections/all/products/zaptec-go-2",
  };

  // Kosárba button URLs (product pages with installation)
  const cartUrls: { [key: string]: string } = {
    "AMINA 1 - 7.4kW": "https://evionor.hu/products/amina-1-1-fazisu-tolto-telepitessel",
    "Charge Amps Halo 11kW": "https://evionor.hu/products/charge-amps-halo-7-4kw-11kw-ev-tolto-telepites-csomag",
    "Charge Amps Luna 22kW": "https://evionor.hu/products/charge-amps-luna-22kw-ev-tolto-telepites-csomag",
    "Zaptec Go 22kW": "https://evionor.hu/products/zaptec-go-22kw-ev-tolto-telepitesi-csomgaban",
    "Zaptec Solar MID": "https://evionor.hu/products/zaptec-go-22kw-ev-tolto-telepitesi-csomgaban",
    "Easee Charge Up 22kW": "https://evionor.hu/products/easee-charge-up-22kw-ev-tolto-telepitesi-csomgaban",
  };

  // Termék URL lekérése
  const getProductUrl = (productName: string): string => {
    return productUrls[productName] || "https://evionor.hu/webshop/";
  };

  // Kosárba button URL lekérése
  const getCartUrl = (productName: string): string => {
    return cartUrls[productName] || "https://evionor.hu/webshop/";
  };

  // Kép URL lekérése termék név alapján (evionor.hu CDN)
  const getChargerImageUrl = (productName: string): string => {
    // Pontos egyezések először, hogy ne keveredjenek össze
    if (productName.includes("Zaptec Solar MID")) {
      return "https://evionor.hu/cdn/shop/files/ZaptecGo2_Productimage_quater_asphaltblack.webp?v=1762325254&width=600";
    }
    if (
      productName.includes("Zaptec Go 22kW") ||
      (productName.includes("Zaptec Go") && !productName.includes("Solar"))
    ) {
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
  };

  // Ár keresés a termék névből
  const findProductPrice = (productName: string): number => {
    const normalizedSearch = productName
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace("+ load balance", "")
      .replace("+ solar load balancing", "")
      .trim();

    // Pontos egyezés keresése először (pl. "Zaptec Go 2" vs "Zaptec Go")
    let product = priceList.find((p) => {
      const normalizedProductName = p.name.toLowerCase().replace(/\s+/g, " ");
      return normalizedProductName === normalizedSearch;
    });

    // Ha nincs pontos egyezés, próbáljuk meg a részleges keresést
    if (!product) {
      product = priceList.find((p) => {
        const normalizedProductName = p.name.toLowerCase().replace(/\s+/g, " ");
        const searchWords = normalizedSearch.split(" ");
        return searchWords.every((word) => normalizedProductName.includes(word));
      });
    }

    return product?.price || 0;
  };

  // Eldönti, hogy a név cég-e vagy ember
  const isCompanyName = (name: string): boolean => {
    const companyIndicators = ["kft", "bt", "zrt", "nyrt", "ltd", "inc", "corp", "gmbh", "kkt", "ev"];
    const lowerName = name.toLowerCase();
    return companyIndicators.some((indicator) => lowerName.includes(indicator)) || name.includes(".");
  };

  // Megszólítás generálása
  const getGreeting = (name: string): string => {
    if (isCompanyName(name)) {
      return "Tisztelt Ügyfelünk!";
    }
    return `Tisztelt ${name}!`;
  };

  // Intelligens sablon ajánlás
  const recommendedTemplate = chargerTemplates.find((template) => {
    if (data.solarIntegration !== "nem") return template.id === "template4";
    if (data.phases === "3") return template.id === "template3a";
    if (data.needsApp) return template.id === "template1";
    return template.id === "template2";
  });

  // Töltő kiválasztása/törlése
  const toggleTemplate = (template: ChargerTemplate) => {
    const exists = selectedTemplates.find((t) => t.id === template.id);
    if (exists) {
      setSelectedTemplates(selectedTemplates.filter((t) => t.id !== template.id));
    } else {
      setSelectedTemplates([...selectedTemplates, template]);
    }
  };

  // Jellemzők generálása
  const getCharacteristics = (productName: string): string => {
    console.log("getCharacteristics called with:", productName);

    if (productName.includes("Easee Charge Up")) {
      return `
        <li style="font-size: 14px;">Fázisok száma: 1/3</li>
        <li style="font-size: 14px;">Tápellátás: 6–32 A</li>
        <li style="font-size: 14px;">Földzárlat védelem: Beépített Type A áramvédő kapcsoló (30 mA) + 6 mA DC-védelem (RDC-PD)</li>
        <li style="font-size: 14px;">Üzemi hőmérséklet: -30°C és +50°C között</li>
        <li style="font-size: 14px;">Hitelesítés: RFID/NFC, mobilalkalmazás</li>
        <li style="font-size: 14px;">Kommunikációs protokollok: Bluetooth Low Energy, WiFi 2,4 GHz, RFID/NFC, 4G/LTE (eSIM), OCPP 1.6J</li>
        <li style="font-size: 14px;">Funkciók: Terhelésmenedzsment kompatibilis (max. 3 töltőig), céges számlázási riportok, lágy indítás, okos otthon integráció</li>
        <li style="font-size: 14px;">Szoftverfrissítések: Automatikus frissítések</li>
        <li style="font-size: 14px;">Védelmi osztály: IP54 (időjárás álló)</li>
        <li style="font-size: 14px;">Garancia: 5 év</li>
      `;
    }
    if (productName.includes("Zaptec Solar MID")) {
      return `
        <li style="font-size: 14px;">Fázisok száma: 1/3</li>
        <li style="font-size: 14px;">Tápellátás: 6–32 A</li>
        <li style="font-size: 14px;">Földzárlat védelem: Beépített elektronikus DC-szűrő 6 mA</li>
        <li style="font-size: 14px;">Üzemi hőmérséklet: -30°C és +40°C között</li>
        <li style="font-size: 14px;">Hitelesítés: RFID/NFC, mobilalkalmazás</li>
        <li style="font-size: 14px;">Kommunikációs protokollok: Bluetooth Low Energy, RFID/NFC, WiFi 2,4 GHz, 4G LTE-M</li>
        <li style="font-size: 14px;">Funkciók: Terhelésmenedzsment, napelemes integráció (Solar load balancing), felhőalapú szolgáltatások, energiamérés, lágy indítás, energia szabályozás, okos otthon integráció</li>
        <li style="font-size: 14px;">Szoftverfrissítések: Automatikus letöltés</li>
        <li style="font-size: 14px;">Védelmi osztály: IP54</li>
        <li style="font-size: 14px;">Garancia: 5 év</li>
      `;
    }
    if (
      productName.includes("Zaptec Go 22kW") ||
      (productName.includes("Zaptec Go") && !productName.includes("Solar"))
    ) {
      return `
        <li style="font-size: 14px;">Fázisok száma: 1/3</li>
        <li style="font-size: 14px;">Tápellátás: 6–32 A</li>
        <li style="font-size: 14px;">Földzárlat védelem: Beépített elektronikus DC-szűrő 6 mA</li>
        <li style="font-size: 14px;">Üzemi hőmérséklet: -30°C és +40°C között</li>
        <li style="font-size: 14px;">Hitelesítés: RFID/NFC, mobilalkalmazás</li>
        <li style="font-size: 14px;">Kommunikációs protokollok: Bluetooth Low Energy, RFID/NFC, WiFi 2,4 GHz, 4G LTE-M</li>
        <li style="font-size: 14px;">Funkciók: Terhelésmenedzsment kompatibilis, céges számlázási riportok, lágy indítás, okos otthon integráció</li>
        <li style="font-size: 14px;">Szoftverfrissítések: Automatikus letöltés</li>
        <li style="font-size: 14px;">Védelmi osztály: IP54 (időjárás álló)</li>
        <li style="font-size: 14px;">Garancia: 5 év</li>
      `;
    }
    if (productName.includes("Amina 1") || productName.includes("AMINA 1")) {
      return `
        <li style="font-size: 14px;">Fázisok száma: 1</li>
        <li style="font-size: 14px;">Tápellátás: 230 V AC, 6–32 A</li>
        <li style="font-size: 14px;">Földzárlat védelem: Beépített RDC-DD 6 mA (IEC 62955)</li>
        <li style="font-size: 14px;">Üzemi hőmérséklet: -30°C és +40°C között</li>
        <li style="font-size: 14px;">Hitelesítés: Nem támogatott</li>
        <li style="font-size: 14px;">Kommunikációs protokollok: Nem támogatott</li>
        <li style="font-size: 14px;">Funkciók: Plug & Charge helyi töltés, terhelésmenedzsment nélkül</li>
        <li style="font-size: 14px;">Szoftverfrissítések: Nem támogatott</li>
        <li style="font-size: 14px;">Védelmi osztály: IP54</li>
        <li style="font-size: 14px;">Garancia: 5 év</li>
      `;
    }
    if (productName.includes("Charge Amps Halo")) {
      return `
        <li style="font-size: 14px;">Fázisok száma: 1/3</li>
        <li style="font-size: 14px;">Tápellátás: 230 V, 16 A (1-fázis) / 400 V, 16 A (3-fázis)</li>
        <li style="font-size: 14px;">Földzárlat védelem: Beépített DC-védelem, Type A földzárlat-védő szükséges</li>
        <li style="font-size: 14px;">Üzemi hőmérséklet: -30°C és +45°C között</li>
        <li style="font-size: 14px;">Hitelesítés: RFID</li>
        <li style="font-size: 14px;">Kommunikációs protokollok: WiFi, RFID</li>
        <li style="font-size: 14px;">Funkciók: RFID hozzáférés-szabályozás, extra konnektor (pl. e-bike), LED jelzőfények</li>
        <li style="font-size: 14px;">Szoftverfrissítések: Automatikus frissítések</li>
        <li style="font-size: 14px;">Védelmi osztály: Töltőtest IP66, csatlakozó és konnektor IP44</li>
        <li style="font-size: 14px;">Garancia: 5 év</li>
      `;
    }
    if (productName.includes("Charge Amps Luna")) {
      return `
        <li style="font-size: 14px;">Fázisok száma: 1/3</li>
        <li style="font-size: 14px;">Tápellátás: 6–32 A</li>
        <li style="font-size: 14px;">Földzárlat védelem: Beépített Type B áramvédő (AC 30 mA, DC 6 mA)</li>
        <li style="font-size: 14px;">Üzemi hőmérséklet: -35°C és +45°C között</li>
        <li style="font-size: 14px;">Hitelesítés: RFID</li>
        <li style="font-size: 14px;">Kommunikációs protokollok: WiFi, 4G LTE (eSIM), Bluetooth Low Energy 5.0/5.3, RFID/NFC, OCPP 1.6J</li>
        <li style="font-size: 14px;">Funkciók: Terhelésmenedzsment kompatibilis, céges számlázási riportok, okos otthon integráció</li>
        <li style="font-size: 14px;">Szoftverfrissítések: Automatikus frissítések</li>
        <li style="font-size: 14px;">Védelmi osztály: IP54, ütésállóság IK10</li>
        <li style="font-size: 14px;">Garancia: 5 év</li>
      `;
    }
    return "";
  };

  const generateEmail = async () => {
    if (selectedTemplates.length === 0) return;

    // Mentés az Evionorba
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const responseData = {
        original_response_id: null,
        contact_name: data.contactName,
        email: data.email,
        phone_number: data.phoneNumber,
        car_brand: data.carBrand,
        car_model: data.carModel,
        custom_car: data.customCar || null,
        zip_code: data.zipCode || "N/A",
        city: data.city || "Nincs megadva",
        phases: data.phases,
        amperage: data.amperage,
        install_location: data.installLocation,
        building_type: data.buildingType || null,
        needs_installation: data.needsInstallation,
        needs_electrical_planning: data.needsElectricalPlanning,
        indoor_outdoor: data.indoorOutdoor,
        mounting_surface: data.mountingSurface || null,
        needs_pole: data.needsPole,
        distance_from_box: data.distanceFromBox,
        space_in_box: data.spaceInBox,
        groundwork_wall_penetration: data.groundworkWallPenetration || null,
        other_comments: data.otherComments || null,
        solar_integration: data.solarIntegration,
        load_management: data.loadManagement,
        built_in_cable: data.builtInCable,
        needs_app: data.needsApp,
        infrastructure_development: data.infrastructureDevelopment,
        infrastructure_details: data.infrastructureDetails || null,
        overvoltage_protection: data.overvoltageProtection,
        network_expansion: data.networkExpansion,
        expansion_phase: data.expansionPhase || null,
        expansion_amperage: data.expansionAmperage || null,
        created_by: user?.id || null,
      };

      await saveSavedQuestionnaireResponse(responseData);

      toast.success("Sikeres mentés az EVIONOR-ba", {
        description: "A kérdőív adatok mentésre kerültek és az email elkészült.",
      });
    } catch (error) {
      console.error("Error saving to EVIONOR:", error);
      toast.error("Mentési hiba", {
        description: "Nem sikerült menteni az adatokat az EVIONOR-ba, de az email elkészült.",
      });
    }

    const additionalTotal = selectedAdditionals.reduce((sum, item) => {
      return sum + (additionalItemPrices[item] || 0);
    }, 0);

    const email = `
<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EV-Töltő Beszerzési Ajánlat</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 32px auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0071e3 0%, #005bb5 100%); padding: 12px 20px; text-align: center;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                <tr>
                    <td align="center">
                        <table cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 20px; display: inline-block;" bgcolor="#ffffff">
                            <tr>
                                <td style="padding: 8px 20px; background-color: #ffffff; border-radius: 20px;" bgcolor="#ffffff">
                                    <a href="https://evionor.hu" target="_blank" style="display: block; text-decoration: none;">
                                        <img src="https://evionor.hu/cdn/shop/files/evionor-logo.png?v=1761743181" alt="Evionor Logo" width="220" style="height: auto; display: block; border: 0; background-color: #ffffff; max-width: 100%;" />
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 600; letter-spacing: -0.5px;">EV-Töltő Beszerzési Ajánlat</h1>
            <p style="margin: 6px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 13px;">Személyre szabott megoldás az Ön igényeihez</p>
        </div>

        <!-- Content -->
        <div style="padding: 20px 14px;">
            
            <!-- Intro -->
            <p style="margin: 0 0 24px 0; color: #374151; font-size: 14px; line-height: 1.6;">${getGreeting(data.contactName)}</p>
            <p style="margin: 0 0 32px 0; color: #374151; font-size: 14px; line-height: 1.6;">Köszönjük érdeklődését! Az Ön által megadott adatok alapján az alábbi ajánlatot készítettük.</p>

            <!-- Client Data Section -->
            <div style="margin-bottom: 20px; background-color: #f3f4f6; padding: 10px; border-radius: 12px; border: 2px solid #e5e7eb;">
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 17px; font-weight: 600; border-bottom: 2px solid #d1d5db; padding-bottom: 10px;">Ügyfél adatok</h2>
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td style="color: #6b7280; font-size: 12px; padding: 8px 0 4px 0;">Ügyfél</td>
                    </tr>
                    <tr>
                        <td style="color: #111827; font-size: 14px; font-weight: 500; padding: 0 0 10px 0; word-wrap: break-word; word-break: break-word;">${data.contactName}</td>
                    </tr>
                    <tr>
                        <td style="color: #6b7280; font-size: 12px; padding: 8px 0 4px 0;">E-mail</td>
                    </tr>
                    <tr>
                        <td style="color: #111827; font-size: 14px; font-weight: 500; padding: 0 0 10px 0; word-wrap: break-word; word-break: break-word;">${data.email}</td>
                    </tr>
                    <tr>
                        <td style="color: #6b7280; font-size: 12px; padding: 8px 0 4px 0;">Telefonszám</td>
                    </tr>
                    <tr>
                        <td style="color: #111827; font-size: 14px; font-weight: 500; padding: 0 0 10px 0; word-wrap: break-word; word-break: break-word;">${data.phoneNumber}</td>
                    </tr>
                    <tr>
                        <td style="color: #6b7280; font-size: 12px; padding: 8px 0 4px 0;">Jármű</td>
                    </tr>
                    <tr>
                        <td style="color: #111827; font-size: 14px; font-weight: 500; padding: 0 0 10px 0; word-wrap: break-word; word-break: break-word;">${data.customCar ? data.customCar : `${data.carBrand} ${data.carModel}`}</td>
                    </tr>
                    ${
                      data.city && data.zipCode
                        ? `
                    <tr>
                        <td style="color: #6b7280; font-size: 12px; padding: 8px 0 4px 0;">Helyszín</td>
                    </tr>
                    <tr>
                        <td style="color: #111827; font-size: 14px; font-weight: 500; padding: 0 0 10px 0; word-wrap: break-word; word-break: break-word;">${data.city}, ${data.zipCode}</td>
                    </tr>
                    `
                        : ""
                    }
                    <tr>
                        <td style="color: #6b7280; font-size: 12px; padding: 8px 0 4px 0;">Épület típus</td>
                    </tr>
                    <tr>
                        <td style="color: #111827; font-size: 14px; font-weight: 500; padding: 0 0 10px 0; word-wrap: break-word; word-break: break-word;">${data.buildingType.replace("_", " ")}</td>
                    </tr>
                    <tr>
                        <td style="color: #6b7280; font-size: 12px; padding: 8px 0 4px 0;">Elektromos rendszer</td>
                    </tr>
                    <tr>
                        <td style="color: #111827; font-size: 14px; font-weight: 500; padding: 0 0 10px 0; word-wrap: break-word; word-break: break-word;">${data.phases} fázis, ${data.amperage} A</td>
                    </tr>
                </table>
            </div>

            <!-- Charger Sections - OSZLOP SZERŰEN -->
            ${selectedTemplates
              .map((template, templateIndex) => {
                const product = template.products[0];
                const chargerPrice = findProductPrice(product);
                const productUrl = getProductUrl(product);
                const loadManagementPackage = data.loadManagement ? getLoadManagementPackage(product) : null;
                const installationPackage = getInstallationPackage(product);
                const installationPrice = data.needsInstallation ? installationPackage.price : 0;

                return `
            ${templateIndex > 0 ? '<div style="margin: 24px 0; height: 2px; background: linear-gradient(90deg, transparent, #d1d5db 20%, #d1d5db 80%, transparent); opacity: 0.5;"></div>' : ""}
            
            <!-- Töltő ${templateIndex + 1}: ${template.name} -->
            <div style="margin-bottom: 24px; background-color: #f3f4f6; padding: 10px; border-radius: 12px; border: 2px solid #e5e7eb;">
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 17px; font-weight: 600; border-bottom: 2px solid #d1d5db; padding-bottom: 10px;">Ajánlott töltő ${templateIndex + 1}</h2>
                <p style="margin: 0 0 16px 0; color: #0071e3; font-size: 15px; font-weight: 600; word-wrap: break-word;">${template.name}</p>
                
                <!-- Töltő kép -->
                ${
                  getChargerImageUrl(product)
                    ? `
                <div style="text-align: center; margin-bottom: 16px; padding: 8px; background-color: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <a href="${productUrl}" style="display: inline-block; text-decoration: none;">
                        <img src="${getChargerImageUrl(product)}" alt="${product}" style="max-width: 260px; width: 100%; height: auto; display: block; margin: 0 auto;" />
                    </a>
                </div>
                `
                    : ""
                }
                
                <div style="padding: 8px; background-color: white; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="padding-bottom: 6px;"><a href="${productUrl}" style="color: #111827; font-size: 15px; font-weight: 600; text-decoration: none; border-bottom: 2px solid #0071e3; word-wrap: break-word; word-break: break-word; display: inline-block;">${product}</a></td>
                        </tr>
                        <tr>
                            <td style="color: #0071e3; font-size: 17px; font-weight: 700;">${formatPrice(chargerPrice)}</td>
                        </tr>
                    </table>
                </div>
                
                <div style="margin-top: 16px; padding: 8px; background-color: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 10px 0; color: #374151; font-size: 13px; font-weight: 600;">Jellemzők:</p>
                    <ul style="margin: 0; padding: 0 0 0 18px; color: #374151; font-size: 13px; line-height: 1.7; word-wrap: break-word;">
                        ${getCharacteristics(product)}
                    </ul>
                </div>

                ${
                  loadManagementPackage || data.needsInstallation
                    ? `
                <!-- Opciós tételek Section -->
                <div style="margin-top: 16px; background-color: white; padding: 8px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <h3 style="margin: 0 0 12px 0; color: #111827; font-size: 15px; font-weight: 600;">Opciós tételek</h3>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        ${
                          loadManagementPackage
                            ? `
                        <tr>
                            <td style="padding: 6px 0; width: 65%;"><a href="${loadManagementPackage.url}" target="_blank" style="color: #111827; font-size: 13px; font-weight: 500; text-decoration: none; border-bottom: 2px solid #0071e3; word-wrap: break-word; word-break: break-word; display: inline-block;">${loadManagementPackage.name}</a></td>
                            <td style="padding: 6px 0 6px 10px; color: #0071e3; font-size: 15px; font-weight: 700; text-align: right;">${formatPrice(loadManagementPackage.price)}</td>
                        </tr>
                        `
                            : ""
                        }
                        ${
                          data.needsInstallation
                            ? `
                        <tr>
                            <td style="padding: 6px 0; vertical-align: top; width: 65%;">
                                <a href="${installationPackage.url}" target="_blank" style="color: #111827; font-size: 13px; font-weight: 500; text-decoration: none; border-bottom: 2px solid #0071e3; word-wrap: break-word; word-break: break-word; display: inline-block;">${installationPackage.name}</a>
                            </td>
                            <td style="padding: 6px 0 6px 10px; color: #0071e3; font-size: 15px; font-weight: 700; text-align: right; vertical-align: top;">${formatPrice(installationPrice)}</td>
                        </tr>
                        `
                            : ""
                        }
                    </table>
                    ${
                      data.needsInstallation
                        ? `
                    <div style="text-align: center; margin-top: 12px;">
                        <a href="${getCartUrl(product)}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 8px 20px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">Telepítéssel kérem!</a>
                    </div>
                    `
                        : ""
                    }
                </div>
                `
                    : ""
                }

                <!-- Price Summary for this charger -->
                <div style="margin-top: 20px; background-color: white; padding: 8px; border-radius: 8px; border: 2px solid #0071e3;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr style="border-bottom: 2px solid #0071e3;">
                            <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 700;">Töltő ára:</td>
                            <td style="padding: 10px 0 10px 10px; color: #0071e3; font-size: 17px; font-weight: 700; text-align: right;">${formatPrice(chargerPrice)}</td>
                        </tr>
                    </table>
                    <div style="text-align: center; margin-top: 16px;">
                        <a href="${getProductUrl(product)}" style="display: inline-block; background: linear-gradient(135deg, #0071e3 0%, #005bb5 100%); color: #ffffff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; box-shadow: 0 4px 12px rgba(0, 113, 227, 0.3);">Megnézem</a>
                    </div>
                </div>
            </div>
              `;
              })
              .join("")}

            ${
              selectedAdditionals.length > 0
                ? `
            <!-- Accessories Section - CSAK EGYSZER -->
            <div style="margin-bottom: 20px; background-color: #f3f4f6; padding: 10px; border-radius: 12px; border: 2px solid #e5e7eb;">
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 17px; font-weight: 600; border-bottom: 2px solid #d1d5db; padding-bottom: 10px;">Kiegészítők (opcionális)</h2>
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    ${selectedAdditionals
                      .map(
                        (item) => `
                    <tr>
                        <td style="padding: 6px 0; color: #374151; font-size: 13px; width: 65%;">${item}</td>
                        <td style="padding: 6px 0 6px 10px; color: #111827; font-size: 13px; font-weight: 500; text-align: right;">${formatPrice(additionalItemPrices[item] || 0)}</td>
                    </tr>
                    `,
                      )
                      .join("")}
                </table>
            </div>
            `
                : ""
            }

            ${
              data.needsInstallation
                ? `
            ${
              data.needsPole ||
              data.needsElectricalPlanning ||
              data.overvoltageProtection ||
              data.infrastructureDevelopment ||
              data.networkExpansion
                ? `
            <!-- Additional Installation Requirements -->
            <div style="margin-bottom: 20px; background-color: #f3f4f6; padding: 10px; border-radius: 12px; border: 2px solid #e5e7eb;">
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 17px; font-weight: 600; border-bottom: 2px solid #d1d5db; padding-bottom: 10px;">További telepítési követelmények</h2>
                <div style="padding: 8px; background-color: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <ul style="margin: 0 0 10px 0; padding: 0 0 0 18px; color: #374151; font-size: 13px; line-height: 1.7; word-wrap: break-word;">
                        ${data.needsPole ? "<li>Oszlop szükséges</li>" : ""}
                        ${data.needsElectricalPlanning ? "<li>Villamos tervezés szükséges</li>" : ""}
                        ${data.overvoltageProtection ? "<li>Túlfeszültség védelem</li>" : ""}
                        ${data.infrastructureDevelopment && data.infrastructureDetails ? `<li>Infrastruktúra fejlesztés: ${data.infrastructureDetails}</li>` : ""}
                        ${data.networkExpansion ? `<li>Hálózatbővítés: ${data.expansionPhase} fázis, ${data.expansionAmperage} A</li>` : ""}
                    </ul>
                    <p style="margin: 0; padding: 10px; background-color: #eff6ff; border-left: 3px solid #3b82f6; color: #1e3a8a; font-size: 12px; line-height: 1.6; word-wrap: break-word;">
                        <strong>Megjegyzés:</strong> A sztenderd telepítési tartalmon túli munkavégzésről a helyszínen készül lista. Az árlistája a <a href="https://www.evionor.hu" style="color: #0071e3; text-decoration: underline;">honlapunkon elérhető</a>.
                    </p>
                </div>
            </div>
            `
                : ""
            }

            ${
              data.groundworkWallPenetration
                ? `
            <div style="margin-bottom: 20px; padding: 8px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0 0 6px 0; color: #92400e; font-size: 13px; font-weight: 600;">Földmunka/Faláttörés:</p>
                <p style="margin: 0; color: #78350f; font-size: 13px; line-height: 1.6; word-wrap: break-word;">${data.groundworkWallPenetration}</p>
            </div>
            `
                : ""
            }

            <!-- Standard Installation Description -->
            <div style="margin-bottom: 20px; background-color: #f3f4f6; padding: 10px; border-radius: 12px; border: 2px solid #e5e7eb;">
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 17px; font-weight: 600; border-bottom: 2px solid #d1d5db; padding-bottom: 10px;">Sztenderd telepítés</h2>
                <div style="padding: 8px; background-color: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 10px 0; color: #374151; font-size: 13px; line-height: 1.7;">
                        A telepítés magában foglalja:
                    </p>
                    <ul style="margin: 0; padding: 0 0 0 18px; color: #374151; font-size: 13px; line-height: 1.7;">
                        <li>Áramvédő kapcsoló (Legrand) beépítése meglévő szekrénybe</li>
                        <li>Kismegszakító (Legrand) beszerelése meglévő szekrénybe</li>
                        <li>Kültéri vagy beltéri kábelezés kialakítása (5m)</li>
                        <li>Vésés, csövezés és faláttörési munkálatok szükség szerint</li>
                        <li>Töltőállomás szakszerű felszerelése</li>
                        <li>Beüzemelés és átadás</li>
                    </ul>
                </div>
            </div>
            `
                : ""
            }

            <!-- Process Section -->
            <div style="margin-bottom: 32px; background-color: #f9fafb; padding: 10px; border-radius: 12px;">
                <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 17px; font-weight: 600;">Folyamat</h2>
                <ol style="margin: 0; padding: 0 0 0 18px; color: #374151; font-size: 13px; line-height: 1.8;">
                    ${
                      data.needsInstallation
                        ? `
                    <li>Webshop megrendelés leadása</li>
                    <li>Telepítés ütemezése</li>
                    <li>Szakszerű kivitelezés 10 munkanapon belül</li>
                    `
                        : `
                    <li>Webshop megrendelés leadása</li>
                    <li>Szállítás 5 munkanapon belül</li>
                    `
                    }
                </ol>
            </div>

            ${
              data.otherComments
                ? `
            <!-- Other Comments -->
            <div style="margin-bottom: 32px; padding: 8px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <h2 style="margin: 0 0 10px 0; color: #1e40af; font-size: 15px; font-weight: 600;">Egyéb megjegyzések</h2>
                <p style="margin: 0; color: #1e3a8a; font-size: 13px; line-height: 1.6; word-wrap: break-word;">${data.otherComments}</p>
            </div>
            `
                : ""
            }

            <!-- Closing -->
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 20px 0; color: #374151; font-size: 14px; line-height: 1.6;">További kérdés esetén állunk rendelkezésére!</p>
                <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 13px;">Üdvözlettel,</p>
                <p style="margin: 0 0 14px 0; color: #111827; font-size: 13px; font-weight: 600;">${senderName}</p>
                <p style="margin: 0 0 4px 0; color: #111827; font-size: 13px; font-weight: 600;">Az EVIONOR Csapata</p>
                <p style="margin: 0 0 4px 0; color: #0071e3; font-size: 13px;">+36 20 581 9166</p>
                <p style="margin: 0 0 4px 0; color: #0071e3; font-size: 13px;"><a href="mailto:info@evionor.hu" style="color: #0071e3; text-decoration: none;">info@evionor.hu</a></p>
                <p style="margin: 0; color: #0071e3; font-size: 13px;"><a href="https://www.evionor.hu" style="color: #0071e3; text-decoration: none;">www.evionor.hu</a></p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 10px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">EVIONOR Magyarország 2025 ©</p>
        </div>
    </div>
</body>
</html>
    `.trim();

    setGeneratedEmail(email);
    setEmailSubject(`Elektromos autó töltő ajánlat telepítéssel - ${data.contactName} - Evionor`);
    toast.success("Email sikeresen generálva!");
  };

  const copyToClipboard = async () => {
    try {
      const iframe = document.querySelector('iframe[title="Email előnézet"]') as HTMLIFrameElement;
      if (iframe?.contentWindow) {
        const iframeDocument = iframe.contentWindow.document;
        const bodyContent = iframeDocument.body;

        if (bodyContent) {
          const range = iframeDocument.createRange();
          range.selectNodeContents(bodyContent);

          const selection = iframe.contentWindow.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);

            try {
              await navigator.clipboard.write([
                new ClipboardItem({
                  "text/html": new Blob([bodyContent.innerHTML], { type: "text/html" }),
                  "text/plain": new Blob([bodyContent.innerText], { type: "text/plain" }),
                }),
              ]);
              toast.success("Email kijelölve és vágólapra másolva!");
            } catch (clipboardError) {
              iframe.contentWindow.document.execCommand("copy");
              toast.success("Email kijelölve és vágólapra másolva!");
            }
          }
        }
      }
    } catch (error) {
      console.error("Másolási hiba:", error);
      toast.error("Hiba történt a másolás során. Próbálja újra!");
    }
  };

  const sendEmail = async () => {
    if (!generatedEmail || !data.email) {
      toast.error("Hiba: Az email generálása vagy a címzett email címe hiányzik.");
      return;
    }

    setIsSending(true);

    try {
      const { data: emailData, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: data.email,
          subject: emailSubject || `EVIONOR - Töltő ajánlat ${data.contactName} részére`,
          html: generatedEmail,
          from: `${senderName} - EVIONOR <hello@evionor.hu>`,
        },
      });

      if (error) throw error;

      if (emailData?.success) {
        toast.success(`Email sikeresen elküldve ${data.email} címre!`);
      } else {
        throw new Error(emailData?.error || "Ismeretlen hiba");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Email küldési hiba. Ellenőrizd a RESEND_API_KEY beállítását.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Email generátor</CardTitle>
              <CardDescription className="mt-1">Válasszon töltőket és kiegészítőket az ajánlathoz</CardDescription>
            </div>
            {generatedEmail && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await navigator.clipboard.writeText(emailSubject);
                    toast.success("Email tárgy vágólapra másolva!");
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Tárgy másolása
                </Button>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="mr-2 h-4 w-4" />
                  Email másolása
                </Button>
                <Button size="sm" onClick={sendEmail} disabled={isSending || !generatedEmail}>
                  <Mail className="mr-2 h-4 w-4" />
                  {isSending ? "Küldés..." : "Email küldése"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Ajánlatküldő neve */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Ajánlatküldő neve</h3>
            <Select value={senderName} onValueChange={setSenderName}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Válasszon ajánlatküldőt" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="Horváth Gáspár">Horváth Gáspár</SelectItem>
                <SelectItem value="Kovács Attila Tibor - EV-töltés szakértő">
                  Kovács Attila Tibor - EV-töltés szakértő
                </SelectItem>
                <SelectItem value="Kocsis Zsombor - EV-töltés szakértő">Kocsis Zsombor - EV-töltés szakértő</SelectItem>
                <SelectItem value="Nagy István">Nagy István</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Sablon választás - TÖBB TÖLTŐ */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Válasszon töltőket (több is kiválasztható)</h3>
            {recommendedTemplate && (
              <div className="mb-3 p-3 bg-secondary/20 rounded-lg border border-secondary">
                <p className="text-sm font-medium text-foreground">⭐ Ajánlott: {recommendedTemplate.name}</p>
              </div>
            )}

            {/* Kiválasztott töltők */}
            {selectedTemplates.length > 0 && (
              <div className="mb-3 p-3 bg-primary/10 rounded-lg border border-primary">
                <p className="text-sm font-medium text-foreground mb-2">
                  Kiválasztott töltők ({selectedTemplates.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center gap-2 bg-primary/20 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{template.name}</span>
                      <button
                        onClick={() => toggleTemplate(template)}
                        className="hover:bg-primary/30 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {chargerTemplates.map((template) => {
                const isSelected = selectedTemplates.find((t) => t.id === template.id);
                return (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => toggleTemplate(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{template.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{template.products.join(", ")}</p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Kiegészítők */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Kiegészítő javaslatok</h3>
            <div className="space-y-3">
              {additionalItems.map((item) => (
                <div key={item} className="flex items-center space-x-2">
                  <Checkbox
                    id={item}
                    checked={selectedAdditionals.includes(item)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedAdditionals([...selectedAdditionals, item]);
                      } else {
                        setSelectedAdditionals(selectedAdditionals.filter((i) => i !== item));
                      }
                    }}
                  />
                  <Label htmlFor={item} className="cursor-pointer">
                    {item}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Generate gomb */}
          <Button onClick={generateEmail} disabled={selectedTemplates.length === 0} size="lg" className="w-full">
            <Mail className="mr-2 h-4 w-4" />
            Email generálása
          </Button>
        </CardContent>
      </Card>

      {/* Email tárgy */}
      {emailSubject && (
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
            <CardTitle className="text-xl">Email tárgy</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <p className="text-sm font-medium flex-1">{emailSubject}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await navigator.clipboard.writeText(emailSubject);
                  toast.success("Email tárgy vágólapra másolva!");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generált email */}
      {generatedEmail && (
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-secondary/5 to-primary/5 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Generált email előnézet</CardTitle>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="mr-2 h-4 w-4" />
                Email másolása
              </Button>
            </div>
            <CardDescription className="mt-2">
              Az alábbi előnézet mutatja, hogy néz majd ki az email. Az "Email másolása" gombbal kijelölöd és vágólapra
              másolod a teljes emailt, amit be tudsz illeszteni Gmail-be vagy bármilyen email kliensbe.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <iframe
              srcDoc={generatedEmail}
              className="w-full border rounded-lg"
              style={{ minHeight: "800px" }}
              title="Email előnézet"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
