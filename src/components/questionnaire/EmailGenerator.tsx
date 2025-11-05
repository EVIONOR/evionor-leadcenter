import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionnaireData, chargerTemplates, ChargerTemplate } from "@/types/questionnaire";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Copy, Mail } from "lucide-react";
import { toast } from "sonner";
import { additionalItemPrices, formatPrice, priceList } from "@/data/priceList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface EmailGeneratorProps {
  data: QuestionnaireData;
}

const additionalItems = [
  "RFID Tag",
  "Terhelésmenedzsment rendszer",
  "Szabadon álló oszlop",
  "Fali hátlap kábeltartóval",
  "Töltőkábel (3m / 5m / 7m / 10m)",
  "Kábel akasztó",
  "Type 2-es fejtartó",
];

export const EmailGenerator = ({ data }: EmailGeneratorProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ChargerTemplate | null>(null);
  const [selectedAdditionals, setSelectedAdditionals] = useState<string[]>([]);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [senderName, setSenderName] = useState<string>("Nagy István");

  // Termék URL mapping
  const productUrls: { [key: string]: string } = {
    "Charge Amps Halo": "https://evionor.hu/termek/charge-amps-halo/",
    "Amina 1 (nincs kilógó kábel)": "https://evionor.hu/termek/amina-1/",
    "Easee Charge Up": "https://evionor.hu/termek/easee-charge-up/",
    "Zaptec Go": "https://evionor.hu/termek/zaptec-go/",
    "Zaptec Go 2": "https://evionor.hu/termek/zaptec-go-2/"
  };

  // Termék URL lekérése
  const getProductUrl = (productName: string): string => {
    return productUrls[productName] || "https://evionor.hu/webshop/";
  };

  // Ár keresés a termék névből
  const findProductPrice = (productName: string): number => {
    // Normalizáljuk a neveket összehasonlításhoz
    const normalizedSearch = productName.toLowerCase()
      .replace(/\s+/g, ' ')
      .replace('+ load balance', '')
      .replace('+ solar load balancing', '')
      .trim();
    
    const product = priceList.find(p => {
      const normalizedProductName = p.name.toLowerCase().replace(/\s+/g, ' ');
      return normalizedProductName.includes(normalizedSearch.split(' ')[0]) && 
             normalizedProductName.includes(normalizedSearch.split(' ')[1] || '');
    });
    
    return product?.price || 0;
  };

  // Eldönti, hogy a név cég-e vagy ember
  const isCompanyName = (name: string): boolean => {
    const companyIndicators = ['kft', 'bt', 'zrt', 'nyrt', 'ltd', 'inc', 'corp', 'gmbh', 'kkt', 'ev'];
    const lowerName = name.toLowerCase();
    return companyIndicators.some(indicator => lowerName.includes(indicator)) || name.includes('.');
  };

  // Megszólítás generálása
  const getGreeting = (name: string): string => {
    if (isCompanyName(name)) {
      return "Tisztelt Ügyfelünk!";
    }
    return `Tisztelt ${name},`;
  };

  // Intelligens sablon ajánlás
  const recommendedTemplate = chargerTemplates.find(template => {
    if (data.solarIntegration !== "nem") return template.id === "template4";
    if (data.phases === "3") return template.id === "template3";
    if (data.needsApp) return template.id === "template1";
    return template.id === "template2";
  });

  const generateEmail = () => {
    if (!selectedTemplate) return;

    // Számítsuk ki az összegeket
    const chargerPrices = selectedTemplate.products.map(product => findProductPrice(product));
    const chargerPrice = chargerPrices.length > 0 ? chargerPrices[0] : (selectedTemplate.basePrice || 0);
    
    // Telepítési ár a távolság alapján
    const distance = parseFloat(data.distanceFromBox) || 0;
    let installationPrice = 0;
    if (distance <= 10) {
      installationPrice = 249000;
    } else if (distance <= 20) {
      installationPrice = 299000;
    } else {
      installationPrice = 299000 + ((distance - 20) * 15000); // 20m felett további 15k/méter
    }

    const additionalTotal = selectedAdditionals.reduce((sum, item) => {
      return sum + (additionalItemPrices[item] || 0);
    }, 0);

    const grandTotal = chargerPrice + installationPrice;

    const email = `
<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Töltő Telepítési Ajánlat</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0071e3 0%, #005bb5 100%); padding: 16px 32px; text-align: center;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                <tr>
                    <td align="center">
                        <table cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; display: inline-block;">
                            <tr>
                                <td style="padding: 16px 32px;">
                                    <a href="https://evionor.hu" target="_blank" style="display: block; text-decoration: none;">
                                        <img src="https://evionor.hu/cdn/shop/files/evionor-logo.png?v=1761743181" alt="Evionor Logo" width="480" style="height: auto; display: block; border: 0;" />
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Töltő Telepítési Ajánlat</h1>
            <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Személyre szabott megoldás az Ön igényeihez</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 32px;">
            
            <!-- Intro -->
            <p style="margin: 0 0 32px 0; color: #374151; font-size: 15px; line-height: 1.6;">${getGreeting(data.contactName)}</p>
            <p style="margin: 0 0 40px 0; color: #374151; font-size: 15px; line-height: 1.6;">Köszönjük érdeklődését! Az Ön által megadott adatok alapján az alábbi ajánlatot készítettük.</p>

            <!-- Client Data Section -->
            <div style="margin-bottom: 24px; background-color: #f3f4f6; padding: 24px; border-radius: 12px; border: 2px solid #e5e7eb;">
                <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 600; border-bottom: 2px solid #d1d5db; padding-bottom: 12px;">Ügyfél adatok</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px; width: 40%;">Ügyfél</td>
                        <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">${data.contactName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">E-mail</td>
                        <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">${data.email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Telefonszám</td>
                        <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">${data.phoneNumber}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Jármű</td>
                        <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">${data.customCar ? data.customCar : `${data.carBrand} ${data.carModel}`}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Helyszín</td>
                        <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">${data.city}, ${data.zipCode}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Épület típus</td>
                        <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">${data.buildingType.replace("_", " ")}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Elektromos rendszer</td>
                        <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">${data.phases} fázis, ${data.amperage} A</td>
                    </tr>
                </table>
            </div>

            <!-- Charger Section -->
            <div style="margin-bottom: 24px; background-color: #f3f4f6; padding: 24px; border-radius: 12px; border: 2px solid #e5e7eb;">
                <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 600; border-bottom: 2px solid #d1d5db; padding-bottom: 12px;">Ajánlott töltők</h2>
                <p style="margin: 0 0 20px 0; color: #0071e3; font-size: 16px; font-weight: 600;">${selectedTemplate.name}</p>
                
                ${selectedTemplate.products.map((product, index) => {
                  const price = findProductPrice(product);
                  const productUrl = getProductUrl(product);
                  return `
                    ${index > 0 ? '<div style="text-align: center; margin: 16px 0;"><span style="display: inline-block; padding: 8px 24px; background: linear-gradient(135deg, #0071e3 0%, #005bb5 100%); color: white; font-weight: 600; font-size: 14px; border-radius: 20px;">VAGY</span></div>' : ''}
                    <div style="padding: 16px; background-color: white; border-radius: 8px; margin-bottom: ${index < selectedTemplate.products.length - 1 ? '0' : '20px'}; border: 1px solid #e5e7eb;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 0; width: 65%;"><a href="${productUrl}" style="color: #111827; font-size: 16px; font-weight: 600; text-decoration: none; border-bottom: 2px solid #0071e3; transition: color 0.2s;" onMouseOver="this.style.color='#0071e3'" onMouseOut="this.style.color='#111827'">${product}</a></td>
                                <td style="padding: 0 0 0 20px; color: #0071e3; font-size: 18px; font-weight: 700; text-align: right;">${formatPrice(price)}</td>
                            </tr>
                        </table>
                    </div>
                  `;
                }).join('')}
                
                <div style="margin-top: 20px; padding: 16px; background-color: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px; font-weight: 600;">Jellemzők:</p>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                        <li>${data.phases} fázis</li>
                        <li>${data.indoorOutdoor === "kültér" ? "Kültéri" : "Beltéri"} kivitel</li>
                        ${data.needsApp ? "<li>Okostelefonos vezérlés</li>" : ""}
                        ${data.loadManagement ? "<li>Terhelésmenedzsment</li>" : ""}
                        ${data.solarIntegration !== "nem" ? "<li>Napelemes integráció</li>" : ""}
                        ${data.builtInCable ? "<li>Beépített töltőkábel</li>" : ""}
                    </ul>
                </div>
            </div>

            <!-- Installation Section -->
            <div style="margin-bottom: 24px; background-color: #f3f4f6; padding: 24px; border-radius: 12px; border: 2px solid #e5e7eb;">
                <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 600; border-bottom: 2px solid #d1d5db; padding-bottom: 12px;">Telepítés</h2>
                
                <div style="padding: 16px; background-color: white; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 0; vertical-align: top; width: 70%;">
                                <p style="margin: 0 0 8px 0; color: #111827; font-size: 16px; font-weight: 600;">Telepítési díj (sztenderd telepítés) - ${data.distanceFromBox}m</p>
                                <p style="margin: 0; color: #6b7280; font-size: 13px;">
                                    ${distance <= 10 ? 'Telepítés 10 méterig' : distance <= 20 ? 'Telepítés 20 méterig' : `Telepítés ${distance} méterig`}
                                </p>
                            </td>
                            <td style="padding: 0 0 0 20px; color: #0071e3; font-size: 18px; font-weight: 700; text-align: right; vertical-align: top;">${formatPrice(installationPrice)}</td>
                        </tr>
                    </table>
                    <p style="margin: 16px 0 0 0; padding: 12px; background-color: #fef3c7; border-left: 3px solid #f59e0b; color: #78350f; font-size: 13px; line-height: 1.6;">
                        <strong>Megjegyzés:</strong> A végszámla helyszíni munkavégzés alapján kerül kiállításra, megrendelő által aláírt munkalap alapján.
                    </p>
                </div>

                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px; width: 40%;">Telepítési hely</td>
                        <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">${data.installLocation}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Rögzítési felület</td>
                        <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">${data.mountingSurface}</td>
                    </tr>
                </table>
                
                ${data.needsBackplate || data.needsPole || data.needsElectricalPlanning || data.overvoltageProtection || data.infrastructureDevelopment || data.networkExpansion ? `
                <div style="margin-top: 16px; padding: 16px; background-color: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: 600;">További telepítési követelmények:</p>
                    <ul style="margin: 0 0 12px 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                        ${data.needsBackplate ? "<li>Hátlap szükséges</li>" : ""}
                        ${data.needsPole ? "<li>Oszlop szükséges</li>" : ""}
                        ${data.needsElectricalPlanning ? "<li>Villamos tervezés szükséges</li>" : ""}
                        ${data.overvoltageProtection ? "<li>Túlfeszültség védelem</li>" : ""}
                        ${data.infrastructureDevelopment && data.infrastructureDetails ? `<li>Infrastruktúra fejlesztés: ${data.infrastructureDetails}</li>` : ""}
                        ${data.networkExpansion ? `<li>Hálózatbővítés: ${data.expansionPhase} fázis, ${data.expansionAmperage} A</li>` : ""}
                    </ul>
                    <p style="margin: 0; padding: 12px; background-color: #eff6ff; border-left: 3px solid #3b82f6; color: #1e3a8a; font-size: 13px; line-height: 1.6;">
                        <strong>Megjegyzés:</strong> A sztenderd telepítési tartalmon túli munkavégzésről a helyszínen készül lista. Az árlistája a <a href="https://www.evionor.hu" style="color: #0071e3; text-decoration: underline;">honlapunkon elérhető</a>.
                    </p>
                </div>
                ` : ""}
                
                ${data.groundworkWallPenetration ? `
                <div style="margin-top: 16px; padding: 16px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">Földmunka/Faláttörés:</p>
                    <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">${data.groundworkWallPenetration}</p>
                </div>
                ` : ""}
            </div>

            ${selectedAdditionals.length > 0 ? `
            <!-- Accessories Section -->
            <div style="margin-bottom: 24px; background-color: #f3f4f6; padding: 24px; border-radius: 12px; border: 2px solid #e5e7eb;">
                <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 600; border-bottom: 2px solid #d1d5db; padding-bottom: 12px;">Kiegészítők</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    ${selectedAdditionals.map(item => `
                    <tr>
                        <td style="padding: 12px 0; color: #374151; font-size: 14px; width: 65%;">${item}</td>
                        <td style="padding: 12px 0 12px 20px; color: #111827; font-size: 14px; font-weight: 500; text-align: right;">${formatPrice(additionalItemPrices[item] || 0)}</td>
                    </tr>
                    `).join("")}
                </table>
            </div>
            ` : ""}

            <!-- Standard Installation Description -->
            <div style="margin-bottom: 24px; background-color: #f3f4f6; padding: 24px; border-radius: 12px; border: 2px solid #e5e7eb;">
                <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 600; border-bottom: 2px solid #d1d5db; padding-bottom: 12px;">Sztenderd telepítés</h2>
                <div style="padding: 16px; background-color: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px; line-height: 1.8;">
                        A telepítés magában foglalja:
                    </p>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                        <li>Le Grand Fi relé beépítése</li>
                        <li>Kismegszakító meglévő villamosszekrénybe szerelése szakszerűen</li>
                        <li>Kültéri vagy beltéri kábelezés kialakítása igény szerint a töltőállomásig</li>
                        <li>Vésés, csövezés és faláttörési munkálatok szükség szerint</li>
                        <li>Töltőállomás szakszerű felszerelése és beüzemelése</li>
                        <li>Átadás és használatba vétel</li>
                    </ul>
                </div>
            </div>

            <!-- Installation Price Section -->
            <div style="margin-bottom: 40px; background-color: #f3f4f6; padding: 24px; border-radius: 12px; border: 2px solid #0071e3;">
                <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 600; border-bottom: 2px solid #d1d5db; padding-bottom: 12px;">Árkalkuláció</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 12px 0; color: #374151; font-size: 14px; width: 65%;">Töltő berendezés</td>
                        <td style="padding: 12px 0 12px 20px; color: #111827; font-size: 14px; font-weight: 500; text-align: right;">${formatPrice(chargerPrice)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #374151; font-size: 14px;">Telepítés (${data.distanceFromBox}m)</td>
                        <td style="padding: 12px 0 12px 20px; color: #111827; font-size: 14px; font-weight: 500; text-align: right;">${formatPrice(installationPrice)}</td>
                    </tr>
                    <tr style="border-top: 2px solid #0071e3;">
                        <td style="padding: 16px 0; color: #111827; font-size: 18px; font-weight: 700;">Végösszeg:</td>
                        <td style="padding: 16px 0 16px 20px; color: #0071e3; font-size: 22px; font-weight: 700; text-align: right;">${formatPrice(grandTotal)}</td>
                    </tr>
                </table>
                <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                    <strong>Telepítési díj tartalmazza:</strong> Szakszerű telepítést, bekötést, beüzemelést és átadást. 
                    ${distance > 20 ? `20m feletti vezetékvezeték esetén méterenként +${formatPrice(15000)} felár.` : ""}
                </p>
                <p style="margin: 12px 0 0 0; color: #9ca3af; font-size: 11px; font-style: italic;">
                    Az árak bruttó árak, a 27% ÁFÁ-t tartalmazzák.
                </p>
            </div>

            <!-- Process Section -->
            <div style="margin-bottom: 40px; background-color: #f9fafb; padding: 24px; border-radius: 12px;">
                <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 600;">Folyamat</h2>
                <ol style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 2;">
                    <li>Webshop megrendelés leadása</li>
                    <li>Telepítés ütemezése</li>
                    <li>Szakszerű kivitelezés 10 munkanapon belül</li>
                </ol>
            </div>

            ${data.otherComments ? `
            <!-- Other Comments -->
            <div style="margin-bottom: 40px; padding: 20px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <h2 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: 600;">Egyéb megjegyzések</h2>
                <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">${data.otherComments}</p>
            </div>
            ` : ""}

            <!-- Closing -->
            <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">További kérdés esetén állunk rendelkezésére!</p>
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Üdvözlettel,</p>
                <p style="margin: 0 0 16px 0; color: #111827; font-size: 14px; font-weight: 600;">${senderName}</p>
                <p style="margin: 0 0 4px 0; color: #111827; font-size: 14px; font-weight: 600;">Az EVIONOR Csapata</p>
                <p style="margin: 0 0 4px 0; color: #0071e3; font-size: 14px;">+36 20 581 9166</p>
                <p style="margin: 0 0 4px 0; color: #0071e3; font-size: 14px;"><a href="mailto:info@evionor.hu" style="color: #0071e3; text-decoration: none;">info@evionor.hu</a></p>
                <p style="margin: 0; color: #0071e3; font-size: 14px;"><a href="https://www.evionor.hu" style="color: #0071e3; text-decoration: none;">www.evionor.hu</a></p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #9ca3af; font-size: 13px;">EVIONOR 2025 minden jog fenntartva</p>
        </div>
    </div>
</body>
</html>
    `.trim();

    setGeneratedEmail(email);
    toast.success("Email sikeresen generálva!");
  };

  const copyToClipboard = async () => {
    try {
      // Az iframe tartalmat jelöljük ki és másoljuk
      const iframe = document.querySelector('iframe[title="Email előnézet"]') as HTMLIFrameElement;
      if (iframe?.contentWindow) {
        const iframeDocument = iframe.contentWindow.document;
        const bodyContent = iframeDocument.body;
        
        if (bodyContent) {
          // Kijelöljük a teljes tartalmat
          const range = iframeDocument.createRange();
          range.selectNodeContents(bodyContent);
          
          const selection = iframe.contentWindow.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Modern clipboard API használata HTML formátumban
            try {
              await navigator.clipboard.write([
                new ClipboardItem({
                  'text/html': new Blob([bodyContent.innerHTML], { type: 'text/html' }),
                  'text/plain': new Blob([bodyContent.innerText], { type: 'text/plain' })
                })
              ]);
              toast.success("Email kijelölve és vágólapra másolva!");
            } catch (clipboardError) {
              // Fallback régebbi böngészőkhöz
              iframe.contentWindow.document.execCommand('copy');
              toast.success("Email kijelölve és vágólapra másolva!");
            }
          }
        }
      }
    } catch (error) {
      console.error('Másolási hiba:', error);
      toast.error("Hiba történt a másolás során. Próbálja újra!");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
          <CardTitle className="text-2xl">Email generátor</CardTitle>
          <CardDescription>Válasszon sablont és kiegészítőket az ajánlathoz</CardDescription>
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
                <SelectItem value="Nagy István">Nagy István</SelectItem>
                <SelectItem value="Horváth Gáspár">Horváth Gáspár</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Sablon választás */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Válasszon töltő sablont</h3>
            {recommendedTemplate && (
              <div className="mb-3 p-3 bg-secondary/20 rounded-lg border border-secondary">
                <p className="text-sm font-medium text-foreground">
                  ⭐ Ajánlott: {recommendedTemplate.name}
                </p>
              </div>
            )}
            <div className="space-y-2">
              {chargerTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{template.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.products.join(", ")}
                      </p>
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
          <Button
            onClick={generateEmail}
            disabled={!selectedTemplate}
            size="lg"
            className="w-full"
          >
            <Mail className="mr-2 h-4 w-4" />
            Email generálása
          </Button>
        </CardContent>
      </Card>

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
              Az alábbi előnézet mutatja, hogy néz majd ki az email. Az "Email másolása" gombbal kijelölöd és vágólapra másolod a teljes emailt, amit be tudsz illeszteni Gmail-be vagy bármilyen email kliensbe.
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
