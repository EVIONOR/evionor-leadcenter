

## Plan: Stats Dashboard a főoldalon

### Áttekintés
Új "Stats" gomb a főoldal fejlécébe, amely egy modális/dialog ablakot nyit meg lead statisztikákkal: napi beérkezés oszlopdiagram + KPI mutatók dátumszűréssel.

### Komponensek

**1. `src/components/stats/LeadStatsDialog.tsx`** — Fő dialog komponens
- Gomb a fejlécben (BarChart3 ikon + "Stats" felirat)
- Dialog/Sheet megnyitáskor az összes lead lekérése az EVIONOR-ból (`queryEvionorTable("questionnaire_responses")`)
- Dátumszűrő (preset: 7 nap, 30 nap, 90 nap, összes + egyéni dátumválasztó)
- Kliens-oldali szűrés és aggregálás a lekért adatokon

**2. `src/components/stats/DailyLeadsChart.tsx`** — Napi beérkezés oszlopdiagram
- Recharts BarChart a meglévő chart komponensekkel (`ChartContainer`, `ChartTooltip`)
- X tengely: napok, Y tengely: lead szám
- Időtáv változtatható a szűrővel

**3. `src/components/stats/LeadKPIs.tsx`** — KPI kártyák
- **Budapest + Pest megye arány**: `location` mező alapján szűrés (Budapest, Pest megye városai) vs. összes
- **Egyedi megyék %**: `location` mezőből megye meghatározás → oszlopdiagram vagy táblázat az arányokkal
- **Timeline arány**: `timeline` mező szerinti megoszlás (ASAP, 1-month, 3-month, 3month+) — kör- vagy oszlopdiagram

### Adatforrás
- A `queryEvionorTable` hívást használjuk limit nélkül (vagy nagy limittel) hogy az összes leadet megkapjuk
- A `location` mező tartalmazza a város nevet — a `hungarianCitiesComplete.ts` fájlból megállapítható melyik városhoz melyik megye tartozik
- A `timeline` mező közvetlenül tartalmazza az értékeket

### Megye meghatározás
- A `hungarianCitiesComplete.ts` adatbázist használjuk a város → megye leképezéshez
- Budapest + Pest megye: ahol a megye "Pest" vagy a város "Budapest"

### Fájlok
| Fájl | Művelet |
|------|---------|
| `src/components/stats/LeadStatsDialog.tsx` | Létrehozás |
| `src/components/stats/DailyLeadsChart.tsx` | Létrehozás |
| `src/components/stats/LeadKPIs.tsx` | Létrehozás |
| `src/pages/Index.tsx` | Stats gomb hozzáadás a fejlécbe |

### Technikai részletek
- Recharts (már telepítve) a diagramokhoz
- shadcn Dialog + Tabs a megjelenítéshez
- A `hungarianCitiesComplete.ts`-ből city→county mapping kinyerése
- Dátumszűrő: Select komponens preset értékekkel

