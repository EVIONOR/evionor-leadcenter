

## Terv: Zaptec Go 22kW árcsökkentés 299 000 Ft-ra áthúzással

### Módosítandó fájlok (6 db)

**1. `src/data/priceList.ts` (sor 43)**
```
{ name: "Zaptec Go 22kW", price: 299000, originalPrice: 353000, category: "töltő" },
```

**2. `supabase/functions/_shared/priceList.ts` (sor 43)**
Ugyanaz a módosítás.

**3. `src/types/questionnaire.ts` (sor 58)**
`basePrice: 353000` → `basePrice: 299000`

**4. `supabase/functions/_shared/questionnaire.ts` (sor 58)**
Ugyanaz a módosítás.

**5. `supabase/functions/_shared/b2bOffer.ts` (sor 10-11)**
```
const ZAPTEC_GO_GROSS = 299000;
const ZAPTEC_GO_ORIGINAL_GROSS = 353000;
```
+ az email sablonban az áthúzott eredeti ár megjelenítése az aktuális ár mellett.

**6. B2C residential offer** (`src/shared/residentialOffer.ts` és `supabase/functions/_shared/residentialOffer.ts`)
Ezek már használják a `findOriginalPrice()` függvényt és az áthúzásos megjelenítést — a priceList módosítás automatikusan bekapcsolja.

### Hatás
- Mindkét B2B és B2C email generátorban a Zaptec Go 22kW ára **299 000 Ft** lesz, mellette **353 000 Ft** áthúzva
- A B2B auto-offer sablonban is frissül

