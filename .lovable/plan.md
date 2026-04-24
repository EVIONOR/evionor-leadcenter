
## Terv: B2B auto email kétnyelvűsítése (HU/RO)

Ugyanaz a logika, mint a lakossági (B2C) automatizálásnál: a nyelvet a forrástábla határozza meg az EVIONOR adatbázisban.

### 1. Nyelvfelismerés — EVIONOR források

A `process-b2b-offers` Edge Function jelenleg csak a `b2b_questionnaire_responses` táblából húz leadeket. Bővítjük úgy, hogy mindkét táblából lekérjen:

- `b2b_questionnaire_responses` → `language: "hu"`
- `b2b_questionnaire_responses_ro` → `language: "ro"` (a felhasználó által most javított kalkulátor forrása)

A `b2b_qualifications` lokális táblába a meglévő `source_b2b_id` mellé eltároljuk a nyelvet is, hogy később az email küldésnél tudjuk, melyik sablont kell használni.

### 2. Adatbázis migráció (lokális Supabase)

Új oszlop a `b2b_qualifications` táblán:

```
ALTER TABLE public.b2b_qualifications 
ADD COLUMN language text NOT NULL DEFAULT 'hu';
```

(`'hu' | 'ro'`, default `'hu'` a meglévő rekordok megőrzéséhez.)

### 3. Email sablon fordítása — `supabase/functions/_shared/b2bOffer.ts`

A jelenlegi fájl egyetlen, magyarra hardcode-olt HTML stringet épít. Átalakítjuk:

- `buildB2BAutoEmail(input, language: "hu" | "ro" = "hu")` szignatúra
- Belső `messages` szótár minden látható szöveghez (lásd lent)
- Tárgy is fordítva
- Stílus, árak, formátum (HUF), URL-ek, telefonszám változatlan

### 4. Fordítandó szövegek (B2B auto email)

| Magyar | Román |
|---|---|
| Üzleti EV-Töltő Ajánlat | Ofertă Stație de Încărcare EV pentru Companii |
| Személyre szabott üzleti megoldás | Soluție personalizată pentru companii |
| Tisztelt Ügyfelünk! | Stimate Client! |
| Tisztelt {név}! | Stimate {név}! |
| Köszönjük érdeklődését! Az Ön igényei alapján… | Vă mulțumim pentru interes! Pe baza nevoilor… |
| Projekt adatok / Cégnév / Kapcsolattartó / E-mail | Date proiect / Denumire firmă / Persoană de contact / E-mail |
| Ajánlott töltő | Stație recomandată |
| Jellemzők | Caracteristici |
| Fázisok száma: 1/3 fázis kompatibilis | Faze: compatibil 1/3 faze |
| Töltési áramerősség: 6–32 A között állítható | Curent de încărcare: reglabil 6–32 A |
| Biztonság: Beépített hibaáram védelem | Siguranță: protecție la curent rezidual integrată |
| Hitelesítés: RFID/NFC vagy mobilalkalmazás | Autentificare: RFID/NFC sau aplicație mobilă |
| Kapcsolódás: Bluetooth, WiFi és 4G LTE-M (eSIM) | Conectivitate: Bluetooth, WiFi și 4G LTE-M (eSIM) |
| Okos funkciók: Terhelésmenedzsment kompatibilis | Funcții inteligente: compatibil management sarcină |
| Extra funkciók: Lágy indítás, okosotthon integráció | Funcții suplimentare: pornire lină, integrare smart home |
| Töltési adatok: Részletes töltési statisztikák | Date de încărcare: statistici detaliate |
| Szoftverfrissítések: Automatikus frissítés LTE-n | Actualizări software: automate prin LTE |
| Védettség: IP54, kültéri használatra | Protecție: IP54, pentru utilizare exterioară |
| ✓ Gyártói garancia 5 év | ✓ Garanție producător 5 ani |
| Telepítés / Sztenderd telepítés (5m kábelig) | Instalare / Instalare standard (până la 5m cablu) |
| A telepítés tartalmazza: áramvédő… | Instalarea include: disjunctor diferențial, fixare cablu, montare stație, punere în funcțiune și predare. |
| 💡 Van saját villanyszerelője? Rendelje meg csak a töltőt!… | 💡 Aveți electrician propriu? Comandați doar stația! Vă oferim suport gratuit pentru instalare și punere în funcțiune! |
| Terhelésmenedzsment | Management sarcină |
| Több töltő egyidejű használatához szükséges… | Sistem necesar pentru utilizarea simultană a mai multor stații. |
| Töltő nettó / Telepítés nettó / Terhelésmenedzsment nettó / Összesen nettó | Stație fără TVA / Instalare fără TVA / Management sarcină fără TVA / Total fără TVA |
| + áfa | + TVA |
| bruttó: | cu TVA: |
| Megnézem → | Vezi produsul → |
| Folyamat (1/2/3) | Procesul |
| Rendelje meg egyszerűen… | Comandați simplu produsele răspunzând la acest e-mail! |
| A termékeket díjmentesen házhoz szállítjuk. | Livrăm produsele gratuit la domiciliu. |
| Rendelés után azonnal egyeztetjük a telepítés részleteit. | După comandă stabilim imediat detaliile instalării. |
| Mit kap, ha termékeinket választja? | Ce primiți dacă alegeți produsele noastre? |
| ✅ Stabil és kényelmes autótöltést… | ✅ Încărcare stabilă și confortabilă a mașinii zi de zi. |
| ✅ Megbízható technológiát és gondtalan működést. | ✅ Tehnologie de încredere și funcționare fără griji. |
| ✅ 5 év gyártói garanciával védjük a befektetését. | ✅ Vă protejăm investiția cu 5 ani garanție producător. |
| ✅ Vásárlás után élethosszig tartó szakmai segítséget. | ✅ Suport tehnic pe viață după achiziție. |
| Az EVIONOR-al a skandináv megbízhatóságot választja. | Cu EVIONOR alegeți fiabilitatea scandinavă. |
| További kérdés esetén állunk rendelkezésére! | Pentru orice întrebare suplimentară vă stăm la dispoziție! |
| Üdvözlettel, / Az EVIONOR Csapata | Cu stimă, / Echipa EVIONOR |
| EVIONOR Magyarország © 2026 | EVIONOR © 2026 |
| Elektromos autó töltési megoldások | Soluții de încărcare pentru mașini electrice |
| **Tárgy:** EV-töltő ajánlat vállalati ügyfeleknek – {név} – Evionor | Ofertă stație de încărcare EV pentru companii – {név} – Evionor |

### 5. `process-b2b-offers/index.ts` módosítás

**Auto-grouping fázis:**
- Két lekérdezés EVIONOR-ból: `b2b_questionnaire_responses` (HU) és `b2b_questionnaire_responses_ro` (RO)
- A két listát egyesítjük, mindegyik elemhez hozzárendeljük a `language` mezőt
- Új `b2b_qualifications` rekord beszúrásakor a `language` is mentésre kerül

**Email küldés fázis:**
- A `select`-be felvesszük a `language` oszlopot
- `buildB2BAutoEmail({...}, lead.language || "hu")` hívás

### 6. Manuális mellékfeladat (EVIONOR projekt — felhasználó)

Az EVIONOR projektben létre kell hozni a `b2b_questionnaire_responses_ro` táblát ugyanazzal a sémával, mint a `b2b_questionnaire_responses`, és a román B2B kalkulátornak ide kell írnia. (Ha más néven van, szóljon, és átnevezem a kódban.)

### Hatás

- Magyar B2B leadek → magyar auto email (változatlan)
- Román B2B leadek (`b2b_questionnaire_responses_ro`) → román auto email
- A `b2b_qualifications` táblában látszik majd, melyik lead milyen nyelven jött be
- A B2C automatizálás nincs érintve — az most külön lépésben készül, ha jóváhagyja
