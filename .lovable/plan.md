

## Plan: "False" lead szűrő a Lead Managerben

### Probléma
A jelenlegi szűrők (Mind, Új, Kontaktált, stb.) szerver-oldali státusz alapúak. A "False" lead egy kliens-oldali heurisztika (`isFakeLead`), nem DB mező, ezért más megközelítés kell.

### Megoldás

**Fájl: `src/pages/LeadManager.tsx`**

1. **Új "False" gomb** a filter sorba az "Auto kontaktált" után
2. Amikor a "False" filter aktív:
   - Az összes leadet lekérjük (status filter nélkül, lapozva mint a Stats oldalon)
   - Kliens-oldalon szűrjük az `isFakeLead()` függvénnyel
   - Kliens-oldali lapozás az eredményen
3. A többi filter változatlanul szerver-oldali marad

### Változások
- `statusFilter` lehetséges értékei közé felvenni a `"false"` értéket
- Ha `statusFilter === "false"`: összes lead lekérése → `isFakeLead` szűrés → kliens-oldali slice a megjelenítéshez
- Új gomb a filter sorban: "False" — szürke/sötét stílussal a többi mellé
- Import: `isFakeLead` from `@/components/stats/fakeLead`

### Scope
- 1 fájl módosítás: `src/pages/LeadManager.tsx`

