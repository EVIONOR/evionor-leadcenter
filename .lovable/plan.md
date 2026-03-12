

## Terv: Oldalankénti elemszám mező a B2B Lead Manager tetejére

### Mi változik

A B2B Lead Manager felső sávjába (top bar) kerül egy input mező, ahol beállítható az oldalanként megjelenő elemek száma. Az érték módosításakor 3 másodperces debounce után frissül az oldal.

### Technikai részletek

**Fájl: `src/pages/B2BLeadManager.tsx`**

1. A fix `itemsPerPage = 15` konstanst lecseréljük `useQueryState`-re (`perPage` query param, alapértelmezett: 15), ahogy a `LeadManager.tsx`-ben már megvan.
2. Hozzáadunk egy `useRef` alapú debounce-ot (3 mp timeout).
3. A top bar jobb oldalára kerül egy `Input` mező "Oldalanként:" címkével, `type="number"`, `min=1`, `max=100`, `defaultValue={itemsPerPage}`.
4. Az `onChange` handler 3 másodperces debounce után frissíti az `itemsPerPage` query state-et és visszaállítja a `currentPage`-et 1-re.
5. A `fetchResponses` függvény és a pagination logika az új `itemsPerPage` state-et használja a fix konstans helyett.
6. Import: `useRef`, `Input` komponens.

