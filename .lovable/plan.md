

## Terv: Easee Equalizer Amp Csomag ár javítása 140 000 Ft-ra (bruttó)

### Probléma
Az Easee Equalizer Amp Csomag bruttó ára jelenleg **143 000 Ft** több helyen, de a helyes ár **140 000 Ft** (bruttó) / **110 000 Ft** (nettó).

### Módosítandó fájlok (5 db)

| Fájl | Jelenlegi | Új érték |
|------|-----------|----------|
| `src/data/priceList.ts` (sor 103) | `price: 143000` | `price: 140000` |
| `supabase/functions/_shared/priceList.ts` (sor 103) | `price: 143000` | `price: 140000` |
| `src/shared/residentialOffer.ts` (sor 146) | `price: 143000` | `price: 140000` |
| `supabase/functions/_shared/residentialOffer.ts` (sor 140) | `price: 143000` | `price: 140000` |
| `src/components/b2b/B2BEmailGenerator.tsx` (sor 62) | `netPrice: 110074, grossPrice: Math.round(110074 * 1.27)` | `netPrice: 110236, grossPrice: 140000` |

A B2B generátorban a nettó ár pontosítása: 140000 / 1.27 ≈ 110 236 Ft nettó (vagy kerekítve 110 000 Ft nettó, 139 700 bruttó). Mivel a felhasználó 110 000 nettó / 140 000 bruttó-t adott meg, a B2B sorban `netPrice: 110000, grossPrice: 140000` lesz.

### Érintett fájl megjegyzés
Az `src/integrations/evionor/process-leads/index.ts` (EVIONOR külső projekt) szintén tartalmazza 143 000-rel — ezt manuálisan kell frissíteni az EVIONOR dashboardon.

