import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { chargerTemplates, ChargerTemplate } from "@/types/questionnaire";
import { formatPrice, priceList } from "@/data/priceList";
import { supabase } from "@/integrations/supabase/client";
import { generateQuotePdf } from "@/lib/generateQuotePdf";
import { Copy, Mail, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface B2BEmailGeneratorProps {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  city?: string;
  zipCode?: string;
  address?: string;
  phases?: string;
  mainFuse?: string;
  distanceFromPanel?: string;
  chargerCount?: number;
  onEmailSent?: () => void;
}

const INSTALLATION_TIERS = [
  { label: "5m kábelig", value: "5m", price: 219000 },
  { label: "10m kábelig", value: "10m", price: 249000 },
  { label: "20m kábelig", value: "20m", price: 299000 },
  { label: "30m kábelig", value: "30m", price: 349000 },
];

const INSTALLATION_DISCOUNTS: Record<number, { discount: number; label: string }> = {
  1: { discount: 0, label: "Teljes ár" },
  2: { discount: 25, label: "25% kedvezmény" },
  3: { discount: 30, label: "30% kedvezmény" },
};

const LOAD_MANAGERS = [
  { brand: "Zaptec", name: "Zaptec Sense GEN CT Clamp Csomag", netPrice: 99450, grossPrice: Math.round(99450 * 1.27), url: "https://evionor.hu/collections/all/products/zaptec-sense-gen-ct-clamp-csomag-ev-mero?_pos=14&_fid=c1e909eaa&_ss=c" },
  { brand: "Easee", name: "Easee Equalizer Amp Csomag", netPrice: 110074, grossPrice: Math.round(110074 * 1.27), url: "https://evionor.hu/collections/all/products/easee-equalizer-amp-csomag-ev-mero" },
  { brand: "Charge Amps", name: "Charge Amps Amp Guard", netPrice: 103937, grossPrice: Math.round(103937 * 1.27), url: "https://evionor.hu/collections/all/products/charge-amps-amp-guard-63a-ev-mero?_pos=10&_fid=53fe77cfa&_ss=c" },
];

const detectLoadManager = (templates: ChargerTemplate[]): typeof LOAD_MANAGERS[0] | null => {
  for (const t of templates) {
    const product = t.products[0].toLowerCase();
    if (product.includes("zaptec")) return LOAD_MANAGERS[0];
    if (product.includes("easee")) return LOAD_MANAGERS[1];
    if (product.includes("charge amps")) return LOAD_MANAGERS[2];
  }
  return LOAD_MANAGERS[0]; // default
};

const productUrls: Record<string, string> = {
  "Charge Amps Halo 11kW": "https://evionor.hu/collections/all/products/charge-amps-halo-7-4kw-ev-tolto",
  "Charge Amps Luna 22kW": "https://evionor.hu/collections/all/products/charge-amps-luna-22kw-ev-tolto",
  "AMINA 1 - 7.4kW": "https://evionor.hu/collections/all/products/amina-1-evtlt",
  "Easee Charge Up 22kW": "https://evionor.hu/collections/all/products/easee-charge-up-evtlt",
  "Zaptec Go 22kW": "https://evionor.hu/collections/all/products/zaptec-go-evtlt",
  "Zaptec Solar MID": "https://evionor.hu/collections/all/products/zaptec-go-2",
};

const getChargerImageUrl = (productName: string): string => {
  if (productName.includes("Zaptec Solar MID")) return "https://evionor.hu/cdn/shop/files/ZaptecGo2_Productimage_quater_asphaltblack.webp?v=1762325254&width=600";
  if (productName.includes("Zaptec Go")) return "https://evionor.hu/cdn/shop/files/Zaptec_Go_Home_Charging_2329.webp?v=1762272030&width=600";
  if (productName.includes("Easee Charge Up")) return "https://evionor.hu/cdn/shop/files/ChargingRobotAll_Front_Black_2K_8-bit_sRGB_Web_e31b280f-1e5a-4656-9124-c897b46649da.webp?v=1762426764&width=600";
  if (productName.includes("Charge Amps Luna")) return "https://evionor.hu/cdn/shop/files/PACKSHOT_-_Luna_Silver_-_Front_Transparent_HR.webp?v=1762427311&width=600";
  if (productName.includes("AMINA 1") || productName.includes("Amina 1")) return "https://evionor.hu/cdn/shop/files/Amina1-01_b6b7cf86-b2bf-4fee-bfd1-2eed3d1e2273.webp?v=1760611153&width=600";
  if (productName.includes("Charge Amps Halo")) return "https://evionor.hu/cdn/shop/files/PACKSHOTSHALOwCableFrontTransparentHR.webp?v=1760611158&width=600";
  return "";
};

const getCharacteristics = (productName: string): string => {
  if (productName.includes("Easee Charge Up")) {
    return `
      <li style="font-size: 14px;">Fázisok száma: 1/3 fázis kompatibilis</li>
      <li style="font-size: 14px;">Töltési áramerősség: 6–32 A között állítható</li>
      <li style="font-size: 14px;">Biztonság: Beépített hibaáram védelem</li>
      <li style="font-size: 14px;">Hitelesítés: RFID/NFC vagy mobilalkalmazás</li>
      <li style="font-size: 14px;">Kapcsolódás: Bluetooth, WiFi és 4G LTE-M (eSIM)</li>
      <li style="font-size: 14px;">Okos funkciók: Terhelésmenedzsment kompatibilis</li>
      <li style="font-size: 14px;">Extra funkciók: Lágy indítás, okosotthon integráció</li>
      <li style="font-size: 14px;">Töltési adatok: Részletes töltési statisztikák</li>
      <li style="font-size: 14px;">Szoftverfrissítések: Automatikus frissítés LTE-n</li>
      <li style="font-size: 14px;">Védettség: IP54, kültéri használatra</li>
      <li style="font-size: 14px; background-color: #d1fae5; padding: 4px 8px; border-radius: 6px; font-weight: 700; color: #065f46;">✓ Gyártói garancia 5 év</li>
    `;
  }
  if (productName.includes("Zaptec Solar MID")) {
    return `
      <li style="font-size: 14px;">Fázisok száma: 1/3 fázis kompatibilis</li>
      <li style="font-size: 14px;">Töltési áramerősség: 6–32 A között állítható</li>
      <li style="font-size: 14px;">Biztonság: Beépített hibaáram védelem</li>
      <li style="font-size: 14px;">Hitelesítés: RFID/NFC vagy mobilalkalmazás</li>
      <li style="font-size: 14px;">Kapcsolódás: Bluetooth, WiFi és 4G LTE-M (eSIM)</li>
      <li style="font-size: 14px;">Okos funkciók: Terhelésmenedzsment kompatibilis</li>
      <li style="font-size: 14px;">Extra funkciók: Lágy indítás, okosotthon integráció</li>
      <li style="font-size: 14px;">Töltési adatok: Részletes töltési statisztikák</li>
      <li style="font-size: 14px;">Szoftverfrissítések: Automatikus frissítés LTE-n</li>
      <li style="font-size: 14px;">Védettség: IP54, kültéri használatra</li>
      <li style="font-size: 14px; background-color: #d1fae5; padding: 4px 8px; border-radius: 6px; font-weight: 700; color: #065f46;">✓ Gyártói garancia 5 év</li>
    `;
  }
  if (productName.includes("Zaptec Go")) {
    return `
      <li style="font-size: 14px;">Fázisok száma: 1/3 fázis kompatibilis</li>
      <li style="font-size: 14px;">Töltési áramerősség: 6–32 A között állítható</li>
      <li style="font-size: 14px;">Biztonság: Beépített hibaáram védelem</li>
      <li style="font-size: 14px;">Hitelesítés: RFID/NFC vagy mobilalkalmazás</li>
      <li style="font-size: 14px;">Kapcsolódás: Bluetooth, WiFi és 4G LTE-M (eSIM)</li>
      <li style="font-size: 14px;">Okos funkciók: Terhelésmenedzsment kompatibilis</li>
      <li style="font-size: 14px;">Extra funkciók: Lágy indítás, okosotthon integráció</li>
      <li style="font-size: 14px;">Töltési adatok: Részletes töltési statisztikák</li>
      <li style="font-size: 14px;">Szoftverfrissítések: Automatikus frissítés LTE-n</li>
      <li style="font-size: 14px;">Védettség: IP54, kültéri használatra</li>
      <li style="font-size: 14px; background-color: #d1fae5; padding: 4px 8px; border-radius: 6px; font-weight: 700; color: #065f46;">✓ Gyártói garancia 5 év</li>
    `;
  }
  if (productName.includes("AMINA 1") || productName.includes("Amina 1")) {
    return `
      <li style="font-size: 14px;">Töltési áramerősség: 6–32 A között állítható</li>
      <li style="font-size: 14px;">Biztonság: Beépített hibaáram védelem</li>
      <li style="font-size: 14px;">Applikáció: Nem támogatott</li>
      <li style="font-size: 14px;">Terhelésmenedzsment: nem támogatott</li>
      <li style="font-size: 14px;">Egyszerű "Plug & Charge" töltés 7,4kW-ig</li>
      <li style="font-size: 14px;">Védettség: IP54, kültéri használatra</li>
      <li style="font-size: 14px; background-color: #d1fae5; padding: 4px 8px; border-radius: 6px; font-weight: 700; color: #065f46;">✓ Gyártói garancia 5 év</li>
    `;
  }
  if (productName.includes("Charge Amps Halo")) {
    return `
      <li style="font-size: 14px;">Fázisok száma: 1/3 fázis kompatibilis</li>
      <li style="font-size: 14px;">Töltési áram: 1 fázis 6-32 A / 3 fázis 6-16A</li>
      <li style="font-size: 14px;">Biztonság: Beépített hibaáram védelem</li>
      <li style="font-size: 14px;">Hitelesítés: RFID</li>
      <li style="font-size: 14px;">Kapcsolódás: WiFi és RFID</li>
      <li style="font-size: 14px;">Szabályzás: Terhelés menedzsment kompatibilis</li>
      <li style="font-size: 14px;">Extra funkciók: Extra 220V konnektor</li>
      <li style="font-size: 14px;">Szoftverfrissítések: Automatikus frissítések</li>
      <li style="font-size: 14px;">Védettség kültérre: IP66 töltőtest, IP44 csatlakozó</li>
      <li style="font-size: 14px; background-color: #d1fae5; padding: 4px 8px; border-radius: 6px; font-weight: 700; color: #065f46;">✓ Gyártói garancia 5 év</li>
    `;
  }
  if (productName.includes("Charge Amps Luna")) {
    return `
      <li style="font-size: 14px;">Fázisok száma: 1/3 fázis kompatibilis</li>
      <li style="font-size: 14px;">Töltési áramerősség: 6–32 A között állítható</li>
      <li style="font-size: 14px;">Biztonság: Beépített hibaáram védelem</li>
      <li style="font-size: 14px;">Hitelesítés: RFID/NFC vagy mobilalkalmazás</li>
      <li style="font-size: 14px;">Kapcsolódás: Bluetooth, WiFi és 4G LTE-M (eSIM)</li>
      <li style="font-size: 14px;">Okos funkciók: Terhelésmenedzsment kompatibilis</li>
      <li style="font-size: 14px;">Extra funkciók: Lágy indítás, okosotthon integráció</li>
      <li style="font-size: 14px;">Töltési adatok: Részletes töltési statisztikák</li>
      <li style="font-size: 14px;">Szoftverfrissítések: Automatikus frissítés LTE-n</li>
      <li style="font-size: 14px;">Védettség: IP54, kültéri használatra</li>
      <li style="font-size: 14px; background-color: #d1fae5; padding: 4px 8px; border-radius: 6px; font-weight: 700; color: #065f46;">✓ Gyártói garancia 5 év</li>
    `;
  }
  return "";
};

export function B2BEmailGenerator({
  companyName,
  contactName,
  email,
  phone,
  city,
  zipCode,
  address,
  phases,
  mainFuse,
  distanceFromPanel,
  chargerCount,
  onEmailSent,
}: B2BEmailGeneratorProps) {
  const [selectedTemplates, setSelectedTemplates] = useState<ChargerTemplate[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [includeLoadManagement, setIncludeLoadManagement] = useState(false);
  const [installationTier, setInstallationTier] = useState("5m");
  const [senderName, setSenderName] = useState("Horváth Gáspár");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Reset generated email when settings change so user always gets fresh output
  useEffect(() => {
    if (generatedEmail) {
      setGeneratedEmail("");
      setEmailSubject("");
    }
  }, [includeLoadManagement, includeInstallation, discountPercent, installationTier, selectedTemplates]);

  const findProductPrice = (productName: string): number => {
    const normalized = productName.toLowerCase().replace(/\s+/g, " ").trim();
    let product = priceList.find(p => p.name.toLowerCase().replace(/\s+/g, " ") === normalized);
    if (!product) {
      product = priceList.find(p => {
        const pn = p.name.toLowerCase().replace(/\s+/g, " ");
        return normalized.split(" ").every(w => pn.includes(w));
      });
    }
    return product?.price || 0;
  };

  const findOriginalPrice = (productName: string): number | null => {
    const normalized = productName.toLowerCase().replace(/\s+/g, " ").trim();
    let product = priceList.find(p => p.name.toLowerCase().replace(/\s+/g, " ") === normalized);
    if (!product) {
      product = priceList.find(p => {
        const pn = p.name.toLowerCase().replace(/\s+/g, " ");
        return normalized.split(" ").every(w => pn.includes(w));
      });
    }
    return product?.originalPrice || null;
  };

  const applyDiscount = (price: number): number => {
    return Math.round(price * (1 - discountPercent / 100));
  };

  const getInstallationPrice = (): number => {
    const tier = INSTALLATION_TIERS.find(t => t.value === installationTier);
    return tier?.price || 219000;
  };

  const toggleTemplate = (template: ChargerTemplate) => {
    const exists = selectedTemplates.find(t => t.id === template.id);
    if (exists) {
      setSelectedTemplates(selectedTemplates.filter(t => t.id !== template.id));
    } else {
      setSelectedTemplates([...selectedTemplates, template]);
    }
  };

  const getInstallationDiscountInfo = () => {
    const count = chargerCount || 1;
    if (count >= 4) return { discount: 0, label: "Egyedi ajánlat szükséges", isCustom: true };
    const info = INSTALLATION_DISCOUNTS[count] || INSTALLATION_DISCOUNTS[1];
    return { ...info, isCustom: false };
  };

  const getDiscountedInstallationPrice = (): number => {
    const basePrice = getInstallationPrice();
    const count = chargerCount || 1;
    if (count >= 4) return basePrice;
    const discountInfo = INSTALLATION_DISCOUNTS[count] || INSTALLATION_DISCOUNTS[1];
    return Math.round(basePrice * (1 - discountInfo.discount / 100));
  };

  const generateEmail = async () => {
    if (selectedTemplates.length === 0) return;
    const count = chargerCount || 1;
    if (count >= 4 && includeInstallation) {
      toast.error("4+ töltőnél egyedi ajánlat szükséges a telepítésre. Kérjük vegye fel a kapcsolatot.");
      return;
    }
    setIsGenerating(true);

    const loadManager = includeLoadManagement ? detectLoadManager(selectedTemplates) : null;

    // Generate PDFs
    const quoteUrls: Record<string, string> = {};
    for (const template of selectedTemplates) {
      const product = template.products[0];
      const chargerPrice = applyDiscount(findProductPrice(product));
      const items = [{ name: product, quantity: count, grossPrice: chargerPrice }];
      if (includeInstallation) {
        const installDiscountInfo = getInstallationDiscountInfo();
        const discountedInstallPrice = getDiscountedInstallationPrice();
        const fullInstallPrice = getInstallationPrice();
        // First charger full price, rest discounted
        if (count === 1) {
          items.push({
            name: `Telepítés (${INSTALLATION_TIERS.find(t => t.value === installationTier)?.label})`,
            quantity: 1,
            grossPrice: fullInstallPrice,
          });
        } else {
          items.push({
            name: `Telepítés (${INSTALLATION_TIERS.find(t => t.value === installationTier)?.label})`,
            quantity: 1,
            grossPrice: fullInstallPrice,
          });
          items.push({
            name: `Telepítés – ${installDiscountInfo.label} (${INSTALLATION_TIERS.find(t => t.value === installationTier)?.label})`,
            quantity: count - 1,
            grossPrice: discountedInstallPrice,
          });
        }
      }
      if (loadManager) {
        items.push({
          name: loadManager.name,
          quantity: 1,
          grossPrice: loadManager.grossPrice,
        });
      }

      try {
        const pdfBlob = await generateQuotePdf({
          customerName: companyName || contactName,
          customerEmail: email,
          customerPhone: phone,
          customerCity: city,
          customerZip: zipCode,
          items,
          productUrl: productUrls[product],
        });

        const fileName = `b2b-ajanlat-${(companyName || contactName).replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-${product.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-${Date.now()}.pdf`;
        const { error: uploadError } = await supabase.storage.from("quotes").upload(fileName, pdfBlob, { contentType: "application/pdf", upsert: true });
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("quotes").getPublicUrl(fileName);
          quoteUrls[product] = urlData.publicUrl;
        }
      } catch (err) {
        console.error("PDF error:", err);
      }
    }

    const displayName = companyName || contactName;
    const greeting = companyName ? "Tisztelt Ügyfelünk!" : `Tisztelt ${contactName}!`;
    const installPrice = getInstallationPrice();
    const discountedInstallPrice = getDiscountedInstallationPrice();
    const installDiscountInfo = getInstallationDiscountInfo();
    const installLabel = INSTALLATION_TIERS.find(t => t.value === installationTier)?.label || "5m kábelig";
    const emailCount = chargerCount || 1;

    const htmlEmail = `
<!DOCTYPE html>
<html lang="hu" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>B2B EV-Töltő Ajánlat</title>
    <style>
        @media only screen and (max-width: 620px) {
            .email-container { width: 100% !important; }
            .content-padding { padding: 20px 16px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; width: 100%; background-color: #f0f2f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
    <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0; overflow: hidden;">
        B2B EV-töltő ajánlat – ${displayName}
    </div>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f2f5;">
        <tr>
            <td align="center" style="padding: 32px 12px;">
                <table role="presentation" class="email-container" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0a2540 0%, #1a3a5c 50%, #0071e3 100%); padding: 28px 24px 24px; text-align: center;" bgcolor="#0a2540">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                                <tr>
                                    <td align="center">
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 14px;">
                                            <tr>
                                                <td style="padding: 10px 24px; background-color: #ffffff; border-radius: 14px;">
                                                    <a href="https://evionor.hu" target="_blank" style="display: block; text-decoration: none;">
                                                        <img src="https://evionor.hu/cdn/shop/files/evionor-logo.png?v=1761743181" alt="EVIONOR" width="200" style="height: auto; display: block; border: 0; max-width: 100%;" />
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">B2B EV-Töltő Ajánlat</h1>
                            <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Személyre szabott üzleti megoldás</p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td class="content-padding" style="padding: 28px 24px;">
                            <p style="margin: 0 0 16px 0; color: #1a1a2e; font-size: 15px; font-weight: 500;">${greeting}</p>
                            <p style="margin: 0 0 32px 0; color: #4a5568; font-size: 14px; line-height: 1.7;">Köszönjük érdeklődését! Az Ön igényei alapján az alábbi ajánlatot készítettük.</p>

                            <!-- Client Data -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                                <tr>
                                    <td style="padding: 16px 16px 6px 16px; border-bottom: 2px solid #e2e8f0;">
                                        <h2 style="margin: 0; color: #0a2540; font-size: 16px; font-weight: 700;">Projekt adatok</h2>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 16px 16px 16px;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                            ${companyName ? `
                                            <tr><td style="color: #64748b; font-size: 11px; padding: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Cégnév</td></tr>
                                            <tr><td style="color: #0a2540; font-size: 14px; font-weight: 600; padding: 0 0 12px 0;">${companyName}</td></tr>
                                            ` : ""}
                                            <tr><td style="color: #64748b; font-size: 11px; padding: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Kapcsolattartó</td></tr>
                                            <tr><td style="color: #0a2540; font-size: 14px; font-weight: 500; padding: 0 0 12px 0;">${contactName}</td></tr>
                                            <tr><td style="color: #64748b; font-size: 11px; padding: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">E-mail</td></tr>
                                            <tr><td style="color: #0a2540; font-size: 14px; font-weight: 500; padding: 0 0 12px 0;">${email}</td></tr>
                                            ${city ? `
                                            <tr><td style="color: #64748b; font-size: 11px; padding: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Helyszín</td></tr>
                                            <tr><td style="color: #0a2540; font-size: 14px; font-weight: 500; padding: 0 0 12px 0;">${zipCode || ""} ${city}${address ? `, ${address}` : ""}</td></tr>
                                            ` : ""}
                                            ${phases ? `
                                            <tr><td style="color: #64748b; font-size: 11px; padding: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Elektromos rendszer</td></tr>
                                            <tr><td style="color: #0a2540; font-size: 14px; font-weight: 500; padding: 0 0 12px 0;">${phases} fázis${mainFuse ? `, ${mainFuse}` : ""}</td></tr>
                                            ` : ""}
                                            ${chargerCount ? `
                                            <tr><td style="color: #64748b; font-size: 11px; padding: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Töltők száma</td></tr>
                                            <tr><td style="color: #0a2540; font-size: 14px; font-weight: 500; padding: 0 0 4px 0;">${chargerCount} db</td></tr>
                                            ` : ""}
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Charger sections -->
                            ${selectedTemplates.map((template, idx) => {
      const product = template.products[0];
      const originalPrice = findProductPrice(product);
      const discountedPrice = applyDiscount(originalPrice);
      const origPrice = findOriginalPrice(product);
      const hasDiscount = discountPercent > 0;
      const imgUrl = getChargerImageUrl(product);
      const prodUrl = productUrls[product] || "https://evionor.hu/webshop/";

      return `
                            ${idx > 0 ? '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0;"><tr><td style="height: 1px; background: linear-gradient(90deg, transparent 0%, #cbd5e1 30%, #cbd5e1 70%, transparent 100%);"></td></tr></table>' : ""}
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                                <tr>
                                    <td style="padding: 16px 16px 6px 16px; border-bottom: 2px solid #e2e8f0;">
                                        <p style="margin: 0 0 2px 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Ajánlott töltő ${idx + 1}</p>
                                        <h2 style="margin: 0; color: #0a2540; font-size: 16px; font-weight: 700;">${template.name}</h2>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 16px;">
                                        ${imgUrl ? `
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                                            <tr>
                                                <td align="center" style="padding: 12px; background-color: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0;">
                                                    <a href="${prodUrl}" style="display: inline-block; text-decoration: none;">
                                                        <img src="${imgUrl}" alt="${product}" width="240" style="max-width: 240px; width: 100%; height: auto; display: block; border: 0;" />
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        ` : ""}
                                        <!-- Price -->
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 16px;">
                                            <tr>
                                                <td style="padding: 14px;">
                                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                                        <tr><td style="padding-bottom: 8px;"><a href="${prodUrl}" style="color: #0a2540; font-size: 15px; font-weight: 700; text-decoration: none; border-bottom: 2px solid #0071e3;">${product}</a></td></tr>
                                                        <tr><td>
                                                            ${hasDiscount || origPrice ? `<span style="color: #94a3b8; text-decoration: line-through; font-size: 13px; font-weight: 400; margin-right: 8px;">${formatPrice(Math.round((origPrice || originalPrice) / 1.27))} + áfa</span>` : ""}
                                                            <span style="color: #0071e3; font-size: 22px; font-weight: 800;">${formatPrice(Math.round(discountedPrice / 1.27))}</span>
                                                            <span style="color: #64748b; font-size: 13px; font-weight: 500;"> + áfa</span>
                                                            ${hasDiscount ? `<span style="color: #059669; font-size: 12px; font-weight: 600; margin-left: 8px;">-${discountPercent}%</span>` : ""}
                                                            <br/>
                                                            <span style="color: #94a3b8; font-size: 12px; font-weight: 400;">bruttó: ${formatPrice(discountedPrice)}</span>
                                                        </td></tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        <!-- Characteristics -->
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0;">
                                            <tr>
                                                <td style="padding: 14px;">
                                                    <p style="margin: 0 0 10px 0; color: #0a2540; font-size: 13px; font-weight: 700; text-transform: uppercase;">Jellemzők</p>
                                                    <ul style="margin: 0; padding: 0 0 0 18px; color: #4a5568; font-size: 13px; line-height: 1.8;">
                                                        ${getCharacteristics(product)}
                                                    </ul>
                                                </td>
                                            </tr>
                                        </table>

                                        ${includeInstallation ? `
                                        <!-- Installation -->
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px; background-color: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0;">
                                            <tr>
                                                <td style="padding: 14px;">
                                                    <p style="margin: 0 0 8px 0; color: #0a2540; font-size: 13px; font-weight: 700; text-transform: uppercase;">Telepítés</p>
                                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                                        <tr>
                                                            <td style="color: #4a5568; font-size: 13px; padding: 4px 0;">1. töltő telepítése (${installLabel})</td>
                                                            <td style="color: #0a2540; font-size: 14px; font-weight: 600; text-align: right;">
                                                                ${formatPrice(Math.round(installPrice / 1.27))} + áfa
                                                                <br/><span style="color: #94a3b8; font-size: 11px; font-weight: 400;">bruttó: ${formatPrice(installPrice)}</span>
                                                            </td>
                                                        </tr>
                                                        ${emailCount > 1 ? `
                                                        <tr>
                                                            <td style="color: #4a5568; font-size: 13px; padding: 4px 0;">További ${emailCount - 1} db telepítés (${installDiscountInfo.label})</td>
                                                            <td style="color: #059669; font-size: 14px; font-weight: 600; text-align: right;">
                                                                <span style="color: #94a3b8; text-decoration: line-through; font-size: 11px; margin-right: 4px;">${formatPrice(Math.round(installPrice / 1.27))}</span>
                                                                ${formatPrice(Math.round(discountedInstallPrice / 1.27))} + áfa / db
                                                                <br/><span style="color: #94a3b8; font-size: 11px; font-weight: 400;">bruttó: ${formatPrice(discountedInstallPrice)} / db</span>
                                                            </td>
                                                        </tr>
                                                        ` : ""}
                                                    </table>
                                                    <p style="margin: 10px 0 0 0; color: #4a5568; font-size: 12px; line-height: 1.6;">A telepítés tartalmazza: áramvédő és kismegszakító beépítése, kábel rögzítése, töltő felszerelése, beüzemelés és átadás.</p>
                                                </td>
                                            </tr>
                                        </table>
                                        ` : ""}

                                        <!-- Saját villanyszerelő - always visible -->
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px; background-color: #d1fae5; border-radius: 10px; border: 1px solid #a7f3d0;">
                                            <tr>
                                                <td style="padding: 14px;">
                                                    <p style="margin: 0; color: #065f46; font-size: 13px; font-weight: 700; line-height: 1.5;">💡 Van saját villanyszerelője? Rendelje meg csak a töltőt! A telepítésben és a beüzemelésben díjmentesen támogatjuk!</p>
                                                </td>
                                            </tr>
                                        </table>

                                        ${loadManager ? `
                                        <!-- Load Manager -->
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px; background-color: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0;">
                                            <tr>
                                                <td style="padding: 14px;">
                                                    <p style="margin: 0 0 8px 0; color: #0a2540; font-size: 13px; font-weight: 700; text-transform: uppercase;">Terhelésmenedzsment</p>
                                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                                        <tr>
                                                            <td style="color: #4a5568; font-size: 13px; padding: 4px 0;"><a href="${loadManager.url}" style="color: #0071e3; text-decoration: none; border-bottom: 1px solid #0071e3;">${loadManager.name}</a></td>
                                                            <td style="color: #0a2540; font-size: 14px; font-weight: 600; text-align: right;">
                                                                ${formatPrice(loadManager.netPrice)} + áfa
                                                                <br/><span style="color: #94a3b8; font-size: 11px; font-weight: 400;">bruttó: ${formatPrice(loadManager.grossPrice)}</span>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <p style="margin: 10px 0 0 0; color: #4a5568; font-size: 12px; line-height: 1.6;">Több töltő egyidejű használatához szükséges terhelésmenedzsment rendszer.</p>
                                                </td>
                                            </tr>
                                        </table>
                                        ` : ""}

                                        <!-- Summary -->
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px; background-color: #f0f7ff; border-radius: 10px; border: 2px solid #0071e3;">
                                            <tr>
                                                <td style="padding: 16px;">
                                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                                        <tr>
                                                            <td style="color: #0a2540; font-size: 14px; font-weight: 700;">Töltő${emailCount > 1 ? ` (${emailCount} db)` : ""} nettó:</td>
                                                            <td style="text-align: right;">
                                                                <span style="color: #0071e3; font-size: 20px; font-weight: 800;">${formatPrice(Math.round(discountedPrice * emailCount / 1.27))}</span>
                                                                <span style="color: #64748b; font-size: 12px;"> + áfa</span>
                                                                <br/><span style="color: #94a3b8; font-size: 11px;">bruttó: ${formatPrice(discountedPrice * emailCount)}</span>
                                                            </td>
                                                        </tr>
                                                        ${includeInstallation ? `
                                                        <tr>
                                                            <td style="color: #0a2540; font-size: 14px; font-weight: 700; padding-top: 8px;">Telepítés (${emailCount} db) nettó:</td>
                                                            <td style="text-align: right; padding-top: 8px;">
                                                                <span style="color: #059669; font-size: 16px; font-weight: 700;">${formatPrice(Math.round((installPrice + discountedInstallPrice * (emailCount - 1)) / 1.27))}</span>
                                                                <span style="color: #64748b; font-size: 12px;"> + áfa</span>
                                                                <br/><span style="color: #94a3b8; font-size: 11px;">bruttó: ${formatPrice(installPrice + discountedInstallPrice * (emailCount - 1))}</span>
                                                            </td>
                                                        </tr>
                                                        ` : ""}
                                                        ${loadManager ? `
                                                        <tr>
                                                            <td style="color: #0a2540; font-size: 14px; font-weight: 700; padding-top: 8px;">Terhelésmenedzsment nettó:</td>
                                                            <td style="text-align: right; padding-top: 8px;">
                                                                <span style="color: #059669; font-size: 16px; font-weight: 700;">${formatPrice(loadManager.netPrice)}</span>
                                                                <span style="color: #64748b; font-size: 12px;"> + áfa</span>
                                                                <br/><span style="color: #94a3b8; font-size: 11px;">bruttó: ${formatPrice(loadManager.grossPrice)}</span>
                                                            </td>
                                                        </tr>
                                                        ` : ""}
                                                        ${includeInstallation || loadManager ? `
                                                        <tr>
                                                            <td colspan="2" style="padding-top: 12px; border-top: 1px solid #cbd5e1;">
                                                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                                                    <tr>
                                                                        <td style="color: #0a2540; font-size: 16px; font-weight: 800; padding-top: 4px;">Összesen nettó:</td>
                                                                        <td style="text-align: right; padding-top: 4px;">
                                                                            <span style="color: #0071e3; font-size: 22px; font-weight: 800;">${formatPrice(Math.round((discountedPrice * emailCount + (includeInstallation ? installPrice + discountedInstallPrice * (emailCount - 1) : 0) + (loadManager ? loadManager.grossPrice : 0)) / 1.27))}</span>
                                                                            <span style="color: #64748b; font-size: 13px;"> + áfa</span>
                                                                            <br/><span style="color: #94a3b8; font-size: 12px;">bruttó: ${formatPrice(discountedPrice * emailCount + (includeInstallation ? installPrice + discountedInstallPrice * (emailCount - 1) : 0) + (loadManager ? loadManager.grossPrice : 0))}</span>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                        ` : ""}
                                                    </table>
                                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 12px;">
                                                        <tr>
                                                            <td align="center">
                                                                <a href="${prodUrl}" style="display: inline-block; background-color: #0071e3; color: #ffffff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 700;">Megnézem &rarr;</a>
                                                                ${quoteUrls[product] ? `<a href="${quoteUrls[product]}" style="display: inline-block; background-color: #0a2540; color: #ffffff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 700; margin-left: 8px;">Ajánlat letöltése &#x1F4C4;</a>` : ""}
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
    }).join("")}

                            <!-- Process -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                                <tr>
                                    <td style="padding: 16px 16px 6px 16px; border-bottom: 2px solid #e2e8f0;">
                                        <h2 style="margin: 0; color: #0a2540; font-size: 16px; font-weight: 700;">Folyamat</h2>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 16px 16px 16px;">
                                        <ol style="margin: 0; padding: 0 0 0 18px; color: #4a5568; font-size: 13px; line-height: 2;">
                                            <li>Rendelje meg egyszerűen a termékeinket akár erre az emailre történő válasszal!</li>
                                            <li>A termékeket díjmentesen házhoz szállítjuk.</li>
                                            ${includeInstallation ? `
                                            <li>Rendelés után azonnal egyeztetjük a telepítés részleteit.</li>
                                            ` : ``}
                                        </ol>
                                    </td>
                                </tr>
                            </table>

                            <!-- Value Proposition -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px; background-color: #f0f9ff; border-radius: 12px; border: 1px solid #bae6fd;">
                                <tr>
                                    <td style="padding: 16px 16px 6px 16px; border-bottom: 2px solid #bae6fd;">
                                        <h2 style="margin: 0; color: #0a2540; font-size: 16px; font-weight: 700;">Mit kap, ha termékeinket választja?</h2>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 14px 16px 18px 16px;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr><td style="padding: 4px 0; color: #334155; font-size: 13px; line-height: 1.6;">✅ Stabil és kényelmes autótöltést a mindennapokban.</td></tr>
                                            <tr><td style="padding: 4px 0; color: #334155; font-size: 13px; line-height: 1.6;">✅ Megbízható technológiát és gondtalan működést.</td></tr>
                                            <tr><td style="padding: 4px 0; color: #334155; font-size: 13px; line-height: 1.6;">✅ 5 év gyártói garanciával védjük a befektetését.</td></tr>
                                            <tr><td style="padding: 4px 0; color: #334155; font-size: 13px; line-height: 1.6;">✅ Vásárlás után élethosszig tartó szakmai segítséget.</td></tr>
                                        </table>
                                        <p style="margin: 14px 0 0 0; color: #0369a1; font-size: 13px; font-weight: 700; font-style: italic;">Az EVIONOR-al a skandináv megbízhatóságot választja.</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Closing -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 2px solid #e2e8f0;">
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
                            <p style="margin: 0 0 4px 0; color: rgba(255,255,255,0.7); font-size: 12px;">EVIONOR Magyarország &copy; 2026</p>
                            <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 11px;">Elektromos autó töltési megoldások</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`.trim();

    setGeneratedEmail(htmlEmail);
    setEmailSubject(`B2B EV-töltő ajánlat – ${displayName} – Evionor`);
    setIsGenerating(false);
    toast.success("Email sikeresen generálva!");
  };

  const sendEmail = async () => {
    if (!generatedEmail || !email) return;
    setIsSending(true);
    try {
      const { data: emailData, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: email,
          subject: emailSubject || `B2B EV-töltő ajánlat – ${companyName || contactName}`,
          html: generatedEmail,
          from: `${senderName} - EVIONOR <hello@notifications.evionor.hu>`,
        },
      });
      if (error) throw error;
      if (emailData?.success) {
        toast.success(`Email elküldve: ${email}`);
        onEmailSent?.();
        throw new Error(emailData?.error || "Ismeretlen hiba");
      }
    } catch (error) {
      console.error("Email send error:", error);
      toast.error("Email küldési hiba");
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      const iframe = document.querySelector('iframe[title="B2B Email előnézet"]') as HTMLIFrameElement;
      if (iframe?.contentWindow) {
        const body = iframe.contentWindow.document.body;
        if (body) {
          const range = iframe.contentWindow.document.createRange();
          range.selectNodeContents(body);
          const selection = iframe.contentWindow.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
            try {
              await navigator.clipboard.write([
                new ClipboardItem({
                  "text/html": new Blob([body.innerHTML], { type: "text/html" }),
                  "text/plain": new Blob([body.innerText], { type: "text/plain" }),
                }),
              ]);
              toast.success("Email vágólapra másolva!");
            } catch {
              iframe.contentWindow.document.execCommand("copy");
              toast.success("Email vágólapra másolva!");
            }
          }
        }
      }
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Másolási hiba");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Ajánlat generátor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sender */}
          <div className="space-y-1.5">
            <Label className="text-xs">Ajánlatküldő</Label>
            <Select value={senderName} onValueChange={setSenderName}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Horváth Gáspár">Horváth Gáspár</SelectItem>
                <SelectItem value="Kovács Attila Tibor - EV-töltés szakértő">Kovács Attila Tibor</SelectItem>
                <SelectItem value="Kocsis Zsombor - EV-töltés szakértő">Kocsis Zsombor</SelectItem>
                <SelectItem value="Nagy István">Nagy István</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Charger selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Töltő kiválasztás</Label>
            {selectedTemplates.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedTemplates.map(t => (
                  <div key={t.id} className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full text-xs">
                    <span>{t.products[0]}</span>
                    <button onClick={() => toggleTemplate(t)} className="hover:bg-primary/20 rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-1.5">
              {chargerTemplates.map(template => {
                const isSelected = selectedTemplates.find(t => t.id === template.id);
                const price = findProductPrice(template.products[0]);
                const discounted = applyDiscount(price);
                return (
                  <div
                    key={template.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all text-sm ${isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                    onClick={() => toggleTemplate(template)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{template.products[0]}</span>
                        <span className="text-muted-foreground ml-2">
                          {discountPercent > 0 ? (
                            <>
                              <span className="line-through mr-1">{formatPrice(price)}</span>
                              <span className="text-primary font-semibold">{formatPrice(discounted)}</span>
                            </>
                          ) : formatPrice(price)}
                        </span>
                      </div>
                      {isSelected && <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" /></div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Discount */}
          <div className="space-y-1.5">
            <Label className="text-xs">Kedvezmény (%)</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={0}
                max={50}
                value={discountPercent}
                onChange={e => setDiscountPercent(Math.min(50, Math.max(0, parseInt(e.target.value) || 0)))}
                className="h-9 text-sm w-24"
              />
              <span className="text-xs text-muted-foreground">0-50%</span>
            </div>
          </div>

          <Separator />

          {/* Installation */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Switch checked={includeInstallation} onCheckedChange={setIncludeInstallation} />
              <Label className="text-xs">Telepítés hozzáadása</Label>
            </div>
            {includeInstallation && (
              <div className="space-y-2 pl-6">
                <Label className="text-xs">Kábel távolság</Label>
                <Select value={installationTier} onValueChange={setInstallationTier}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INSTALLATION_TIERS.map(tier => (
                      <SelectItem key={tier.value} value={tier.value}>
                        {tier.label} – {formatPrice(tier.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded space-y-0.5">
                  <p className="font-medium">Telepítési kedvezmények:</p>
                  <p>1 töltő: teljes ár</p>
                  <p>2 töltő: -25% a 2. telepítésre</p>
                  <p>3 töltő: -30% a 2-3. telepítésre</p>
                  <p>4+ töltő: egyedi ajánlat szükséges</p>
                </div>
                {(chargerCount || 1) >= 4 && (
                  <p className="text-xs text-destructive font-medium">⚠️ 4+ töltőnél egyedi telepítési ajánlat szükséges!</p>
                )}
              </div>
            )}
          </div>

          {/* Load management toggle */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Switch checked={includeLoadManagement} onCheckedChange={setIncludeLoadManagement} />
              <Label className="text-xs">Terhelésmenedzsment hozzáadása</Label>
            </div>
            {includeLoadManagement && (
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                <p className="font-medium">🔌 {detectLoadManager(selectedTemplates)?.name || "Terhelésmenedzser"}</p>
                <p>{formatPrice(detectLoadManager(selectedTemplates)?.grossPrice || 0)}</p>
              </div>
            )}
          </div>

          <Separator />

          <Button onClick={generateEmail} disabled={selectedTemplates.length === 0 || isGenerating} className="w-full">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
            Email generálása
          </Button>
        </CardContent>
      </Card>

      {/* Generated email preview */}
      {generatedEmail && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Email előnézet</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={async () => {
                  await navigator.clipboard.writeText(emailSubject);
                  toast.success("Tárgy másolva!");
                }}>
                  <Copy className="h-3 w-3 mr-1" /> Tárgy
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={copyToClipboard}>
                  <Copy className="h-3 w-3 mr-1" /> Email
                </Button>
                <Button size="sm" className="h-8 text-xs" onClick={sendEmail} disabled={isSending}>
                  <Mail className="h-3 w-3 mr-1" /> {isSending ? "Küldés..." : "Küldés"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground mb-2 p-2 bg-muted rounded">
              <strong>Tárgy:</strong> {emailSubject}
            </div>
            <iframe
              srcDoc={generatedEmail}
              className="w-full border rounded-lg"
              style={{ minHeight: "600px" }}
              title="B2B Email előnézet"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
