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
      url: "https://evionor.hu/collections/all/products/zaptec-sense-gen-ct-clamp-csomag-ev-mero?_pos=14&_fid=c1e909eaa&_ss=c"
    };
  }
  if (productName.includes("Easee")) {
    return {
      name: "Easee Equalizer Terhelésmenedzsment",
      price: 143000,
      url: "https://evionor.hu/collections/all/products/easee-equalizer-amp-csomag-ev-mero?_pos=9&_fid=c1e909eaa&_ss=c"
    };
  }
  if (productName.includes("Charge Amps")) {
    return {
      name: "Charge Amps Amp Guard Terhelésmenedzment",
      price: 132000,
      url: "https://evionor.hu/collections/all/products/charge-amps-amp-guard-63a-ev-mero?_pos=10&_fid=53fe77cfa&_ss=c"
    };
  }
  return null;
};

export const EmailGenerator = ({ data, autoGenerate = false }: EmailGeneratorProps) => {
  const [selectedTemplates, setSelectedTemplates] = useState<ChargerTemplate[]>([]);
  const [selectedAdditionals, setSelectedAdditionals] = useState<string[]>([]);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [senderName, setSenderName] = useState<string>(autoGenerate ? "Horváth Gáspár" : "Nagy István");

  // Auto-select templates based on phase when autoGenerate is true
  useEffect(() => {
    if (autoGenerate && selectedTemplates.length === 0) {
      const templates: ChargerTemplate[] = [];
      if (data.phases === "1") {
        // 1 phase: amina 1, charge amps halo
        const amina = chargerTemplates.find(t => t.id === "template2");
        const halo = chargerTemplates.find(t => t.id === "template1");
        if (amina) templates.push(amina);
        if (halo) templates.push(halo);
      } else if (data.phases === "3") {
        // 3 phase: zaptec go, easee charge up
        const zaptec = chargerTemplates.find(t => t.id === "template3b");
        const easee = chargerTemplates.find(t => t.id === "template3a");
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
    "AMINA 1 - 7.4kW (nincs kilógó kábel)": "https://evionor.hu/collections/all/products/amina-1-evtlt?_pos=1&_fid=bb7a6be86&_ss=c",
    "Easee Charge Up 22kW": "https://evionor.hu/collections/all/products/easee-charge-up-evtlt",
    "Zaptec Go 22kW": "https://evionor.hu/collections/all/products/zaptec-go-evtlt",
    "Zaptec Solar MID": "https://evionor.hu/collections/all/products/zaptec-go-2"
  };

  // Kosárba button URLs (product pages with installation)
  const cartUrls: { [key: string]: string } = {
    "AMINA 1 - 7.4kW (nincs kilógó kábel)": "https://evionor.hu/products/amina-1-1-fazisu-tolto-telepitessel",
    "Charge Amps Halo 11kW": "https://evionor.hu/products/charge-amps-halo-7-4kw-11kw-ev-tolto-telepites-csomag",
    "Charge Amps Luna 22kW": "https://evionor.hu/products/charge-amps-luna-22kw-ev-tolto-telepites-csomag",
    "Zaptec Go 22kW": "https://evionor.hu/products/zaptec-go-22kw-ev-tolto-telepitesi-csomgaban",
    "Zaptec Solar MID": "https://evionor.hu/products/zaptec-go-22kw-ev-tolto-telepitesi-csomgaban",
    "Easee Charge Up 22kW": "https://evionor.hu/products/easee-charge-up-22kw-ev-tolto-telepitesi-csomgaban"
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
  };

  // Ár keresés a termék névből
  const findProductPrice = (productName: string): number => {
    const normalizedSearch = productName.toLowerCase()
      .replace(/\s+/g, ' ')
      .replace('+ load balance', '')
      .replace('+ solar load balancing', '')
      .trim();
    
    // Pontos egyezés keresése először (pl. "Zaptec Go 2" vs "Zaptec Go")
    let product = priceList.find(p => {
      const normalizedProductName = p.name.toLowerCase().replace(/\s+/g, ' ');
      return normalizedProductName === normalizedSearch;
    });
    
    // Ha nincs pontos egyezés, próbáljuk meg a részleges keresést
    if (!product) {
      product = priceList.find(p => {
        const normalizedProductName = p.name.toLowerCase().replace(/\s+/g, ' ');
        const searchWords = normalizedSearch.split(' ');
        return searchWords.every(word => normalizedProductName.includes(word));
      });
    }
    
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
    return `Tisztelt ${name}!`;
  };

  // Intelligens sablon ajánlás
  const recommendedTemplate = chargerTemplates.find(template => {
    if (data.solarIntegration !== "nem") return template.id === "template4";
    if (data.phases === "3") return template.id === "template3a";
    if (data.needsApp) return template.id === "template1";
    return template.id === "template2";
  });

  // Töltő kiválasztása/törlése
  const toggleTemplate = (template: ChargerTemplate) => {
    const exists = selectedTemplates.find(t => t.id === template.id);
    if (exists) {
      setSelectedTemplates(selectedTemplates.filter(t => t.id !== template.id));
    } else {
      setSelectedTemplates([...selectedTemplates, template]);
    }
  };

  // Jellemzők generálása
  const getCharacteristics = (productName: string): string => {
    if (productName.includes("Easee Charge Up")) {
      return `
        <li style="font-size: 8px;">Töltőcsatlakozó: Type 2 kontakt, aljzat (IEC 62196-1/2)</li>
        <li style="font-size: 8px;">Fázisok: 1/3</li>
        <li style="font-size: 8px;">Tápellátás: 6-32A</li>
        <li style="font-size: 8px;">Maximális teljesítmény: 22 kW</li>
        <li style="font-size: 8px;">Hálózat: IT (230V) és TN (400V) (automatikus érzékelés)</li>
        <li style="font-size: 8px;">Töltési teljesítmény: Fokozatmentes (1A) beállítás 6A-32A között (1,4 - 22 kW)</li>
        <li style="font-size: 8px;">Üzemi feszültség: 230V - 400 VAC</li>
        <li style="font-size: 8px;">Frekvencia: 50 Hz</li>
        <li style="font-size: 8px;">Energiafogyasztás: <1 W készenléti üzemmódban</li>
        <li style="font-size: 8px;">Biztosíték méret: Max 40A</li>
        <li style="font-size: 8px;">Áramvédő kapcsoló (RCD): Beépített elektronikus RCD Type A (30mA) + 6mA DC-RCM / RDC-PD</li>
        <li style="font-size: 8px;">Üzemi hőmérséklet: -30°C és +50°C között</li>
        <li style="font-size: 8px;">Hitelesítés: RFID/NFC, 13,56 MHz / Alkalmazás</li>
        <li style="font-size: 8px;">WiFi: 802.11 b/g/n (2,4 GHz)</li>
        <li style="font-size: 8px;">Bluetooth: 4.3</li>
        <li style="font-size: 8px;">Telekommunikáció: eSIM - 4G/LTE Cat M1</li>
        <li style="font-size: 8px;">Kommunikációs protokollok: Bluetooth Low Energy (BLE 4.3), WiFi, RFID/NFC és OCPP 1.6J</li>
        <li style="font-size: 8px;">Harmadik fél integráció: OCPP 1.6J 4G/WiFi-n és API-n keresztül</li>
        <li style="font-size: 8px;">Funkciók: Terhelésmenedzsment max. 3 töltőállomáshoz, Vezeték nélküli terhelésmenedzsment a főbiztosítékhoz, Energiamérő, Lágy indítás</li>
        <li style="font-size: 8px;">Energia szabályozás és okos otthonokra felkészítve</li>
        <li style="font-size: 8px;">Energiamérő: Integrált mérő +/- 3% pontossággal</li>
        <li style="font-size: 8px;">Lopásvédelem: Elektronika deaktiválható és nyomon követhető, rejtett lakattal rögzíthető, kábel lezárható</li>
        <li style="font-size: 8px;">Szoftverfrissítések: Automatikus frissítések (ár tartalmazza)</li>
        <li style="font-size: 8px;">Védelmi osztály: IP54</li>
        <li style="font-size: 8px;">UV védelem: UV álló</li>
        <li style="font-size: 8px;">Szigetelési osztály: II (4kV AC és 6kV impulzus)</li>
        <li style="font-size: 8px;">Túláram osztály: >III (4kV)</li>
        <li style="font-size: 8px;">Garancia: 5 év</li>
      `;
    }
    if (productName.includes("Zaptec Solar MID")) {
      return `
        <li style="font-size: 8px;">Töltőcsatlakozó: Type 2 (IEC 62196-1/2)</li>
        <li style="font-size: 8px;">Fázisok száma: 1/3</li>
        <li style="font-size: 8px;">Tápellátás: 6-32A</li>
        <li style="font-size: 8px;">Hálózat: IT (230V) és TN (400V)</li>
        <li style="font-size: 8px;">Töltőáram: vezeték nélküli beállítás 6A-32A között (1,3-22kW)</li>
        <li style="font-size: 8px;">Üzemi feszültség: 230V-400V</li>
        <li style="font-size: 8px;">Földzárlat védelem: Beépített elektronikus DC-szűrő 6mA</li>
        <li style="font-size: 8px;">Üzemi hőmérséklet: -30°C és +40°C között</li>
        <li style="font-size: 8px;">Hitelesítés: RFID/NFC, 13,56 MHz / Alkalmazás</li>
        <li style="font-size: 8px;">WiFi: 802.11n</li>
        <li style="font-size: 8px;">Kommunikációs protokollok: Bluetooth Low Energy (BLE 4.1), RFID/NFC Mifare Classic, WiFi 2,4 GHz, 4G LTE-M</li>
        <li style="font-size: 8px;">Funkciók: Terhelésmenedzsment, Napelemes integrációval (Solar load balancing), Felhőalapú szolgáltatások, Energiamérés, Lágy indítás, Energia szabályozás, Okos otthonokra felkészítve</li>
        <li style="font-size: 8px;">Teljesítménymérés: Integrált energiamérő (~1% pontosság)</li>
        <li style="font-size: 8px;">Szoftverfrissítések: Automatikus letöltés</li>
        <li style="font-size: 8px;">Védelmi osztály: IP54</li>
        <li style="font-size: 8px;">Garancia: 5 év</li>
      `;
    }
    if (productName.includes("Zaptec Go 22kW") || (productName.includes("Zaptec Go") && !productName.includes("Solar"))) {
      return `
        <li style="font-size: 8px;">Töltőcsatlakozó: Type 2 (IEC 62196-1/2)</li>
        <li style="font-size: 8px;">Fázisok száma: 1/3</li>
        <li style="font-size: 8px;">Tápellátás: 6-32A</li>
        <li style="font-size: 8px;">Hálózat: IT (230V) és TN (400V)</li>
        <li style="font-size: 8px;">Töltőáram: vezeték nélküli beállítás 6A-32A között (1,3-22kW)</li>
        <li style="font-size: 8px;">Üzemi feszültség: 230V-400V</li>
        <li style="font-size: 8px;">Földzárlat védelem: Beépített elektronikus DC-szűrő 6mA</li>
        <li style="font-size: 8px;">Üzemi hőmérséklet: -30°C és +40°C között</li>
        <li style="font-size: 8px;">Hitelesítés: RFID/NFC, 13,56 MHz / Alkalmazás</li>
        <li style="font-size: 8px;">WiFi: 802.11n</li>
        <li style="font-size: 8px;">Kommunikációs protokollok: Bluetooth Low Energy (BLE 4.1), RFID/NFC Mifare Classic, WiFi 2,4 GHz, 4G LTE-M</li>
        <li style="font-size: 8px;">Funkciók: Terhelésmenedzsment, Felhőalapú szolgáltatások, Energiamérés, Lágy indítás, Energia szabályozás, Okos otthonokra felkészítve</li>
        <li style="font-size: 8px;">Teljesítménymérés: Integrált energiamérő (~1% pontosság)</li>
        <li style="font-size: 8px;">Szoftverfrissítések: Automatikus letöltés</li>
        <li style="font-size: 8px;">Védelmi osztály: IP54</li>
        <li style="font-size: 8px;">Garancia: 5 év</li>
      `;
    }
    if (productName.includes("Amina 1") || productName.includes("AMINA 1")) {
      return `
        <li style="font-size: 8px;">Töltőcsatlakozó: Type 2 kontakt (1-fázis, max. 7.4 kW)</li>
        <li style="font-size: 8px;">Fázisok száma: 1-fázis (IT, TT, TN)</li>
        <li style="font-size: 8px;">Tápellátás: 230 V AC, 1-fázis, 6–32 A</li>
        <li style="font-size: 8px;">Maximális töltési teljesítmény: 7.4 kW</li>
        <li style="font-size: 8px;">Töltőáram: Fokozatmentes beállítás 6–32 A-ig (max. 7.4 kW-ig)</li>
        <li style="font-size: 8px;">Üzemi feszültség: 230 V AC (±20%) – 1-fázis</li>
        <li style="font-size: 8px;">Energiafogyasztás: <1 W (készenléti üzemmódban)</li>
        <li style="font-size: 8px;">Biztosíték: Max 40A</li>
        <li style="font-size: 8px;">Földzárlat védelem: Beépített RDC-DD (6 mA) IEC 62955 szerint</li>
        <li style="font-size: 8px;">Üzemi hőmérséklet: -30°C és +40°C között</li>
        <li style="font-size: 8px;">WiFi: Nem támogatott</li>
        <li style="font-size: 8px;">Bluetooth: Nem támogatott</li>
        <li style="font-size: 8px;">Telekommunikáció: Nem támogatott</li>
        <li style="font-size: 8px;">Funkciók: Plug & Charge – egyszerű és helyi töltés alkalmazás vagy felhő nélkül</li>
        <li style="font-size: 8px;">Energia szabályozás: Nincs terhelésmenedzsment</li>
        <li style="font-size: 8px;">Energiamérő: Beépített – ±3% pontosság</li>
        <li style="font-size: 8px;">Védelmi osztály: IP54</li>
        <li style="font-size: 8px;">UV védelem: UV álló</li>
        <li style="font-size: 8px;">Túlfeszültség osztály: >III (4kV)</li>
        <li style="font-size: 8px;">Garancia: 5 év</li>
      `;
    }
    if (productName.includes("Charge Amps Halo")) {
      return `
        <li style="font-size: 8px;">Töltőcsatlakozó: Type 2 kontakt</li>
        <li style="font-size: 8px;">Fázisok száma: 1-fázis (3,7 kW verzió) vagy 3-fázis (11 kW verzió)</li>
        <li style="font-size: 8px;">Tápellátás: 230 V, 50 Hz, 16 A (1-fázis) / 400V (3-fázis)</li>
        <li style="font-size: 8px;">Maximális teljesítmény: 3,7 kW (1-fázis) / 11 kW (3-fázis)</li>
        <li style="font-size: 8px;">Töltőáram: 1-fázis, 16 A / 3-fázis, 16 A</li>
        <li style="font-size: 8px;">Üzemi feszültség: 230 V (1-fázis) / 400V (3-fázis)</li>
        <li style="font-size: 8px;">Üzemi hőmérséklet: -30°C és +45°C között</li>
        <li style="font-size: 8px;">Kábel: 7,5 m hosszú, megerősített, hajlékony -25°C-ig</li>
        <li style="font-size: 8px;">Áramvédő kapcsoló: Beépített DC-védelem, Type A földzárlat-védő szükséges</li>
        <li style="font-size: 8px;">WiFi: Igen (külső WiFi antenna)</li>
        <li style="font-size: 8px;">RFID azonosítás: Igen, 13,56 MHz</li>
        <li style="font-size: 8px;">Funkciók: RFID hozzáférés-szabályozás, Extra konnektor (e-bike, motorvärmer), Felhőalapú szolgáltatások, LED jelzőfények</li>
        <li style="font-size: 8px;">Energiamérő: 1-3 fázis feszültség, áram és teljesítmény mérés</li>
        <li style="font-size: 8px;">Szoftverfrissítések: Automatikus frissítések felhőn keresztül</li>
        <li style="font-size: 8px;">Védelmi osztály: Töltőtest IP66, töltőcsatlakozó és konnektor IP44</li>
        <li style="font-size: 8px;">Anyag: Újrahasznosított alumínium</li>
        <li style="font-size: 8px;">Tervezés és gyártás: Svédország</li>
        <li style="font-size: 8px;">Garancia: 5 év</li>
      `;
    }
    if (productName.includes("Charge Amps Luna")) {
      return `
        <li style="font-size: 8px;">Töltőcsatlakozó: Type 2, 22 kW</li>
        <li style="font-size: 8px;">Fázisok száma: 1/3</li>
        <li style="font-size: 8px;">Tápellátás: 6-32A</li>
        <li style="font-size: 8px;">Maximális töltési teljesítmény: 22 kW</li>
        <li style="font-size: 8px;">Töltőáram: Fokozatmentes (1A) beállítás 6A-32A között (1,4 - 22 kW)</li>
        <li style="font-size: 8px;">Üzemi feszültség: 230V - 400VAC</li>
        <li style="font-size: 8px;">Frekvencia: 50 Hz</li>
        <li style="font-size: 8px;">Energiafogyasztás: <1W készenléti üzemmódban</li>
        <li style="font-size: 8px;">Biztosíték: Max 40A</li>
        <li style="font-size: 8px;">Földzárlat védelem: Beépített Type B áramvédő (IEC 60947-2, AC: 30 mA, DC: 6 mA)</li>
        <li style="font-size: 8px;">Üzemi hőmérséklet: -35°C és +45°C között</li>
        <li style="font-size: 8px;">Hitelesítés: RFID</li>
        <li style="font-size: 8px;">WiFi: 802.11 b/g/n/ax</li>
        <li style="font-size: 8px;">Bluetooth: Version 5.0 and LE 5.3</li>
        <li style="font-size: 8px;">Telekommunikáció: eSIM - 4G</li>
        <li style="font-size: 8px;">Kommunikációs protokollok: WiFi, 4G LTE (eSIM), Bluetooth Low Energy 5.0/5.3, RFID/NFC, OCPP 1.6J</li>
        <li style="font-size: 8px;">Funkciók: Terhelésmenedzsment (vezeték nélküli), WiFi/4G applikációval (Charge Amps app), ISO 15118 ready</li>
        <li style="font-size: 8px;">Energiamérő: Integrált energiamérő +/- 3% pontosság</li>
        <li style="font-size: 8px;">Szoftverfrissítések: Automatikus frissítések</li>
        <li style="font-size: 8px;">Védelmi osztály: IP54</li>
        <li style="font-size: 8px;">Földzárlat védelem és lágy indítás</li>
        <li style="font-size: 8px;">Ütésállóság: IK10</li>
        <li style="font-size: 8px;">UV védelem: UV álló</li>
        <li style="font-size: 8px;">Garancia: 5 év</li>
      `;
    }
    return "";
  };

  const generateEmail = () => {
    if (selectedTemplates.length === 0) return;

    // Telepítési ár a távolság alapján
    const distance = parseFloat(data.distanceFromBox) || 0;
    let installationPrice = 0;
    if (data.needsInstallation) {
      if (distance <= 10) {
        installationPrice = 249000;
      } else if (distance <= 20) {
        installationPrice = 299000;
      } else {
        installationPrice = 299000 + ((distance - 20) * 15000);
      }
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
    <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0071e3 0%, #005bb5 100%); padding: 24px 32px; text-align: center;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                    <td align="center">
                        <table cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 24px; display: inline-block;" bgcolor="#ffffff">
                            <tr>
                                <td style="padding: 20px 32px; background-color: #ffffff; border-radius: 24px;" bgcolor="#ffffff">
                                    <a href="https://evionor.hu" target="_blank" style="display: block; text-decoration: none;">
                                        <img src="https://evionor.hu/cdn/shop/files/evionor-logo.png?v=1761743181" alt="Evionor Logo" width="240" style="height: auto; display: block; border: 0; background-color: #ffffff;" />
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">EV-Töltő Beszerzési Ajánlat</h1>
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
                    ${data.city && data.zipCode ? `
                    <tr>
                        <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Helyszín</td>
                        <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">${data.city}, ${data.zipCode}</td>
                    </tr>
                    ` : ""}
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

            <!-- Charger Sections - OSZLOP SZERŰEN -->
            ${selectedTemplates.map((template, templateIndex) => {
              const product = template.products[0];
              const chargerPrice = findProductPrice(product);
              const productUrl = getProductUrl(product);
              const loadManagementPackage = data.loadManagement ? getLoadManagementPackage(product) : null;
              const grandTotal = chargerPrice + (data.needsInstallation ? installationPrice : 0);
              
              return `
            ${templateIndex > 0 ? '<div style="margin: 32px 0; height: 2px; background: linear-gradient(90deg, transparent, #d1d5db 20%, #d1d5db 80%, transparent); opacity: 0.5;"></div>' : ''}
            
            <!-- Töltő ${templateIndex + 1}: ${template.name} -->
            <div style="margin-bottom: 32px; background-color: #f3f4f6; padding: 24px; border-radius: 12px; border: 2px solid #e5e7eb;">
                <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 600; border-bottom: 2px solid #d1d5db; padding-bottom: 12px;">Ajánlott töltő ${templateIndex + 1}</h2>
                <p style="margin: 0 0 20px 0; color: #0071e3; font-size: 16px; font-weight: 600;">${template.name}</p>
                
                <!-- Töltő kép -->
                ${getChargerImageUrl(product) ? `
                <div style="text-align: center; margin-bottom: 24px; padding: 20px; background-color: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <a href="${productUrl}" style="display: inline-block; text-decoration: none;">
                        <img src="${getChargerImageUrl(product)}" alt="${product}" style="max-width: 280px; width: 100%; height: auto; display: block; margin: 0 auto;" />
                    </a>
                </div>
                ` : ''}
                
                <div style="padding: 16px; background-color: white; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 0; width: 65%;"><a href="${productUrl}" style="color: #111827; font-size: 16px; font-weight: 600; text-decoration: none; border-bottom: 2px solid #0071e3; transition: color 0.2s;" onMouseOver="this.style.color='#0071e3'" onMouseOut="this.style.color='#111827'">${product}</a></td>
                            <td style="padding: 0 0 0 20px; color: #0071e3; font-size: 18px; font-weight: 700; text-align: right;">${formatPrice(chargerPrice)}</td>
                        </tr>
                    </table>
                </div>
                
                ${loadManagementPackage ? `
                <div style="padding: 16px; background-color: white; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 0; width: 65%;"><a href="${loadManagementPackage.url}" target="_blank" rel="noopener noreferrer" style="color: #111827; font-size: 16px; font-weight: 600; text-decoration: none; border-bottom: 2px solid #0071e3; transition: color 0.2s;" onMouseOver="this.style.color='#0071e3'" onMouseOut="this.style.color='#111827'">${loadManagementPackage.name} (opcionális)</a></td>
                            <td style="padding: 0 0 0 20px; color: #0071e3; font-size: 18px; font-weight: 700; text-align: right;">${formatPrice(loadManagementPackage.price)}</td>
                        </tr>
                    </table>
                </div>
                ` : ''}
                
                <div style="margin-top: 20px; padding: 16px; background-color: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px; font-weight: 600;">Jellemzők:</p>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                        ${getCharacteristics(product)}
                    </ul>
                </div>

                ${data.needsInstallation ? `
                <!-- Installation Section -->
                <div style="margin-top: 20px; background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 16px; font-weight: 600;">Telepítés</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 0; vertical-align: top; width: 70%;">
                                <p style="margin: 0 0 4px 0; color: #111827; font-size: 14px; font-weight: 500;">Telepítési díj (sztenderd telepítés) - ${data.distanceFromBox}m</p>
                                <p style="margin: 0; color: #6b7280; font-size: 13px;">
                                    ${distance <= 10 ? 'Telepítés 10 méterig' : distance <= 20 ? 'Telepítés 20 méterig' : `Telepítés ${distance} méterig`}
                                </p>
                            </td>
                            <td style="padding: 0 0 0 20px; color: #0071e3; font-size: 16px; font-weight: 700; text-align: right; vertical-align: top;">${formatPrice(installationPrice)}</td>
                        </tr>
                    </table>
                </div>
                ` : ''}

                <!-- Price Summary for this charger -->
                <div style="margin-top: 24px; background-color: white; padding: 20px; border-radius: 8px; border: 2px solid #0071e3;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #374151; font-size: 14px; width: 65%;">Töltő berendezés</td>
                            <td style="padding: 8px 0 8px 20px; color: #111827; font-size: 14px; font-weight: 500; text-align: right;">${formatPrice(chargerPrice)}</td>
                        </tr>
                        ${data.needsInstallation ? `
                        <tr>
                            <td style="padding: 8px 0; color: #374151; font-size: 14px;">Telepítés (${data.distanceFromBox}m)</td>
                            <td style="padding: 8px 0 8px 20px; color: #111827; font-size: 14px; font-weight: 500; text-align: right;">${formatPrice(installationPrice)}</td>
                        </tr>
                        ` : ""}
                        <tr style="border-top: 2px solid #0071e3;">
                            <td style="padding: 12px 0; color: #111827; font-size: 16px; font-weight: 700;">Végösszeg:</td>
                            <td style="padding: 12px 0 12px 20px; color: #0071e3; font-size: 18px; font-weight: 700; text-align: right;">${formatPrice(grandTotal)}</td>
                        </tr>
                    </table>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="${getCartUrl(product)}" style="display: inline-block; background: linear-gradient(135deg, #0071e3 0%, #005bb5 100%); color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 600; box-shadow: 0 4px 12px rgba(0, 113, 227, 0.3);">Kosárba</a>
                    </div>
                </div>
            </div>
              `;
            }).join('')}

            ${selectedAdditionals.length > 0 ? `
            <!-- Accessories Section - CSAK EGYSZER -->
            <div style="margin-bottom: 24px; background-color: #f3f4f6; padding: 24px; border-radius: 12px; border: 2px solid #e5e7eb;">
                <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 600; border-bottom: 2px solid #d1d5db; padding-bottom: 12px;">Kiegészítők (opcionális)</h2>
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

            ${data.needsInstallation ? `
            ${data.needsBackplate || data.needsPole || data.needsElectricalPlanning || data.overvoltageProtection || data.infrastructureDevelopment || data.networkExpansion ? `
            <!-- Additional Installation Requirements -->
            <div style="margin-bottom: 24px; background-color: #f3f4f6; padding: 24px; border-radius: 12px; border: 2px solid #e5e7eb;">
                <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 600; border-bottom: 2px solid #d1d5db; padding-bottom: 12px;">További telepítési követelmények</h2>
                <div style="padding: 16px; background-color: white; border-radius: 8px; border: 1px solid #e5e7eb;">
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
            </div>
            ` : ""}

            ${data.groundworkWallPenetration ? `
            <div style="margin-bottom: 24px; padding: 16px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">Földmunka/Faláttörés:</p>
                <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">${data.groundworkWallPenetration}</p>
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
                        <li>Áramvédő kapcsoló (Legrand) beépítése meglévő szekrénybe</li>
                        <li>Kismegszakító (Legrand) beszerelése meglévő szekrénybe</li>
                        <li>Kültéri vagy beltéri kábelezés kialakítása igény szerint a töltőállomásig</li>
                        <li>Vésés, csövezés és faláttörési munkálatok szükség szerint</li>
                        <li>Töltőállomás szakszerű felszerelése</li>
                        <li>Beüzemelés és átadás</li>
                    </ul>
                </div>
            </div>
            ` : ""}

            <!-- Process Section -->
            <div style="margin-bottom: 40px; background-color: #f9fafb; padding: 24px; border-radius: 12px;">
                <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 600;">Folyamat</h2>
                <ol style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 2;">
                    ${data.needsInstallation ? `
                    <li>Webshop megrendelés leadása</li>
                    <li>Telepítés ütemezése</li>
                    <li>Szakszerű kivitelezés 10 munkanapon belül</li>
                    ` : `
                    <li>Webshop megrendelés leadása</li>
                    <li>Szállítás 5 munkanapon belül</li>
                    `}
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
            <p style="margin: 0; color: #9ca3af; font-size: 13px;">EVIONOR Magyarország 2025 ©</p>
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
                  'text/html': new Blob([bodyContent.innerHTML], { type: 'text/html' }),
                  'text/plain': new Blob([bodyContent.innerText], { type: 'text/plain' })
                })
              ]);
              toast.success("Email kijelölve és vágólapra másolva!");
            } catch (clipboardError) {
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Email generátor</CardTitle>
              <CardDescription className="mt-1">Válasszon töltőket és kiegészítőket az ajánlathoz</CardDescription>
            </div>
            {generatedEmail && (
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="mr-2 h-4 w-4" />
                Email másolása
              </Button>
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
                <SelectItem value="Nagy István">Nagy István</SelectItem>
                <SelectItem value="Horváth Gáspár">Horváth Gáspár</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Sablon választás - TÖBB TÖLTŐ */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Válasszon töltőket (több is kiválasztható)</h3>
            {recommendedTemplate && (
              <div className="mb-3 p-3 bg-secondary/20 rounded-lg border border-secondary">
                <p className="text-sm font-medium text-foreground">
                  ⭐ Ajánlott: {recommendedTemplate.name}
                </p>
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
                const isSelected = selectedTemplates.find(t => t.id === template.id);
                return (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => toggleTemplate(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{template.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {template.products.join(", ")}
                        </p>
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
          <Button
            onClick={generateEmail}
            disabled={selectedTemplates.length === 0}
            size="lg"
            className="w-full"
          >
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
