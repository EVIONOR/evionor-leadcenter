
# Üzemi hőmérséklet sor eltávolítása az Email generátorból

## Összefoglaló
Az email generátorban minden töltő jellemzői közül el kell távolítani az "Üzemi hőmérséklet" pontot.

## Változtatások

**Fájl: `src/components/questionnaire/EmailGenerator.tsx`**

A `getCharacteristics` függvényben törlöm az "Üzemi hőmérséklet" sort minden töltőnél:

| Töltő | Törlendő sor |
|-------|-------------|
| Zaptec Go 22kW | 274. sor |
| Easee Charge Up 22kW | 288. sor |
| Charge Amps Luna 22kW | 305. sor |
| AMINA 1 - 7.4kW | 319. sor |
| Charge Amps Halo 11kW | 333. sor |
| Zaptec Solar MID | 347. sor |

---

## Fontos megjegyzés

Emlékeztetlek, hogy az EVIONOR Supabase `process-leads` edge function-ben ugyanezek a jellemzők szerepelnek. Ha ott is szeretnéd frissíteni, azt manuálisan kell átvezetned az EVIONOR Supabase Dashboard-on.
