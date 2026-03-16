

## Probléma

A `fetchResponses` függvény minden hívásnál `setLoading(true)`-t állít be, ami a teljes loading spinner-t mutatja (eltűnik a lista → spinner → újra megjelenik). Ez 30 másodpercenként ismétlődik a polling miatt, és minden `useEffect` trigger-nél (currentPage, statusFilter, itemsPerPage változás).

**Két probléma van:**
1. **`setLoading(true)` minden fetch-nél** – a háttér-frissítéseknél nem kellene loading state-et mutatni, csak az első betöltésnél
2. **30 mp-es polling felesleges** – a user csak belépéskor akarja frissíteni

## Javítás

**Fájl: `src/pages/B2BLeadManager.tsx`**

1. **Polling eltávolítása** – töröljük a `setInterval(fetchResponses, 30000)` sort az `useEffect`-ből
2. **Loading csak első betöltésnél** – a `setLoading(true)` csak akkor fusson, ha `responses` üres (vagy egy `initialLoad` ref-fel). A háttérfrissítéseknél (kvalifikációs formból visszalépés, filter/page változás) ne mutasson loading spinner-t, hanem csendben frissítsen.

Konkrétan: bevezetünk egy `isInitialLoad` ref-et, és `setLoading(true)` csak akkor hívódik, ha `isInitialLoad.current === true`. Az első sikeres fetch után `isInitialLoad.current = false`.

