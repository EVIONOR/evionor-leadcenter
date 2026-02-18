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
import { generateQuotePdf } from "@/lib/generateQuotePdf";
import { useEVData } from "@/hooks/useEVData";

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
  const { getOnboardChargerKw } = useEVData();
  const onboardChargerKw = data.carBrand && data.carModel ? getOnboardChargerKw(data.carBrand, data.carModel) : undefined;
  const carDisplayText = data.customCar ? data.customCar : `${data.carBrand} ${data.carModel}${onboardChargerKw ? ` (${onboardChargerKw}kW fedélzeti töltő)` : ''}`;
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

  // Eredeti ár keresés (akciós termékekhez)
  const findOriginalPrice = (productName: string): number | null => {
    const normalizedSearch = productName
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace("+ load balance", "")
      .replace("+ solar load balancing", "")
      .trim();

    let product = priceList.find((p) => {
      const normalizedProductName = p.name.toLowerCase().replace(/\s+/g, " ");
      return normalizedProductName === normalizedSearch;
    });

    if (!product) {
      product = priceList.find((p) => {
        const normalizedProductName = p.name.toLowerCase().replace(/\s+/g, " ");
        const searchWords = normalizedSearch.split(" ");
        return searchWords.every((word) => normalizedProductName.includes(word));
      });
    }

    return product?.originalPrice || null;
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

    // Generate and upload PDF quotes for each charger
    const quoteUrls: Record<string, string> = {};
    for (const template of selectedTemplates) {
      const product = template.products[0];
      const chargerPrice = findProductPrice(product);
      const productUrl = getProductUrl(product);
      
      try {
        console.log("Generating PDF for:", product, "price:", chargerPrice);
        const pdfBlob = await generateQuotePdf({
          customerName: data.contactName,
          customerEmail: data.email,
          customerPhone: data.phoneNumber,
          customerCity: data.city,
          customerZip: data.zipCode,
          items: [{ name: product, quantity: 1, grossPrice: chargerPrice }],
          productUrl,
        });
        console.log("PDF blob generated, size:", pdfBlob.size);

        const fileName = `ajanlat-${data.contactName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-${product.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-${Date.now()}.pdf`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("quotes")
          .upload(fileName, pdfBlob, { contentType: "application/pdf", upsert: true });

        if (uploadError) {
          console.error("PDF upload error:", uploadError);
          toast.error(`PDF feltöltési hiba: ${product}`, { description: uploadError.message });
        } else {
          const { data: urlData } = supabase.storage.from("quotes").getPublicUrl(fileName);
          quoteUrls[product] = urlData.publicUrl;
          console.log("PDF uploaded successfully:", quoteUrls[product]);
        }
      } catch (err: any) {
        console.error("PDF generation error:", err);
        toast.error(`PDF generálási hiba: ${product}`, { description: err?.message || "Ismeretlen hiba" });
      }
    }

    const email = `
<!DOCTYPE html>
<html lang="hu" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
    <title>EV-Töltő Beszerzési Ajánlat</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <style>
        table { border-collapse: collapse; }
        td { font-family: Arial, sans-serif; }
    </style>
    <![endif]-->
    <style>
        @media only screen and (max-width: 620px) {
            .email-container { width: 100% !important; margin: 0 auto !important; }
            .fluid { max-width: 100% !important; height: auto !important; }
            .stack-column { display: block !important; width: 100% !important; }
            .content-padding { padding: 20px 16px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #f0f2f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    
    <!-- Preheader (hidden inbox preview text) -->
    <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all;">
        Személyre szabott EV-töltő ajánlat az Ön igényei alapján – ${data.contactName}
    </div>

    <!-- Email wrapper table -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f2f5;">
        <tr>
            <td align="center" style="padding: 32px 12px;">

                <!-- Email container -->
                <table role="presentation" class="email-container" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">

                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0a2540 0%, #1a3a5c 50%, #0071e3 100%); padding: 28px 24px 24px; text-align: center;" bgcolor="#0a2540">
                            <!-- Logo with fallback -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                                <tr>
                                    <td align="center">
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 14px;" bgcolor="#ffffff">
                                            <tr>
                                                <td style="padding: 10px 24px; background-color: #ffffff; border-radius: 14px;" bgcolor="#ffffff">
                                                    <a href="https://evionor.hu" target="_blank" style="display: block; text-decoration: none;">
                                                        <img src="https://evionor.hu/cdn/shop/files/evionor-logo.png?v=1761743181" alt="EVIONOR" width="200" style="height: auto; display: block; border: 0; background-color: #ffffff; max-width: 100%; font-family: Arial, sans-serif; font-size: 24px; font-weight: 700; color: #0a2540;" />
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            <!-- Title -->
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; line-height: 1.3;">EV-Töltő Beszerzési Ajánlat</h1>
                            <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.85); font-size: 14px; font-weight: 400;">Személyre szabott megoldás az Ön igényeihez</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td class="content-padding" style="padding: 28px 24px;">
            
                            <!-- Intro -->
                            <p style="margin: 0 0 16px 0; color: #1a1a2e; font-size: 15px; line-height: 1.6; font-weight: 500;">${getGreeting(data.contactName)}</p>
                            <p style="margin: 0 0 32px 0; color: #4a5568; font-size: 14px; line-height: 1.7;">Köszönjük érdeklődését! Az Ön által megadott adatok alapján az alábbi ajánlatot készítettük.</p>

                            <!-- Client Data Section -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
                                <tr>
                                    <td style="padding: 16px 16px 6px 16px; border-bottom: 2px solid #e2e8f0;">
                                        <h2 style="margin: 0; color: #0a2540; font-size: 16px; font-weight: 700; letter-spacing: -0.3px;">Ügyfél adatok</h2>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 16px 16px 16px;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td style="color: #64748b; font-size: 11px; padding: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Ügyfél</td>
                    </tr>
                    <tr>
                        <td style="color: #0a2540; font-size: 14px; font-weight: 600; padding: 0 0 12px 0; word-wrap: break-word; word-break: break-word;">${data.contactName}</td>
                    </tr>
                    <tr>
                        <td style="color: #64748b; font-size: 11px; padding: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">E-mail</td>
                    </tr>
                    <tr>
                        <td style="color: #0a2540; font-size: 14px; font-weight: 500; padding: 0 0 12px 0; word-wrap: break-word; word-break: break-word;">${data.email}</td>
                    </tr>
                    <tr>
                        <td style="color: #64748b; font-size: 11px; padding: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Telefonszám</td>
                    </tr>
                    <tr>
                        <td style="color: #0a2540; font-size: 14px; font-weight: 500; padding: 0 0 12px 0; word-wrap: break-word; word-break: break-word;">${data.phoneNumber}</td>
                    </tr>
                    <tr>
                        <td style="color: #64748b; font-size: 11px; padding: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Jármű</td>
                    </tr>
                    <tr>
                        <td style="color: #0a2540; font-size: 14px; font-weight: 500; padding: 0 0 12px 0; word-wrap: break-word; word-break: break-word;">${carDisplayText}</td>
                    </tr>
                    ${data.city && data.zipCode
        ? `
                    <tr>
                        <td style="color: #64748b; font-size: 11px; padding: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Helyszín</td>
                    </tr>
                    <tr>
                        <td style="color: #0a2540; font-size: 14px; font-weight: 500; padding: 0 0 12px 0; word-wrap: break-word; word-break: break-word;">${data.city}, ${data.zipCode}</td>
                    </tr>
                    `
        : ""
      }
                    <tr>
                        <td style="color: #64748b; font-size: 11px; padding: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Épület típus</td>
                    </tr>
                    <tr>
                        <td style="color: #0a2540; font-size: 14px; font-weight: 500; padding: 0 0 12px 0; word-wrap: break-word; word-break: break-word;">${data.buildingType.replace("_", " ")}</td>
                    </tr>
                    <tr>
                        <td style="color: #64748b; font-size: 11px; padding: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Elektromos rendszer</td>
                    </tr>
                    <tr>
                        <td style="color: #0a2540; font-size: 14px; font-weight: 500; padding: 0 0 4px 0; word-wrap: break-word; word-break: break-word;">${data.phases} fázis, ${data.amperage} A</td>
                    </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

            <!-- Charger Sections -->
            ${selectedTemplates
        .map((template, templateIndex) => {
          const product = template.products[0];
          const chargerPrice = findProductPrice(product);
          const originalPrice = findOriginalPrice(product);
          const productUrl = getProductUrl(product);
          const loadManagementPackage = data.loadManagement ? getLoadManagementPackage(product) : null;
          const installationPackage = getInstallationPackage(product);
          const installationPrice = data.needsInstallation ? installationPackage.price : 0;

          return `
            ${templateIndex > 0 ? '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0;"><tr><td style="height: 1px; background: linear-gradient(90deg, transparent 0%, #cbd5e1 30%, #cbd5e1 70%, transparent 100%);"></td></tr></table>' : ""}
            
            <!-- Töltő ${templateIndex + 1}: ${template.name} -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
                <tr>
                    <td style="padding: 16px 16px 6px 16px; border-bottom: 2px solid #e2e8f0;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td>
                                    <p style="margin: 0 0 2px 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Ajánlott töltő ${templateIndex + 1}</p>
                                    <h2 style="margin: 0; color: #0a2540; font-size: 16px; font-weight: 700; letter-spacing: -0.3px;">${template.name}</h2>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 16px;">
                        <!-- Töltő kép -->
                        ${getChargerImageUrl(product)
              ? `
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                            <tr>
                                <td align="center" style="padding: 12px; background-color: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0;">
                                    <a href="${productUrl}" style="display: inline-block; text-decoration: none;">
                                        <img src="${getChargerImageUrl(product)}" alt="${product} – EV töltőállomás" width="240" style="max-width: 240px; width: 100%; height: auto; display: block; margin: 0 auto; border: 0; font-family: Arial, sans-serif; font-size: 14px; color: #64748b;" />
                                    </a>
                                </td>
                            </tr>
                        </table>
                        `
              : ""
            }
                        
                        <!-- Product name & price -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 16px;">
                            <tr>
                                <td style="padding: 14px;">
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td style="padding-bottom: 8px;"><a href="${productUrl}" style="color: #0a2540; font-size: 15px; font-weight: 700; text-decoration: none; border-bottom: 2px solid #0071e3; word-wrap: break-word; word-break: break-word; display: inline-block;">${product}</a></td>
                                        </tr>
                                        <tr>
                                            <td style="color: #0071e3; font-size: 20px; font-weight: 800;">${originalPrice ? `<span style="color: #94a3b8; text-decoration: line-through; font-size: 14px; font-weight: 400; margin-right: 8px;">${formatPrice(originalPrice)}</span>` : ''}${formatPrice(chargerPrice)}</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                        
                        <!-- Characteristics -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0;">
                            <tr>
                                <td style="padding: 14px;">
                                    <p style="margin: 0 0 10px 0; color: #0a2540; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;">Jellemzők</p>
                                    <ul style="margin: 0; padding: 0 0 0 18px; color: #4a5568; font-size: 13px; line-height: 1.8; word-wrap: break-word;">
                                        ${getCharacteristics(product)}
                                    </ul>
                                </td>
                            </tr>
                        </table>

                        ${loadManagementPackage || data.needsInstallation
              ? `
                        <!-- Opciós tételek -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px; background-color: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0;">
                            <tr>
                                <td style="padding: 14px;">
                                    <h3 style="margin: 0 0 12px 0; color: #0a2540; font-size: 14px; font-weight: 700;">Opciós tételek</h3>
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                        ${loadManagementPackage
                ? `
                                        <tr>
                                            <td style="padding: 8px 0; width: 65%;"><a href="${loadManagementPackage.url}" target="_blank" style="color: #0a2540; font-size: 13px; font-weight: 600; text-decoration: none; border-bottom: 2px solid #0071e3; word-wrap: break-word; word-break: break-word; display: inline-block;">${loadManagementPackage.name}</a></td>
                                            <td style="padding: 8px 0 8px 10px; color: #0071e3; font-size: 15px; font-weight: 800; text-align: right;">${formatPrice(loadManagementPackage.price)}</td>
                                        </tr>
                                        `
                : ""
              }
                                        ${data.needsInstallation
                ? `
                                        <tr>
                                            <td style="padding: 8px 0; vertical-align: top; width: 65%;">
                                                <a href="${installationPackage.url}" target="_blank" style="color: #0a2540; font-size: 13px; font-weight: 600; text-decoration: none; border-bottom: 2px solid #0071e3; word-wrap: break-word; word-break: break-word; display: inline-block;">${installationPackage.name}</a>
                                            </td>
                                            <td style="padding: 8px 0 8px 10px; color: #0071e3; font-size: 15px; font-weight: 800; text-align: right; vertical-align: top;">${formatPrice(installationPrice)}</td>
                                        </tr>
                                        `
                : ""
              }
                                    </table>
                                    ${data.needsInstallation
                ? `
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 14px;">
                                        <tr>
                                            <td align="center">
                                                <a href="${getCartUrl(product)}" style="display: inline-block; background-color: #059669; color: #ffffff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 700; letter-spacing: -0.2px;">Telepítéssel kérem! &rarr;</a>
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

                        <!-- Price Summary -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px; background-color: #f0f7ff; border-radius: 10px; border: 2px solid #0071e3; overflow: hidden;">
                            <tr>
                                <td style="padding: 16px;">
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td style="padding: 0 0 12px 0; color: #0a2540; font-size: 14px; font-weight: 700;">Töltő ára:</td>
                                            <td style="padding: 0 0 12px 0; color: #0071e3; font-size: 20px; font-weight: 800; text-align: right;">${originalPrice ? `<span style="color: #94a3b8; text-decoration: line-through; font-size: 14px; font-weight: 400; margin-right: 8px;">${formatPrice(originalPrice)}</span>` : ''}${formatPrice(chargerPrice)}</td>
                                        </tr>
                                    </table>
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td align="center" style="padding-top: 4px;">
                                                <a href="${getProductUrl(product)}" style="display: inline-block; background-color: #0071e3; color: #ffffff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 700; letter-spacing: -0.2px;">Megnézem &rarr;</a>
                                                ${quoteUrls[product] ? `<a href="${quoteUrls[product]}" style="display: inline-block; background-color: #0a2540; color: #ffffff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 700; letter-spacing: -0.2px; margin-left: 8px;">Ajánlat letöltése &#x1F4C4;</a>` : ''}
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
        .join("")}

            ${selectedAdditionals.length > 0
        ? `
            <!-- Accessories Section -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
                <tr>
                    <td style="padding: 16px 16px 6px 16px; border-bottom: 2px solid #e2e8f0;">
                        <h2 style="margin: 0; color: #0a2540; font-size: 16px; font-weight: 700; letter-spacing: -0.3px;">Kiegészítők (opcionális)</h2>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px 16px 16px 16px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            ${selectedAdditionals
          .map(
            (item) => `
                            <tr>
                                <td style="padding: 8px 0; color: #4a5568; font-size: 13px; width: 65%; border-bottom: 1px solid #f1f5f9;">${item}</td>
                                <td style="padding: 8px 0 8px 10px; color: #0a2540; font-size: 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #f1f5f9;">${formatPrice(additionalItemPrices[item] || 0)}</td>
                            </tr>
                            `,
          )
          .join("")}
                        </table>
                    </td>
                </tr>
            </table>
            `
        : ""
      }

            ${data.needsInstallation
        ? `
            ${data.needsPole ||
          data.needsElectricalPlanning ||
          data.overvoltageProtection ||
          data.infrastructureDevelopment ||
          data.networkExpansion
          ? `
            <!-- Additional Installation Requirements -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
                <tr>
                    <td style="padding: 16px 16px 6px 16px; border-bottom: 2px solid #e2e8f0;">
                        <h2 style="margin: 0; color: #0a2540; font-size: 16px; font-weight: 700; letter-spacing: -0.3px;">További telepítési követelmények</h2>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px 16px 16px 16px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <tr>
                                <td style="padding: 12px;">
                                    <ul style="margin: 0 0 10px 0; padding: 0 0 0 18px; color: #4a5568; font-size: 13px; line-height: 1.8; word-wrap: break-word;">
                                        ${data.needsPole ? "<li>Oszlop szükséges</li>" : ""}
                                        ${data.needsElectricalPlanning ? "<li>Villamos tervezés szükséges</li>" : ""}
                                        ${data.overvoltageProtection ? "<li>Túlfeszültség védelem</li>" : ""}
                                        ${data.infrastructureDevelopment && data.infrastructureDetails ? `<li>Infrastruktúra fejlesztés: ${data.infrastructureDetails}</li>` : ""}
                                        ${data.networkExpansion ? `<li>Hálózatbővítés: ${data.expansionPhase} fázis, ${data.expansionAmperage} A</li>` : ""}
                                    </ul>
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #eff6ff; border-radius: 6px;">
                                        <tr>
                                            <td style="padding: 10px 12px; border-left: 3px solid #3b82f6; color: #1e3a8a; font-size: 12px; line-height: 1.6; word-wrap: break-word;">
                                                <strong>Megjegyzés:</strong> A sztenderd telepítési tartalmon túli munkavégzésről a helyszínen készül lista. Az árlistája a <a href="https://www.evionor.hu" style="color: #0071e3; text-decoration: underline;">honlapunkon elérhető</a>.
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
          : ""
        }

            ${data.groundworkWallPenetration
          ? `
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                    <td style="padding: 14px; background-color: #fef3c7; border-radius: 10px; border-left: 4px solid #f59e0b;">
                        <p style="margin: 0 0 6px 0; color: #92400e; font-size: 13px; font-weight: 700;">Földmunka/Faláttörés:</p>
                        <p style="margin: 0; color: #78350f; font-size: 13px; line-height: 1.6; word-wrap: break-word;">${data.groundworkWallPenetration}</p>
                    </td>
                </tr>
            </table>
            `
          : ""
        }

            <!-- Standard Installation Description -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
                <tr>
                    <td style="padding: 16px 16px 6px 16px; border-bottom: 2px solid #e2e8f0;">
                        <h2 style="margin: 0; color: #0a2540; font-size: 16px; font-weight: 700; letter-spacing: -0.3px;">Sztenderd telepítés</h2>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px 16px 16px 16px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <tr>
                                <td style="padding: 12px;">
                                    <p style="margin: 0 0 10px 0; color: #4a5568; font-size: 13px; line-height: 1.7;">
                                        A telepítés magában foglalja:
                                    </p>
                                    <ul style="margin: 0; padding: 0 0 0 18px; color: #4a5568; font-size: 13px; line-height: 1.8;">
                                        <li>Áramvédő kapcsoló (Legrand) beépítése meglévő szekrénybe</li>
                                        <li>Kismegszakító (Legrand) beszerelése meglévő szekrénybe</li>
                                        <li>Kültéri vagy beltéri kábel rögzítése (5m)</li>
                                        <li>Töltőállomás szakszerű felszerelése</li>
                                        <li>Beüzemelés és átadás</li>
                                    </ul>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            `
        : ""
      }

            <!-- Process Section -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
                <tr>
                    <td style="padding: 16px 16px 6px 16px; border-bottom: 2px solid #e2e8f0;">
                        <h2 style="margin: 0; color: #0a2540; font-size: 16px; font-weight: 700; letter-spacing: -0.3px;">Folyamat</h2>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 12px 16px 16px 16px;">
                        <ol style="margin: 0; padding: 0 0 0 18px; color: #4a5568; font-size: 13px; line-height: 2;">
                            ${data.needsInstallation
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
                    </td>
                </tr>
            </table>

            ${data.otherComments
        ? `
            <!-- Other Comments -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
                <tr>
                    <td style="padding: 14px; background-color: #eff6ff; border-radius: 10px; border-left: 4px solid #3b82f6;">
                        <h2 style="margin: 0 0 10px 0; color: #1e40af; font-size: 14px; font-weight: 700;">Egyéb megjegyzések</h2>
                        <p style="margin: 0; color: #1e3a8a; font-size: 13px; line-height: 1.6; word-wrap: break-word;">${data.otherComments}</p>
                    </td>
                </tr>
            </table>
            `
        : ""
      }

                            <!-- Closing -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 2px solid #e2e8f0; padding-top: 0;">
                                <tr>
                                    <td style="padding-top: 24px;">
                                        <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 14px; line-height: 1.6;">További kérdés esetén állunk rendelkezésére!</p>
                                        <p style="margin: 0 0 6px 0; color: #64748b; font-size: 13px;">Üdvözlettel,</p>
                                        <p style="margin: 0 0 14px 0; color: #0a2540; font-size: 14px; font-weight: 700;">${senderName}</p>
                                        <p style="margin: 0 0 6px 0; color: #0a2540; font-size: 13px; font-weight: 700;">Az EVIONOR Csapata</p>
                                        <p style="margin: 0 0 4px 0;"><a href="tel:+36205819166" style="color: #0071e3; font-size: 13px; text-decoration: none;">+36 20 581 9166</a></p>
                                        <p style="margin: 0 0 4px 0;"><a href="mailto:info@evionor.hu" style="color: #0071e3; font-size: 13px; text-decoration: none;">info@evionor.hu</a></p>
                                        <p style="margin: 0;"><a href="https://www.evionor.hu" style="color: #0071e3; font-size: 13px; text-decoration: none;">www.evionor.hu</a></p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0a2540; padding: 20px 24px; text-align: center;" bgcolor="#0a2540">
                            <p style="margin: 0 0 4px 0; color: rgba(255, 255, 255, 0.7); font-size: 12px;">EVIONOR Magyarország &copy; 2025</p>
                            <p style="margin: 0; color: rgba(255, 255, 255, 0.5); font-size: 11px;">Elektromos autó töltési megoldások</p>
                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>
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
          from: `${senderName} - EVIONOR <hello@notifications.evionor.hu>`,
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
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50"
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
