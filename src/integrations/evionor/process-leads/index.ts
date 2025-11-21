import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";
import { Resend } from "https://esm.sh/resend@4.0.0";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
Deno.serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    console.log("[process-leads] Starting automatic lead processing...");
    const evionorUrl = Deno.env.get("SUPABASE_URL");
    const evionorServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!evionorUrl || !evionorServiceKey) {
      throw new Error("EVIONOR Supabase credentials not configured");
    }
    const client = createClient(evionorUrl, evionorServiceKey, {
      auth: {
        persistSession: false
      }
    });
    // Step 1: Check if automatic processing is enabled
    console.log("[process-leads] Checking automatic processing setting...");
    const { data: settingData, error: settingError } = await client.from("lead_manager_settings").select("setting_value").eq("setting_key", "automatic_processing_enabled").single();
    if (settingError || !settingData?.setting_value?.enabled) {
      console.log("[process-leads] Automatic processing is disabled, skipping...");
      return new Response(JSON.stringify({
        success: true,
        message: "Automatic processing is disabled",
        processed: 0
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 200
      });
    }
    console.log("[process-leads] Automatic processing is enabled");
    // Step 2: Fetch all new leads (no time constraint)
    const { data: leads, error: leadsError } = await client.from("questionnaire_responses").select("*").eq("status", "new").order("created_at", {
      ascending: true
    });
    if (leadsError) {
      console.error("[process-leads] Error fetching leads:", leadsError);
      throw leadsError;
    }
    console.log(`[process-leads] Found ${leads?.length || 0} leads to process`);
    if (!leads || leads.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: "No leads to process",
        processed: 0
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 200
      });
    }
    // Step 3: Initialize Resend client
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }
    const resend = new Resend(resendApiKey);
    // Step 4: Prepare email payloads for batch sending
    console.log("[process-leads] Preparing email payloads for batch sending...");
    const emailPayloads = [];
    const leadsByIndex = [];
    for (const lead of leads){
      try {
        console.log(`[process-leads] Preparing email for lead ${lead.id} (${lead.email})`);
        // Apply "Fill Form" logic
        const leadData = {
          contactName: lead.name || "",
          email: lead.email || "",
          phoneNumber: lead.phone || "",
          carBrand: lead.car_brand || "",
          carModel: lead.car_model || "",
          location: lead.location || "",
          phases: lead.phases || "1"
        };
        // Apply "Autofill" logic
        const autofillData = {
          ...leadData,
          zipCode: "",
          city: "",
          amperage: "32",
          installLocation: "Garázs",
          buildingType: "",
          needsInstallation: true,
          needsElectricalPlanning: false,
          indoorOutdoor: "beltér",
          mountingSurface: "",
          needsBackplate: false,
          needsPole: false,
          distanceFromBox: "10",
          spaceInBox: "nemtudom",
          groundworkWallPenetration: "",
          otherComments: "",
          solarIntegration: "nem",
          loadManagement: true,
          builtInCable: false,
          needsApp: true,
          infrastructureDevelopment: false,
          infrastructureDetails: "",
          overvoltageProtection: false,
          networkExpansion: false,
          expansionPhase: "",
          expansionAmperage: ""
        };
        // Generate email HTML
        const emailSubject = `EVIONOR - Töltő ajánlat ${autofillData.contactName} részére`;
        const emailHtml = generateEmailHtml(autofillData);
        // Add to batch
        emailPayloads.push({
          from: "EVIONOR <hello@notifications.evionor.hu>",
          to: [
            lead.email
          ],
          subject: emailSubject,
          html: emailHtml,
          reply_to: "hello@evionor.hu"
        });
        leadsByIndex.push(lead);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[process-leads] Error preparing email for lead ${lead.id}:`, errorMsg);
      }
    }
    console.log(`[process-leads] Prepared ${emailPayloads.length} emails for batch sending`);
    if (emailPayloads.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: "No valid emails to send",
        processed: 0
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 200
      });
    }
    // Step 5: Send batch emails
    console.log("[process-leads] Sending batch emails...");
    const { data: batchData, error: batchError } = await resend.batch.send(emailPayloads);
    // Debug logging
    console.log("[process-leads] Batch response - data:", JSON.stringify(batchData, null, 2));
    console.log("[process-leads] Batch response - error:", JSON.stringify(batchError, null, 2));
    let processedCount = 0;
    let errorCount = 0;
    const errors = [];
    // Step 6: Update lead status for successfully sent emails
    // Note: Resend SDK returns { data: [{ id: string }, ...] }
    if (batchError) {
      console.error("[process-leads] Batch send error:", batchError);
      errors.push(`Batch send error: ${batchError}`);
      errorCount = emailPayloads.length;
    } else if (batchData?.data && Array.isArray(batchData.data)) {
      const emailResults = batchData.data;
      console.log(`[process-leads] Batch send successful. Received ${emailResults.length} responses`);
      // Update leads where emails were successfully sent (have an id in response)
      for(let i = 0; i < emailResults.length; i++){
        const emailResult = emailResults[i];
        const lead = leadsByIndex[i];
        if (emailResult?.id && lead) {
          try {
            const { error: updateError } = await client.from("questionnaire_responses").update({
              status: "qualified"
            }).eq("id", lead.id);
            if (updateError) {
              console.error(`[process-leads] Error updating lead ${lead.id}:`, updateError);
              errors.push(`Lead ${lead.id} (${lead.email}): Database update failed`);
              errorCount++;
            } else {
              console.log(`[process-leads] Lead ${lead.id} (${lead.email}) marked as qualified, email ID: ${emailResult.id}`);
              processedCount++;
            }
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error(`[process-leads] Error updating lead ${lead.id}:`, errorMsg);
            errors.push(`Lead ${lead.id} (${lead.email}): ${errorMsg}`);
            errorCount++;
          }
        } else {
          console.warn(`[process-leads] Email ${i} failed or missing lead data`);
          errorCount++;
          if (lead) {
            errors.push(`Lead ${lead.id} (${lead.email}): Email send failed`);
          }
        }
      }
    } else {
      console.error("[process-leads] Unexpected batch response:", batchData);
      errors.push("Unexpected batch response structure");
      errorCount = emailPayloads.length;
    }
    console.log(`[process-leads] Processing complete. Processed: ${processedCount}, Errors: ${errorCount}`);
    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${processedCount} leads with ${errorCount} errors`,
      processed: processedCount,
      errors: errorCount > 0 ? errors : undefined
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[process-leads] Fatal error:", errorMsg);
    return new Response(JSON.stringify({
      success: false,
      error: errorMsg
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
});
// Price list (from src/data/priceList.ts)
const priceList = [
  {
    name: "AMINA 1 - 7.4kW (nincs kilógó kábel)",
    price: 248000,
  },
  {
    name: "Easee Charge Up 22kW",
    price: 359000,
  },
  {
    name: "Zaptec Go 22kW",
    price: 353000,
  },
  {
    name: "Zaptec Solar MID",
    price: 505000,
  },
  {
    name: "Charge Amps Luna 22kW",
    price: 365000,
  },
  {
    name: "Charge Amps Halo 11kW",
    price: 299000,
  },
];
const formatPrice = (price)=>{
  return new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency: "HUF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};
const getLoadManagementPackage = (productName)=>{
  if (productName.includes("Zaptec")) {
    return {
      name: "Zaptec Sense Terhelésmenedzsment",
      price: 127000,
      url: "https://evionor.hu/collections/all/products/zaptec-sense-gen-ct-clamp-csomag-ev-mero"
    };
  }
  if (productName.includes("Easee")) {
    return {
      name: "Easee Equalizer Terhelésmenedzsment",
      price: 143000,
      url: "https://evionor.hu/collections/all/products/easee-equalizer-amp-csomag-ev-mero"
    };
  }
  if (productName.includes("Charge Amps")) {
    return {
      name: "Charge Amps Amp Guard Terhelésmenedzsment",
      price: 132000,
      url: "https://evionor.hu/collections/all/products/charge-amps-amp-guard-63a-ev-mero"
    };
  }
  return null;
};
// Product URLs
const productUrls = {
  "Charge Amps Halo 11kW": "https://evionor.hu/collections/all/products/charge-amps-halo-7-4kw-ev-tolto",
  "Charge Amps Luna 22kW": "https://evionor.hu/collections/all/products/charge-amps-luna-22kw-ev-tolto",
  "AMINA 1 - 7.4kW (nincs kilógó kábel)": "https://evionor.hu/collections/all/products/amina-1-evtlt",
  "Easee Charge Up 22kW": "https://evionor.hu/collections/all/products/easee-charge-up-evtlt",
  "Zaptec Go 22kW": "https://evionor.hu/collections/all/products/zaptec-go-evtlt",
  "Zaptec Solar MID": "https://evionor.hu/collections/all/products/zaptec-go-2"
};
const cartUrls = {
  "AMINA 1 - 7.4kW (nincs kilógó kábel)": "https://evionor.hu/products/amina-1-1-fazisu-tolto-telepitessel",
  "Charge Amps Halo 11kW": "https://evionor.hu/products/charge-amps-halo-7-4kw-11kw-ev-tolto-telepites-csomag",
  "Charge Amps Luna 22kW": "https://evionor.hu/products/charge-amps-luna-22kw-ev-tolto-telepites-csomag",
  "Zaptec Go 22kW": "https://evionor.hu/products/zaptec-go-22kw-ev-tolto-telepitesi-csomgaban",
  "Zaptec Solar MID": "https://evionor.hu/products/zaptec-go-22kw-ev-tolto-telepitesi-csomgaban",
  "Easee Charge Up 22kW": "https://evionor.hu/products/easee-charge-up-22kw-ev-tolto-telepitesi-csomgaban"
};
const getProductUrl = (productName)=>productUrls[productName] || "https://evionor.hu/webshop/";
const getCartUrl = (productName)=>cartUrls[productName] || "https://evionor.hu/webshop/";
const getChargerImageUrl = (productName)=>{
  if (productName.includes("Zaptec Solar MID")) {
    return "https://evionor.hu/cdn/shop/files/ZaptecGo2_Productimage_quater_asphaltblack.webp?v=1762325254&width=600";
  }
  if (productName.includes("Zaptec Go 22kW") || productName.includes("Zaptec Go") && !productName.includes("Solar")) {
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
const findProductPrice = (productName)=>{
  const normalizedSearch = productName.toLowerCase().replace(/\s+/g, " ").trim();
  const product = priceList.find((p)=>{
    const normalizedProductName = p.name.toLowerCase().replace(/\s+/g, " ");
    return normalizedProductName === normalizedSearch || normalizedProductName.includes(normalizedSearch);
  });
  return product?.price || 0;
};
const getCharacteristics = (productName)=>{
  if (productName.includes("Easee Charge Up")) {
    return `
      <li style="font-size: 14px;">Fázisok száma: 1/3</li>
      <li style="font-size: 14px;">Tápellátás: 6–32 A</li>
      <li style="font-size: 14px;">Földzárlat védelem: Beépített Type A áramvédő kapcsoló (30 mA) + 6 mA DC-védelem (RDC-PD)</li>
      <li style="font-size: 14px;">Üzemi hőmérséklet: -30°C és +50°C között</li>
      <li style="font-size: 14px;">Hitelesítés: RFID/NFC, mobilalkalmazás</li>
      <li style="font-size: 14px;">Kommunikációs protokollok: Bluetooth Low Energy, WiFi 2,4 GHz, RFID/NFC, 4G/LTE (eSIM), OCPP 1.6J</li>
      <li style="font-size: 14px;">Funkciók: Terhelésmenedzsment (max. 3 töltő), vezeték nélküli terhelésmenedzsment a főbiztosítékhoz, energiamérés, lágy indítás, okos otthon integráció</li>
      <li style="font-size: 14px;">Szoftverfrissítések: Automatikus frissítések</li>
      <li style="font-size: 14px;">Védelmi osztály: IP54</li>
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
  if (productName.includes("Zaptec Go 22kW") || productName.includes("Zaptec Go") && !productName.includes("Solar")) {
    return `
      <li style="font-size: 14px;">Fázisok száma: 1/3</li>
      <li style="font-size: 14px;">Tápellátás: 6–32 A</li>
      <li style="font-size: 14px;">Földzárlat védelem: Beépített elektronikus DC-szűrő 6 mA</li>
      <li style="font-size: 14px;">Üzemi hőmérséklet: -30°C és +40°C között</li>
      <li style="font-size: 14px;">Hitelesítés: RFID/NFC, mobilalkalmazás</li>
      <li style="font-size: 14px;">Kommunikációs protokollok: Bluetooth Low Energy, RFID/NFC, WiFi 2,4 GHz, 4G LTE-M</li>
      <li style="font-size: 14px;">Funkciók: Terhelésmenedzsment, felhőalapú szolgáltatások, energiamérés, lágy indítás, energia szabályozás, okos otthon integráció</li>
      <li style="font-size: 14px;">Szoftverfrissítések: Automatikus letöltés</li>
      <li style="font-size: 14px;">Védelmi osztály: IP54</li>
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
      <li style="font-size: 14px;">Funkciók: RFID hozzáférés-szabályozás, extra konnektor (pl. e-bike), felhőalapú szolgáltatások, LED jelzőfények</li>
      <li style="font-size: 14px;">Szoftverfrissítések: Automatikus frissítések felhőn keresztül</li>
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
      <li style="font-size: 14px;">Funkciók: Vezeték nélküli terhelésmenedzsment, felhőalapú szolgáltatások (Charge Amps app), ISO 15118 ready</li>
      <li style="font-size: 14px;">Szoftverfrissítések: Automatikus frissítések</li>
      <li style="font-size: 14px;">Védelmi osztály: IP54, ütésállóság IK10</li>
      <li style="font-size: 14px;">Garancia: 5 év</li>
    `;
  }
  return "";
};
const isCompanyName = (name)=>{
  const companyIndicators = [
    "kft",
    "bt",
    "zrt",
    "nyrt",
    "ltd",
    "inc",
    "corp",
    "gmbh",
    "kkt",
    "ev"
  ];
  const lowerName = name.toLowerCase();
  return companyIndicators.some((indicator)=>lowerName.includes(indicator)) || name.includes(".");
};
const getGreeting = (name)=>{
  if (isCompanyName(name)) {
    return "Tisztelt Ügyfelünk!";
  }
  return `Tisztelt ${name}!`;
};
// Email generation function (full template from EmailGenerator.tsx) - MOBILE OPTIMIZED
function generateEmailHtml(data) {
  // Auto-select products based on phase
  const selectedProducts = [];
  if (data.phases === "1") {
    selectedProducts.push("AMINA 1 - 7.4kW (nincs kilógó kábel)");
    selectedProducts.push("Charge Amps Halo 11kW");
  } else if (data.phases === "3") {
    selectedProducts.push("Zaptec Go 22kW");
    selectedProducts.push("Easee Charge Up 22kW");
  }
  // Calculate installation price based on distance
  const distance = parseFloat(data.distanceFromBox) || 0;
  let installationPrice = 0;
  if (data.needsInstallation) {
    if (distance <= 10) {
      installationPrice = 249000;
    } else if (distance <= 20) {
      installationPrice = 299000;
    } else {
      installationPrice = 299000 + (distance - 20) * 15000;
    }
  }
  const productSections = selectedProducts.map((product, index)=>{
    const chargerPrice = findProductPrice(product);
    const productUrl = getProductUrl(product);
    const loadManagementPackage = data.loadManagement ? getLoadManagementPackage(product) : null;
    const grandTotal = chargerPrice + (data.needsInstallation ? installationPrice : 0);
    return `
      ${index > 0 ? '<div style="margin: 32px 0; height: 2px; background: linear-gradient(90deg, transparent, #d1d5db 20%, #d1d5db 80%, transparent); opacity: 0.5;"></div>' : ""}
      
      <!-- Töltő ${index + 1}: ${product} -->
      <div class="product-section" style="margin-bottom: 32px; background-color: #f3f4f6; padding: 24px; border-radius: 12px; border: 2px solid #e5e7eb;">
        <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 600; border-bottom: 2px solid #d1d5db; padding-bottom: 12px;">Ajánlott töltő ${index + 1}</h2>
        <p style="margin: 0 0 20px 0; color: #0071e3; font-size: 16px; font-weight: 600; word-wrap: break-word;">${product}</p>
        
        <!-- Töltő kép -->
        ${getChargerImageUrl(product) ? `
        <div class="image-container" style="text-align: center; margin-bottom: 24px; padding: 20px; background-color: white; border-radius: 8px; border: 1px solid #e5e7eb;">
          <a href="${productUrl}" style="display: inline-block; text-decoration: none;">
            <img class="product-image" src="${getChargerImageUrl(product)}" alt="${product}" style="max-width: 280px; width: 100%; height: auto; display: block; margin: 0 auto;" />
          </a>
        </div>
        ` : ""}
        
        <div style="padding: 16px; background-color: white; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
          <table class="price-table" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 0; width: 60%;"><a href="${productUrl}" style="color: #111827; font-size: 16px; font-weight: 600; text-decoration: none; border-bottom: 2px solid #0071e3; word-wrap: break-word; display: inline-block;">${product}</a></td>
              <td style="padding: 0 0 0 16px; color: #0071e3; font-size: 18px; font-weight: 700; text-align: right;">${formatPrice(chargerPrice)}</td>
            </tr>
          </table>
        </div>
        
        <div style="margin-top: 20px; padding: 16px; background-color: white; border-radius: 8px; border: 1px solid #e5e7eb;">
          <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px; font-weight: 600;">Jellemzők:</p>
          <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8; word-wrap: break-word;">
            ${getCharacteristics(product)}
          </ul>
        </div>

        ${data.needsInstallation ? `
        <!-- Installation Section -->
        <div style="margin-top: 20px; background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 16px; font-weight: 600;">Telepítés</h3>
          <table class="price-table" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 0; vertical-align: top; width: 65%;">
                <p style="margin: 0 0 4px 0; color: #111827; font-size: 14px; font-weight: 500; word-wrap: break-word;">Telepítési díj (sztenderd telepítés) - ${data.distanceFromBox}m</p>
                <p style="margin: 0; color: #6b7280; font-size: 13px;">
                  ${distance <= 10 ? "Telepítés 10 méterig" : distance <= 20 ? "Telepítés 20 méterig" : `Telepítés ${distance} méterig`}
                </p>
              </td>
              <td style="padding: 0 0 0 16px; color: #0071e3; font-size: 16px; font-weight: 700; text-align: right; vertical-align: top;">${formatPrice(installationPrice)}</td>
            </tr>
          </table>
        </div>
        ` : ""}
        
        ${loadManagementPackage ? `
        <div style="padding: 16px; background-color: white; border-radius: 8px; margin-top: 20px; border: 1px solid #e5e7eb;">
          <table class="price-table" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 0; width: 60%;"><a href="${loadManagementPackage.url}" target="_blank" style="color: #111827; font-size: 16px; font-weight: 600; text-decoration: none; border-bottom: 2px solid #0071e3; word-wrap: break-word; display: inline-block;">${loadManagementPackage.name} (opcionális)</a></td>
              <td style="padding: 0 0 0 16px; color: #0071e3; font-size: 18px; font-weight: 700; text-align: right;">${formatPrice(loadManagementPackage.price)}</td>
            </tr>
          </table>
        </div>
        ` : ""}

        <!-- Price Summary for this charger -->
        <div style="margin-top: 24px; background-color: white; padding: 20px; border-radius: 8px; border: 2px solid #0071e3;">
          <table class="price-table" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #374151; font-size: 14px; width: 60%;">Töltő berendezés</td>
              <td style="padding: 8px 0 8px 16px; color: #111827; font-size: 14px; font-weight: 500; text-align: right;">${formatPrice(chargerPrice)}</td>
            </tr>
            ${data.needsInstallation ? `
            <tr>
              <td style="padding: 8px 0; color: #374151; font-size: 14px;">Telepítés (${data.distanceFromBox}m)</td>
              <td style="padding: 8px 0 8px 16px; color: #111827; font-size: 14px; font-weight: 500; text-align: right;">${formatPrice(installationPrice)}</td>
            </tr>
            ` : ""}
            <tr style="border-top: 2px solid #0071e3;">
              <td style="padding: 12px 0; color: #111827; font-size: 16px; font-weight: 700;">Végösszeg:</td>
              <td class="total-price" style="padding: 12px 0 12px 16px; color: #0071e3; font-size: 18px; font-weight: 700; text-align: right;">${formatPrice(grandTotal)}</td>
            </tr>
          </table>
          <div style="text-align: center; margin-top: 20px;">
            <a href="${getCartUrl(product)}" class="button-link" style="display: inline-block; background: linear-gradient(135deg, #0071e3 0%, #005bb5 100%); color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 600; box-shadow: 0 4px 12px rgba(0, 113, 227, 0.3);">Kosárba</a>
          </div>
        </div>
      </div>
    `;
  }).join("");
  return `<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>EV-Töltő Beszerzési Ajánlat</title>
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
      max-width: 100%;
    }
    
    @media only screen and (max-width: 600px) {
      .email-container {
        margin: 0 !important;
        border-radius: 0 !important;
        width: 100% !important;
      }
      
      .header-section {
        padding: 20px 16px !important;
      }
      
      .logo-container {
        padding: 16px 20px !important;
      }
      
      .logo-img {
        width: 180px !important;
      }
      
      .header-title {
        font-size: 20px !important;
      }
      
      .content-section {
        padding: 24px 16px !important;
      }
      
      .section-container {
        padding: 16px !important;
      }
      
      .product-section {
        padding: 16px !important;
      }
      
      .price-table td {
        font-size: 13px !important;
        padding: 8px 0 !important;
        word-wrap: break-word !important;
      }
      
      .price-table td:last-child {
        padding-left: 12px !important;
      }
      
      .total-price {
        font-size: 16px !important;
      }
      
      .button-link {
        padding: 10px 20px !important;
        font-size: 14px !important;
      }
      
      .footer-section {
        padding: 20px 16px !important;
      }
      
      .image-container {
        padding: 16px !important;
      }
      
      .product-image {
        max-width: 200px !important;
      }
      
      h2 {
        font-size: 16px !important;
      }
      
      h3 {
        font-size: 15px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div class="email-container" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
    
    <!-- Header -->
    <div class="header-section" style="background: linear-gradient(135deg, #0071e3 0%, #005bb5 100%); padding: 24px 32px; text-align: center;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 24px; display: inline-block;" bgcolor="#ffffff">
              <tr>
                <td class="logo-container" style="padding: 20px 32px; background-color: #ffffff; border-radius: 24px;" bgcolor="#ffffff">
                  <a href="https://evionor.hu" target="_blank" style="display: block; text-decoration: none;">
                    <img class="logo-img" src="https://evionor.hu/cdn/shop/files/evionor-logo.png?v=1761743181" alt="Evionor Logo" width="240" style="height: auto; display: block; border: 0; background-color: #ffffff; max-width: 100%;" />
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <h1 class="header-title" style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">EV-Töltő Beszerzési Ajánlat</h1>
      <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Személyre szabott megoldás az Ön igényeihez</p>
    </div>

    <!-- Content -->
    <div class="content-section" style="padding: 40px 32px;">
      
      <!-- Intro -->
      <p style="margin: 0 0 32px 0; color: #374151; font-size: 15px; line-height: 1.6;">${getGreeting(data.contactName)}</p>
      <p style="margin: 0 0 40px 0; color: #374151; font-size: 15px; line-height: 1.6;">Köszönjük érdeklődését! Az Ön által megadott adatok alapján az alábbi ajánlatot készítettük.</p>

      <!-- Client Data Section -->
      <div class="section-container" style="margin-bottom: 24px; background-color: #f3f4f6; padding: 24px; border-radius: 12px; border: 2px solid #e5e7eb;">
        <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 600; border-bottom: 2px solid #d1d5db; padding-bottom: 12px;">Ügyfél adatok</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; color: #6b7280; font-size: 14px; width: 40%; word-wrap: break-word;">Ügyfél</td>
            <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500; word-wrap: break-word;">${data.contactName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #6b7280; font-size: 14px; word-wrap: break-word;">E-mail</td>
            <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500; word-wrap: break-word;">${data.email}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Telefonszám</td>
            <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500;">${data.phoneNumber}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Jármű</td>
            <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500; word-wrap: break-word;">${data.carBrand} ${data.carModel}</td>
          </tr>
          ${data.city && data.zipCode ? `
          <tr>
            <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Helyszín</td>
            <td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 500; word-wrap: break-word;">${data.city}, ${data.zipCode}</td>
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

      <!-- Charger Sections -->
      ${productSections}

      ${data.needsInstallation && (data.needsBackplate || data.needsPole || data.needsElectricalPlanning || data.overvoltageProtection || data.infrastructureDevelopment || data.networkExpansion) ? `
      <!-- Additional Installation Requirements -->
      <div class="section-container" style="margin-bottom: 24px; background-color: #f3f4f6; padding: 24px; border-radius: 12px; border: 2px solid #e5e7eb;">
        <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 600; border-bottom: 2px solid #d1d5db; padding-bottom: 12px;">További telepítési követelmények</h2>
        <div style="padding: 16px; background-color: white; border-radius: 8px; border: 1px solid #e5e7eb;">
          <ul style="margin: 0 0 12px 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8; word-wrap: break-word;">
            ${data.needsBackplate ? "<li>Hátlap szükséges</li>" : ""}
            ${data.needsPole ? "<li>Oszlop szükséges</li>" : ""}
            ${data.needsElectricalPlanning ? "<li>Villamos tervezés szükséges</li>" : ""}
            ${data.overvoltageProtection ? "<li>Túlfeszültség védelem</li>" : ""}
            ${data.infrastructureDevelopment && data.infrastructureDetails ? `<li>Infrastruktúra fejlesztés: ${data.infrastructureDetails}</li>` : ""}
            ${data.networkExpansion ? `<li>Hálózatbővítés: ${data.expansionPhase} fázis, ${data.expansionAmperage} A</li>` : ""}
          </ul>
          <p style="margin: 0; padding: 12px; background-color: #eff6ff; border-left: 3px solid #3b82f6; color: #1e3a8a; font-size: 13px; line-height: 1.6; word-wrap: break-word;">
            <strong>Megjegyzés:</strong> A sztenderd telepítési tartalmon túli munkavégzésről a helyszínen készül lista. Az árlistája a <a href="https://www.evionor.hu" style="color: #0071e3; text-decoration: underline;">honlapunkon elérhető</a>.
          </p>
        </div>
      </div>
      ` : ""}

      ${data.groundworkWallPenetration ? `
      <div style="margin-bottom: 24px; padding: 16px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">Földmunka/Faláttörés:</p>
        <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6; word-wrap: break-word;">${data.groundworkWallPenetration}</p>
      </div>
      ` : ""}

      ${data.needsInstallation ? `
      <!-- Standard Installation Description -->
      <div class="section-container" style="margin-bottom: 24px; background-color: #f3f4f6; padding: 24px; border-radius: 12px; border: 2px solid #e5e7eb;">
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
        <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6; word-wrap: break-word;">${data.otherComments}</p>
      </div>
      ` : ""}

      <!-- Closing -->
      <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.6;">További kérdés esetén állunk rendelkezésére!</p>
        <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Üdvözlettel,</p>
        <p style="margin: 0 0 16px 0; color: #111827; font-size: 14px; font-weight: 600;">Horváth Gáspár</p>
        <p style="margin: 0 0 4px 0; color: #111827; font-size: 14px; font-weight: 600;">Az EVIONOR Csapata</p>
        <p style="margin: 0 0 4px 0; color: #0071e3; font-size: 14px;">+36 20 581 9166</p>
        <p style="margin: 0 0 4px 0; color: #0071e3; font-size: 14px;"><a href="mailto:info@evionor.hu" style="color: #0071e3; text-decoration: none;">info@evionor.hu</a></p>
        <p style="margin: 0; color: #0071e3; font-size: 14px;"><a href="https://www.evionor.hu" style="color: #0071e3; text-decoration: none;">www.evionor.hu</a></p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer-section" style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #9ca3af; font-size: 13px;">EVIONOR Magyarország 2025 ©</p>
    </div>
  </div>
</body>
</html>`;
}