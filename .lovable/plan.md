

# B2B Lead Kvalifikalo Rendszer - Terv

## Kiindulas

A B2B leadek a **kulso EVIONOR Supabase**-ben vannak, a `b2b_questionnaire_responses` tablaban (50 rekord). A tabla schemaja:

| Mezo | Tipus |
|------|-------|
| id | uuid |
| company_name | text (nullable) |
| name | text |
| email | text |
| phone | text |
| fleet_count | integer |
| km_per_year | integer |
| charging_stations | integer |
| home_chargers | integer |
| phases | text (nullable) |
| location | text |
| timeline | text |
| usage_environment | text (nullable) |
| data_consent | boolean |
| created_at | timestamptz |

Az adatok mar elerhetok a meglevo `query-evionor` edge function-on keresztul -- csak a frontend kliensben kell hozzaadni a `b2b_questionnaire_responses` tablat a megengedett tablak koze.

## Megvalositando

### 1. Helyi `b2b_qualifications` tabla (migracio)
A kvalifikalasi adatokat (a hivas script eredmenyeit) helyben taroljuk, mivel ezek az operator altal kitoltott adatok:

- `source_b2b_id` (text) -- az EVIONOR-beli b2b_questionnaire_responses.id
- Kapcsolat: company_name, contact_name, phone, email
- Alap kvalifikacio: project_type, location_type, charger_count, urgency
- Kivitelezes: has_own_electrician, qualification_branch (A/B/C)
- A ag mezok: car_types, ev_type, phases, main_fuse, needs_load_management, has_solar, has_wifi, cable_or_socket, features_needed (text[]), offer_sent, discount_applied
- B ag mezok: has_electrical_prep, wants_photos, photos_received, needs_technical_callback
- Lezaras: lead_temperature (hot/warm/cold), next_step, notes, status
- RLS: public ALL (admin-only app)

### 2. Frontend kliens bovites
- `src/integrations/evionor/client.ts`: `queryEvionorTable` union type-hoz `b2b_questionnaire_responses` hozzaadasa + uj `getB2BQuestionnaireResponses()` fuggveny
- `src/integrations/evionor/types.ts`: uj `B2BQuestionnaireResponse` interface

### 3. B2B Lead Manager oldal (`/b2b-leads`)
- Lista nezet: EVIONOR-bol keri le a `b2b_questionnaire_responses` adatokat (ugyanugy mint a meglevo LeadManager a `questionnaire_responses`-t)
- Kartya nezet lead adatokkal (cegnev, nev, email, tel, helyszin, flotta meret, timeline)
- Statusz szuro, paginacio
- "Kvalifikalas" gomb: megnyitja a kvalifikalasi urlapot

### 4. B2B Kvalifikalasi urlap (`B2BQualifyForm`)
Egyoldalas, szekciokra osztott form a hivas script alapjan:

1. **Kapcsolatfelvetel** -- elore kitoltve az EVIONOR adatokbol (cegnev, nev, tel, email), + "Elertek?" toggle
2. **Igenyfelmeres** -- projekt tipus (multi-select), helyszin, darabszam, idozites, surgosseg
3. **Kivitelezes dontes** -- van sajat villanyszerelo? (A/B/C valasztas)
4. **A ag** (feltételes) -- auto tipusok, fazis, biztositek, terheles, napelem, wifi, kabel/aljzat, funkciok (checkbox group)
5. **B ag** (feltételes) -- elektromos elokeszites, foto bekeres, technikai visszahivas
6. **Lezaras** -- lead hofok, kovetkezo lepes, megjegyzes

Mentes a helyi `b2b_qualifications` tablaba.

### 5. Navigacio
- `App.tsx`: uj `/b2b-leads` route
- `Index.tsx`: "B2B Leads" gomb a meglevo "Lead Manager" melle

### Fajlok

```text
Uj:
  src/pages/B2BLeadManager.tsx
  src/components/b2b/B2BQualifyForm.tsx
  src/types/b2b.ts

Modositott:
  src/integrations/evionor/client.ts (b2b tabla hozzaadasa)
  src/integrations/evionor/types.ts (B2B interface)
  src/App.tsx (route)
  src/pages/Index.tsx (navigacio)

Migracio:
  b2b_qualifications tabla letrehozasa (helyi Supabase)
```

