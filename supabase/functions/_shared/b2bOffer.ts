// B2B Auto Email Template - Zaptec Go + Load Management + Standard Installation
// Supports HU and RO languages — language is determined by EVIONOR source table.

interface B2BAutoEmailInput {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
}

export type B2BLanguage = "hu" | "ro";

const ZAPTEC_GO_GROSS = 353000;
const ZAPTEC_GO_NET = Math.round(ZAPTEC_GO_GROSS / 1.27);

const ZAPTEC_SENSE_NET = 99450;
const ZAPTEC_SENSE_GROSS = Math.round(ZAPTEC_SENSE_NET * 1.27);

const INSTALLATION_GROSS = 219000;
const INSTALLATION_NET = Math.round(INSTALLATION_GROSS / 1.27);

const TOTAL_GROSS = ZAPTEC_GO_GROSS + ZAPTEC_SENSE_GROSS + INSTALLATION_GROSS;
const TOTAL_NET = Math.round(TOTAL_GROSS / 1.27);

function fmtPrice(price: number, language: B2BLanguage): string {
  // Both languages display HUF amounts (pricing is HU-based).
  const locale = language === "ro" ? "ro-RO" : "hu-HU";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "HUF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

interface Messages {
  htmlLang: string;
  title: string;
  preheader: (name: string) => string;
  headerTitle: string;
  headerSubtitle: string;
  greetingCompany: string;
  greetingPerson: (name: string) => string;
  intro: string;
  projectData: string;
  companyName: string;
  contact: string;
  email: string;
  recommendedCharger: string;
  characteristics: string;
  feat1: string;
  feat2: string;
  feat3: string;
  feat4: string;
  feat5: string;
  feat6: string;
  feat7: string;
  feat8: string;
  feat9: string;
  feat10: string;
  warranty: string;
  installation: string;
  standardInstall: string;
  vatPlus: string;
  gross: string;
  installIncludes: string;
  ownElectrician: string;
  loadMgmt: string;
  loadMgmtProduct: string;
  loadMgmtNote: string;
  chargerNet: string;
  installNet: string;
  loadMgmtNet: string;
  totalNet: string;
  viewProduct: string;
  process: string;
  step1: string;
  step2: string;
  step3: string;
  valueProp: string;
  vp1: string;
  vp2: string;
  vp3: string;
  vp4: string;
  vpClosing: string;
  closingQuestions: string;
  regards: string;
  signature: string;
  team: string;
  footerCompany: string;
  footerTagline: string;
  subject: (name: string) => string;
}

const MESSAGES: Record<B2BLanguage, Messages> = {
  hu: {
    htmlLang: "hu",
    title: "Üzleti EV-Töltő Ajánlat",
    preheader: (name) => `Üzleti EV-töltő ajánlat – ${name}`,
    headerTitle: "Üzleti EV-Töltő Ajánlat",
    headerSubtitle: "Személyre szabott üzleti megoldás",
    greetingCompany: "Tisztelt Ügyfelünk!",
    greetingPerson: (name) => `Tisztelt ${name}!`,
    intro: "Köszönjük érdeklődését! Az Ön igényei alapján az alábbi ajánlatot készítettük.",
    projectData: "Projekt adatok",
    companyName: "Cégnév",
    contact: "Kapcsolattartó",
    email: "E-mail",
    recommendedCharger: "Ajánlott töltő",
    characteristics: "Jellemzők",
    feat1: "Fázisok száma: 1/3 fázis kompatibilis",
    feat2: "Töltési áramerősség: 6–32 A között állítható",
    feat3: "Biztonság: Beépített hibaáram védelem",
    feat4: "Hitelesítés: RFID/NFC vagy mobilalkalmazás",
    feat5: "Kapcsolódás: Bluetooth, WiFi és 4G LTE-M (eSIM)",
    feat6: "Okos funkciók: Terhelésmenedzsment kompatibilis",
    feat7: "Extra funkciók: Lágy indítás, okosotthon integráció",
    feat8: "Töltési adatok: Részletes töltési statisztikák",
    feat9: "Szoftverfrissítések: Automatikus frissítés LTE-n",
    feat10: "Védettség: IP54, kültéri használatra",
    warranty: "✓ Gyártói garancia 5 év",
    installation: "Telepítés",
    standardInstall: "Sztenderd telepítés (5m kábelig)",
    vatPlus: "+ áfa",
    gross: "bruttó:",
    installIncludes:
      "A telepítés tartalmazza: áramvédő és kismegszakító beépítése, kábel rögzítése, töltő felszerelése, beüzemelés és átadás.",
    ownElectrician:
      "💡 Van saját villanyszerelője? Rendelje meg csak a töltőt! A telepítésben és a beüzemelésben díjmentesen támogatjuk!",
    loadMgmt: "Terhelésmenedzsment",
    loadMgmtProduct: "Zaptec Sense GEN CT Clamp Csomag",
    loadMgmtNote: "Több töltő egyidejű használatához szükséges terhelésmenedzsment rendszer.",
    chargerNet: "Töltő nettó:",
    installNet: "Telepítés nettó:",
    loadMgmtNet: "Terhelésmenedzsment nettó:",
    totalNet: "Összesen nettó:",
    viewProduct: "Megnézem &rarr;",
    process: "Folyamat",
    step1: "Rendelje meg egyszerűen a termékeinket akár erre az emailre történő válasszal!",
    step2: "A termékeket díjmentesen házhoz szállítjuk.",
    step3: "Rendelés után azonnal egyeztetjük a telepítés részleteit.",
    valueProp: "Mit kap, ha termékeinket választja?",
    vp1: "✅ Stabil és kényelmes autótöltést a mindennapokban.",
    vp2: "✅ Megbízható technológiát és gondtalan működést.",
    vp3: "✅ 5 év gyártói garanciával védjük a befektetését.",
    vp4: "✅ Vásárlás után élethosszig tartó szakmai segítséget.",
    vpClosing: "Az EVIONOR-al a skandináv megbízhatóságot választja.",
    closingQuestions: "További kérdés esetén állunk rendelkezésére!",
    regards: "Üdvözlettel,",
    signature: "Horváth Gáspár",
    team: "Az EVIONOR Csapata",
    footerCompany: "EVIONOR Magyarország &copy; 2026",
    footerTagline: "Elektromos autó töltési megoldások",
    subject: (name) => `EV-töltő ajánlat vállalati ügyfeleknek – ${name} – Evionor`,
  },
  ro: {
    htmlLang: "ro",
    title: "Ofertă Stație de Încărcare EV pentru Companii",
    preheader: (name) => `Ofertă stație de încărcare EV pentru companii – ${name}`,
    headerTitle: "Ofertă Stație de Încărcare EV pentru Companii",
    headerSubtitle: "Soluție personalizată pentru companii",
    greetingCompany: "Stimate Client!",
    greetingPerson: (name) => `Stimate ${name}!`,
    intro:
      "Vă mulțumim pentru interes! Pe baza nevoilor dumneavoastră am pregătit oferta de mai jos.",
    projectData: "Date proiect",
    companyName: "Denumire firmă",
    contact: "Persoană de contact",
    email: "E-mail",
    recommendedCharger: "Stație recomandată",
    characteristics: "Caracteristici",
    feat1: "Faze: compatibil 1/3 faze",
    feat2: "Curent de încărcare: reglabil 6–32 A",
    feat3: "Siguranță: protecție la curent rezidual integrată",
    feat4: "Autentificare: RFID/NFC sau aplicație mobilă",
    feat5: "Conectivitate: Bluetooth, WiFi și 4G LTE-M (eSIM)",
    feat6: "Funcții inteligente: compatibil management sarcină",
    feat7: "Funcții suplimentare: pornire lină, integrare smart home",
    feat8: "Date de încărcare: statistici detaliate",
    feat9: "Actualizări software: automate prin LTE",
    feat10: "Protecție: IP54, pentru utilizare exterioară",
    warranty: "✓ Garanție producător 5 ani",
    installation: "Instalare",
    standardInstall: "Instalare standard (până la 5m cablu)",
    vatPlus: "+ TVA",
    gross: "cu TVA:",
    installIncludes:
      "Instalarea include: disjunctor diferențial și siguranță automată, fixarea cablului, montarea stației, punerea în funcțiune și predarea.",
    ownElectrician:
      "💡 Aveți electrician propriu? Comandați doar stația! Vă oferim suport gratuit pentru instalare și punere în funcțiune!",
    loadMgmt: "Management sarcină",
    loadMgmtProduct: "Pachet Zaptec Sense GEN CT Clamp",
    loadMgmtNote:
      "Sistem de management al sarcinii necesar pentru utilizarea simultană a mai multor stații.",
    chargerNet: "Stație fără TVA:",
    installNet: "Instalare fără TVA:",
    loadMgmtNet: "Management sarcină fără TVA:",
    totalNet: "Total fără TVA:",
    viewProduct: "Vezi produsul &rarr;",
    process: "Procesul",
    step1: "Comandați simplu produsele răspunzând la acest e-mail!",
    step2: "Livrăm produsele gratuit la domiciliu.",
    step3: "După comandă stabilim imediat detaliile instalării.",
    valueProp: "Ce primiți dacă alegeți produsele noastre?",
    vp1: "✅ Încărcare stabilă și confortabilă a mașinii zi de zi.",
    vp2: "✅ Tehnologie de încredere și funcționare fără griji.",
    vp3: "✅ Vă protejăm investiția cu 5 ani garanție producător.",
    vp4: "✅ Suport tehnic pe viață după achiziție.",
    vpClosing: "Cu EVIONOR alegeți fiabilitatea scandinavă.",
    closingQuestions: "Pentru orice întrebare suplimentară vă stăm la dispoziție!",
    regards: "Cu stimă,",
    signature: "Horváth Gáspár",
    team: "Echipa EVIONOR",
    footerCompany: "EVIONOR &copy; 2026",
    footerTagline: "Soluții de încărcare pentru mașini electrice",
    subject: (name) => `Ofertă stație de încărcare EV pentru companii – ${name} – Evionor`,
  },
};

export function buildB2BAutoEmail(
  input: B2BAutoEmailInput,
  language: B2BLanguage = "hu",
): { html: string; subject: string } {
  const t = MESSAGES[language] ?? MESSAGES.hu;
  const displayName = input.companyName || input.contactName;
  const greeting = input.companyName ? t.greetingCompany : t.greetingPerson(input.contactName);

  const html = `<!DOCTYPE html>
<html lang="${t.htmlLang}" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${t.title}</title>
    <style>
        @media only screen and (max-width: 620px) {
            .email-container { width: 100% !important; }
            .content-padding { padding: 20px 16px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; width: 100%; background-color: #f0f2f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
    <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0; overflow: hidden;">
        ${t.preheader(displayName)}
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
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">${t.headerTitle}</h1>
                            <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">${t.headerSubtitle}</p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td class="content-padding" style="padding: 28px 24px;">
                            <p style="margin: 0 0 16px 0; color: #1a1a2e; font-size: 15px; font-weight: 500;">${greeting}</p>
                            <p style="margin: 0 0 32px 0; color: #4a5568; font-size: 14px; line-height: 1.7;">${t.intro}</p>

                            <!-- Client Data -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                                <tr>
                                    <td style="padding: 16px 16px 6px 16px; border-bottom: 2px solid #e2e8f0;">
                                        <h2 style="margin: 0; color: #0a2540; font-size: 16px; font-weight: 700;">${t.projectData}</h2>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 16px 16px 16px;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                            ${input.companyName ? `
                                            <tr><td style="color: #64748b; font-size: 11px; padding: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">${t.companyName}</td></tr>
                                            <tr><td style="color: #0a2540; font-size: 14px; font-weight: 600; padding: 0 0 12px 0;">${input.companyName}</td></tr>
                                            ` : ""}
                                            <tr><td style="color: #64748b; font-size: 11px; padding: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">${t.contact}</td></tr>
                                            <tr><td style="color: #0a2540; font-size: 14px; font-weight: 500; padding: 0 0 12px 0;">${input.contactName}</td></tr>
                                            <tr><td style="color: #64748b; font-size: 11px; padding: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">${t.email}</td></tr>
                                            <tr><td style="color: #0a2540; font-size: 14px; font-weight: 500; padding: 0 0 12px 0;">${input.email}</td></tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Zaptec Go -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                                <tr>
                                    <td style="padding: 16px 16px 6px 16px; border-bottom: 2px solid #e2e8f0;">
                                        <p style="margin: 0 0 2px 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">${t.recommendedCharger}</p>
                                        <h2 style="margin: 0; color: #0a2540; font-size: 16px; font-weight: 700;">Zaptec Go EV·TÖLTŐ</h2>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 16px;">
                                        <!-- Image -->
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                                            <tr>
                                                <td align="center" style="padding: 12px; background-color: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0;">
                                                    <a href="https://evionor.hu/collections/all/products/zaptec-go-evtlt" style="display: inline-block; text-decoration: none;">
                                                        <img src="https://evionor.hu/cdn/shop/files/Zaptec_Go_Home_Charging_2329.webp?v=1762272030&width=600" alt="Zaptec Go 22kW" width="240" style="max-width: 240px; width: 100%; height: auto; display: block; border: 0;" />
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        <!-- Price -->
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 16px;">
                                            <tr>
                                                <td style="padding: 14px;">
                                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                                        <tr><td style="padding-bottom: 8px;"><a href="https://evionor.hu/collections/all/products/zaptec-go-evtlt" style="color: #0a2540; font-size: 15px; font-weight: 700; text-decoration: none; border-bottom: 2px solid #0071e3;">Zaptec Go 22kW</a></td></tr>
                                                        <tr><td>
                                                            <span style="color: #0071e3; font-size: 22px; font-weight: 800;">${fmtPrice(ZAPTEC_GO_NET, language)}</span>
                                                            <span style="color: #64748b; font-size: 13px; font-weight: 500;"> ${t.vatPlus}</span>
                                                            <br/>
                                                            <span style="color: #94a3b8; font-size: 12px; font-weight: 400;">${t.gross} ${fmtPrice(ZAPTEC_GO_GROSS, language)}</span>
                                                        </td></tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        <!-- Characteristics -->
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0;">
                                            <tr>
                                                <td style="padding: 14px;">
                                                    <p style="margin: 0 0 10px 0; color: #0a2540; font-size: 13px; font-weight: 700; text-transform: uppercase;">${t.characteristics}</p>
                                                    <ul style="margin: 0; padding: 0 0 0 18px; color: #4a5568; font-size: 13px; line-height: 1.8;">
                                                        <li style="font-size: 14px;">${t.feat1}</li>
                                                        <li style="font-size: 14px;">${t.feat2}</li>
                                                        <li style="font-size: 14px;">${t.feat3}</li>
                                                        <li style="font-size: 14px;">${t.feat4}</li>
                                                        <li style="font-size: 14px;">${t.feat5}</li>
                                                        <li style="font-size: 14px;">${t.feat6}</li>
                                                        <li style="font-size: 14px;">${t.feat7}</li>
                                                        <li style="font-size: 14px;">${t.feat8}</li>
                                                        <li style="font-size: 14px;">${t.feat9}</li>
                                                        <li style="font-size: 14px;">${t.feat10}</li>
                                                        <li style="font-size: 14px; background-color: #d1fae5; padding: 4px 8px; border-radius: 6px; font-weight: 700; color: #065f46;">${t.warranty}</li>
                                                    </ul>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Installation -->
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px; background-color: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0;">
                                            <tr>
                                                <td style="padding: 14px;">
                                                    <p style="margin: 0 0 8px 0; color: #0a2540; font-size: 13px; font-weight: 700; text-transform: uppercase;">${t.installation}</p>
                                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                                        <tr>
                                                            <td style="color: #4a5568; font-size: 13px; padding: 4px 0;">${t.standardInstall}</td>
                                                            <td style="color: #0a2540; font-size: 14px; font-weight: 600; text-align: right;">
                                                                ${fmtPrice(INSTALLATION_NET, language)} ${t.vatPlus}
                                                                <br/><span style="color: #94a3b8; font-size: 11px; font-weight: 400;">${t.gross} ${fmtPrice(INSTALLATION_GROSS, language)}</span>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <p style="margin: 10px 0 0 0; color: #4a5568; font-size: 12px; line-height: 1.6;">${t.installIncludes}</p>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Saját villanyszerelő -->
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px; background-color: #d1fae5; border-radius: 10px; border: 1px solid #a7f3d0;">
                                            <tr>
                                                <td style="padding: 14px;">
                                                    <p style="margin: 0; color: #065f46; font-size: 13px; font-weight: 700; line-height: 1.5;">${t.ownElectrician}</p>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Load Management -->
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px; background-color: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0;">
                                            <tr>
                                                <td style="padding: 14px;">
                                                    <p style="margin: 0 0 8px 0; color: #0a2540; font-size: 13px; font-weight: 700; text-transform: uppercase;">${t.loadMgmt}</p>
                                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                                        <tr>
                                                            <td style="color: #4a5568; font-size: 13px; padding: 4px 0;"><a href="https://evionor.hu/collections/all/products/zaptec-sense-gen-ct-clamp-csomag-ev-mero" style="color: #0071e3; text-decoration: none; border-bottom: 1px solid #0071e3;">${t.loadMgmtProduct}</a></td>
                                                            <td style="color: #0a2540; font-size: 14px; font-weight: 600; text-align: right;">
                                                                ${fmtPrice(ZAPTEC_SENSE_NET, language)} ${t.vatPlus}
                                                                <br/><span style="color: #94a3b8; font-size: 11px; font-weight: 400;">${t.gross} ${fmtPrice(ZAPTEC_SENSE_GROSS, language)}</span>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <p style="margin: 10px 0 0 0; color: #4a5568; font-size: 12px; line-height: 1.6;">${t.loadMgmtNote}</p>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Summary -->
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px; background-color: #f0f7ff; border-radius: 10px; border: 2px solid #0071e3;">
                                            <tr>
                                                <td style="padding: 16px;">
                                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                                        <tr>
                                                            <td style="color: #0a2540; font-size: 14px; font-weight: 700;">${t.chargerNet}</td>
                                                            <td style="text-align: right;">
                                                                <span style="color: #0071e3; font-size: 20px; font-weight: 800;">${fmtPrice(ZAPTEC_GO_NET, language)}</span>
                                                                <span style="color: #64748b; font-size: 12px;"> ${t.vatPlus}</span>
                                                                <br/><span style="color: #94a3b8; font-size: 11px;">${t.gross} ${fmtPrice(ZAPTEC_GO_GROSS, language)}</span>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="color: #0a2540; font-size: 14px; font-weight: 700; padding-top: 8px;">${t.installNet}</td>
                                                            <td style="text-align: right; padding-top: 8px;">
                                                                <span style="color: #059669; font-size: 16px; font-weight: 700;">${fmtPrice(INSTALLATION_NET, language)}</span>
                                                                <span style="color: #64748b; font-size: 12px;"> ${t.vatPlus}</span>
                                                                <br/><span style="color: #94a3b8; font-size: 11px;">${t.gross} ${fmtPrice(INSTALLATION_GROSS, language)}</span>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="color: #0a2540; font-size: 14px; font-weight: 700; padding-top: 8px;">${t.loadMgmtNet}</td>
                                                            <td style="text-align: right; padding-top: 8px;">
                                                                <span style="color: #059669; font-size: 16px; font-weight: 700;">${fmtPrice(ZAPTEC_SENSE_NET, language)}</span>
                                                                <span style="color: #64748b; font-size: 12px;"> ${t.vatPlus}</span>
                                                                <br/><span style="color: #94a3b8; font-size: 11px;">${t.gross} ${fmtPrice(ZAPTEC_SENSE_GROSS, language)}</span>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="2" style="padding-top: 12px; border-top: 1px solid #cbd5e1;">
                                                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                                                    <tr>
                                                                        <td style="color: #0a2540; font-size: 16px; font-weight: 800; padding-top: 4px;">${t.totalNet}</td>
                                                                        <td style="text-align: right; padding-top: 4px;">
                                                                            <span style="color: #0071e3; font-size: 22px; font-weight: 800;">${fmtPrice(TOTAL_NET, language)}</span>
                                                                            <span style="color: #64748b; font-size: 13px;"> ${t.vatPlus}</span>
                                                                            <br/><span style="color: #94a3b8; font-size: 12px;">${t.gross} ${fmtPrice(TOTAL_GROSS, language)}</span>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 12px;">
                                                        <tr>
                                                            <td align="center">
                                                                <a href="https://evionor.hu/collections/all/products/zaptec-go-evtlt" style="display: inline-block; background-color: #0071e3; color: #ffffff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 700;">${t.viewProduct}</a>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Process -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                                <tr>
                                    <td style="padding: 16px 16px 6px 16px; border-bottom: 2px solid #e2e8f0;">
                                        <h2 style="margin: 0; color: #0a2540; font-size: 16px; font-weight: 700;">${t.process}</h2>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 16px 16px 16px;">
                                        <ol style="margin: 0; padding: 0 0 0 18px; color: #4a5568; font-size: 13px; line-height: 2;">
                                            <li>${t.step1}</li>
                                            <li>${t.step2}</li>
                                            <li>${t.step3}</li>
                                        </ol>
                                    </td>
                                </tr>
                            </table>

                            <!-- Value Proposition -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px; background-color: #f0f9ff; border-radius: 12px; border: 1px solid #bae6fd;">
                                <tr>
                                    <td style="padding: 16px 16px 6px 16px; border-bottom: 2px solid #bae6fd;">
                                        <h2 style="margin: 0; color: #0a2540; font-size: 16px; font-weight: 700;">${t.valueProp}</h2>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 14px 16px 18px 16px;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr><td style="padding: 4px 0; color: #334155; font-size: 13px; line-height: 1.6;">${t.vp1}</td></tr>
                                            <tr><td style="padding: 4px 0; color: #334155; font-size: 13px; line-height: 1.6;">${t.vp2}</td></tr>
                                            <tr><td style="padding: 4px 0; color: #334155; font-size: 13px; line-height: 1.6;">${t.vp3}</td></tr>
                                            <tr><td style="padding: 4px 0; color: #334155; font-size: 13px; line-height: 1.6;">${t.vp4}</td></tr>
                                        </table>
                                        <p style="margin: 14px 0 0 0; color: #0369a1; font-size: 13px; font-weight: 700; font-style: italic;">${t.vpClosing}</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Closing -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 2px solid #e2e8f0;">
                                <tr>
                                    <td style="padding-top: 24px;">
                                        <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 14px; line-height: 1.6;">${t.closingQuestions}</p>
                                        <p style="margin: 0 0 6px 0; color: #64748b; font-size: 13px;">${t.regards}</p>
                                        <p style="margin: 0 0 14px 0; color: #0a2540; font-size: 14px; font-weight: 700;">${t.signature}</p>
                                        <p style="margin: 0 0 6px 0; color: #0a2540; font-size: 13px; font-weight: 700;">${t.team}</p>
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
                            <p style="margin: 0 0 4px 0; color: rgba(255,255,255,0.7); font-size: 12px;">${t.footerCompany}</p>
                            <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 11px;">${t.footerTagline}</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

  return {
    html,
    subject: t.subject(displayName),
  };
}
