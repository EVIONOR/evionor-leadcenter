// B2B Auto Email Template - Zaptec Go + Load Management + Standard Installation

interface B2BAutoEmailInput {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
}

const ZAPTEC_GO_GROSS = 275000;
const ZAPTEC_GO_ORIGINAL_GROSS = 353000;
const ZAPTEC_GO_NET = Math.round(ZAPTEC_GO_GROSS / 1.27);
const ZAPTEC_GO_ORIGINAL_NET = Math.round(ZAPTEC_GO_ORIGINAL_GROSS / 1.27);

const ZAPTEC_SENSE_NET = 99450;
const ZAPTEC_SENSE_GROSS = Math.round(ZAPTEC_SENSE_NET * 1.27);

const INSTALLATION_GROSS = 219000;
const INSTALLATION_NET = Math.round(INSTALLATION_GROSS / 1.27);

const TOTAL_GROSS = ZAPTEC_GO_GROSS + ZAPTEC_SENSE_GROSS + INSTALLATION_GROSS;
const TOTAL_NET = Math.round(TOTAL_GROSS / 1.27);

function fmtPrice(price: number): string {
  return new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency: "HUF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function buildB2BAutoEmail(input: B2BAutoEmailInput): { html: string; subject: string } {
  const displayName = input.companyName || input.contactName;
  const greeting = input.companyName ? "Tisztelt Ügyfelünk!" : `Tisztelt ${input.contactName}!`;

  const html = `<!DOCTYPE html>
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
                                            ${input.companyName ? `
                                            <tr><td style="color: #64748b; font-size: 11px; padding: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Cégnév</td></tr>
                                            <tr><td style="color: #0a2540; font-size: 14px; font-weight: 600; padding: 0 0 12px 0;">${input.companyName}</td></tr>
                                            ` : ""}
                                            <tr><td style="color: #64748b; font-size: 11px; padding: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Kapcsolattartó</td></tr>
                                            <tr><td style="color: #0a2540; font-size: 14px; font-weight: 500; padding: 0 0 12px 0;">${input.contactName}</td></tr>
                                            <tr><td style="color: #64748b; font-size: 11px; padding: 6px 0 2px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">E-mail</td></tr>
                                            <tr><td style="color: #0a2540; font-size: 14px; font-weight: 500; padding: 0 0 12px 0;">${input.email}</td></tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Zaptec Go -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                                <tr>
                                    <td style="padding: 16px 16px 6px 16px; border-bottom: 2px solid #e2e8f0;">
                                        <p style="margin: 0 0 2px 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Ajánlott töltő</p>
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
                                                            <span style="color: #94a3b8; text-decoration: line-through; font-size: 13px; font-weight: 400; margin-right: 8px;">${fmtPrice(ZAPTEC_GO_ORIGINAL_NET)} + áfa</span>
                                                            <span style="color: #0071e3; font-size: 22px; font-weight: 800;">${fmtPrice(ZAPTEC_GO_NET)}</span>
                                                            <span style="color: #64748b; font-size: 13px; font-weight: 500;"> + áfa</span>
                                                            <br/>
                                                            <span style="color: #94a3b8; font-size: 12px; font-weight: 400;">bruttó: ${fmtPrice(ZAPTEC_GO_GROSS)}</span>
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
                                                    </ul>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Installation -->
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px; background-color: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0;">
                                            <tr>
                                                <td style="padding: 14px;">
                                                    <p style="margin: 0 0 8px 0; color: #0a2540; font-size: 13px; font-weight: 700; text-transform: uppercase;">Telepítés</p>
                                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                                        <tr>
                                                            <td style="color: #4a5568; font-size: 13px; padding: 4px 0;">Sztenderd telepítés (5m kábelig)</td>
                                                            <td style="color: #0a2540; font-size: 14px; font-weight: 600; text-align: right;">
                                                                ${fmtPrice(INSTALLATION_NET)} + áfa
                                                                <br/><span style="color: #94a3b8; font-size: 11px; font-weight: 400;">bruttó: ${fmtPrice(INSTALLATION_GROSS)}</span>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <p style="margin: 10px 0 0 0; color: #4a5568; font-size: 12px; line-height: 1.6;">A telepítés tartalmazza: áramvédő és kismegszakító beépítése, kábel rögzítése, töltő felszerelése, beüzemelés és átadás.</p>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Saját villanyszerelő -->
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px; background-color: #d1fae5; border-radius: 10px; border: 1px solid #a7f3d0;">
                                            <tr>
                                                <td style="padding: 14px;">
                                                    <p style="margin: 0; color: #065f46; font-size: 13px; font-weight: 700; line-height: 1.5;">💡 Van saját villanyszerelője? Rendelje meg csak a töltőt! A telepítésben és a beüzemelésben díjmentesen támogatjuk!</p>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Load Management -->
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px; background-color: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0;">
                                            <tr>
                                                <td style="padding: 14px;">
                                                    <p style="margin: 0 0 8px 0; color: #0a2540; font-size: 13px; font-weight: 700; text-transform: uppercase;">Terhelésmenedzsment</p>
                                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                                        <tr>
                                                            <td style="color: #4a5568; font-size: 13px; padding: 4px 0;"><a href="https://evionor.hu/collections/all/products/zaptec-sense-gen-ct-clamp-csomag-ev-mero" style="color: #0071e3; text-decoration: none; border-bottom: 1px solid #0071e3;">Zaptec Sense GEN CT Clamp Csomag</a></td>
                                                            <td style="color: #0a2540; font-size: 14px; font-weight: 600; text-align: right;">
                                                                ${fmtPrice(ZAPTEC_SENSE_NET)} + áfa
                                                                <br/><span style="color: #94a3b8; font-size: 11px; font-weight: 400;">bruttó: ${fmtPrice(ZAPTEC_SENSE_GROSS)}</span>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <p style="margin: 10px 0 0 0; color: #4a5568; font-size: 12px; line-height: 1.6;">Több töltő egyidejű használatához szükséges terhelésmenedzsment rendszer.</p>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Summary -->
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px; background-color: #f0f7ff; border-radius: 10px; border: 2px solid #0071e3;">
                                            <tr>
                                                <td style="padding: 16px;">
                                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                                        <tr>
                                                            <td style="color: #0a2540; font-size: 14px; font-weight: 700;">Töltő nettó:</td>
                                                            <td style="text-align: right;">
                                                                <span style="color: #0071e3; font-size: 20px; font-weight: 800;">${fmtPrice(ZAPTEC_GO_NET)}</span>
                                                                <span style="color: #64748b; font-size: 12px;"> + áfa</span>
                                                                <br/><span style="color: #94a3b8; font-size: 11px;">bruttó: ${fmtPrice(ZAPTEC_GO_GROSS)}</span>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="color: #0a2540; font-size: 14px; font-weight: 700; padding-top: 8px;">Telepítés nettó:</td>
                                                            <td style="text-align: right; padding-top: 8px;">
                                                                <span style="color: #059669; font-size: 16px; font-weight: 700;">${fmtPrice(INSTALLATION_NET)}</span>
                                                                <span style="color: #64748b; font-size: 12px;"> + áfa</span>
                                                                <br/><span style="color: #94a3b8; font-size: 11px;">bruttó: ${fmtPrice(INSTALLATION_GROSS)}</span>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="color: #0a2540; font-size: 14px; font-weight: 700; padding-top: 8px;">Terhelésmenedzsment nettó:</td>
                                                            <td style="text-align: right; padding-top: 8px;">
                                                                <span style="color: #059669; font-size: 16px; font-weight: 700;">${fmtPrice(ZAPTEC_SENSE_NET)}</span>
                                                                <span style="color: #64748b; font-size: 12px;"> + áfa</span>
                                                                <br/><span style="color: #94a3b8; font-size: 11px;">bruttó: ${fmtPrice(ZAPTEC_SENSE_GROSS)}</span>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colspan="2" style="padding-top: 12px; border-top: 1px solid #cbd5e1;">
                                                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                                                    <tr>
                                                                        <td style="color: #0a2540; font-size: 16px; font-weight: 800; padding-top: 4px;">Összesen nettó:</td>
                                                                        <td style="text-align: right; padding-top: 4px;">
                                                                            <span style="color: #0071e3; font-size: 22px; font-weight: 800;">${fmtPrice(TOTAL_NET)}</span>
                                                                            <span style="color: #64748b; font-size: 13px;"> + áfa</span>
                                                                            <br/><span style="color: #94a3b8; font-size: 12px;">bruttó: ${fmtPrice(TOTAL_GROSS)}</span>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 12px;">
                                                        <tr>
                                                            <td align="center">
                                                                <a href="https://evionor.hu/collections/all/products/zaptec-go-evtlt" style="display: inline-block; background-color: #0071e3; color: #ffffff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 700;">Megnézem &rarr;</a>
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
                                        <h2 style="margin: 0; color: #0a2540; font-size: 16px; font-weight: 700;">Folyamat</h2>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 16px 16px 16px;">
                                        <ol style="margin: 0; padding: 0 0 0 18px; color: #4a5568; font-size: 13px; line-height: 2;">
                                            <li>Rendelje meg egyszerűen a termékeinket akár erre az emailre történő válasszal!</li>
                                            <li>A termékeket díjmentesen házhoz szállítjuk.</li>
                                            <li>Rendelés után azonnal egyeztetjük a telepítés részleteit.</li>
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
                                        <p style="margin: 0 0 14px 0; color: #0a2540; font-size: 14px; font-weight: 700;">Horváth Gáspár</p>
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
</html>`;

  return {
    html,
    subject: `Elektromos autó töltő ajánlat – ${displayName} – Evionor`,
  };
}
