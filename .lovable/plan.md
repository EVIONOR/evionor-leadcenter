

# Fedélzeti Tolto (Onboard Charger) Megjelenitese

## Osszefoglalo
Az ev-data.json tartalmazza a `charging.ac.max_power_kw` mezot (pl. 11.0 kW), amely a fedélzeti töltő mérete. Ezt az adatot ki kell bővíteni az EVModel interface-be, megjeleníteni a form "Autó típus" label mellett, és beilleszteni az email sablonba az autó típus mellé zárójelben.

## Technikai lepesek

### 1. EVModel interface bovitese
**Fajl:** `src/data/evDatabase.ts`
- Uj opcionalis mezo: `onboardChargerKw?: number`
- A fallback adatbazisban nem lesz kitoltve (opcionalis marad)

### 2. OpenEV transzformacio bovitese
**Fajl:** `src/data/openEvTransform.ts`
- `OpenEVVehicle` interface-be `charging` mezo hozzaadasa:
  ```
  charging?: {
    ac?: { max_power_kw?: number; phases?: number }
  }
  ```
- `transformOpenEVData` fuggvenyben kinyerni a `v.charging?.ac?.max_power_kw` erteket es tarolni az `EVModel.onboardChargerKw`-ban

### 3. useEVData hook bovitese
**Fajl:** `src/hooks/useEVData.ts`
- Uj fuggveny: `getOnboardChargerKw(brand, model) => number | undefined`
- Visszaadja a kivalasztott auto fedélzeti töltőjének méretét

### 4. BasicInfoSection - megjelenites a form label-ben
**Fajl:** `src/components/questionnaire/sections/BasicInfoSection.tsx`
- A `selectedModel` kivalasztasa utan lekerni az onboard charger erteket
- Az "Autó típus" FormLabel szoveg melle kiirni: `Autó típus (fedélzeti töltő: 11kW)` -- csak ha van ertek

### 5. Email sablon frissitese
**Fajl:** `src/components/questionnaire/EmailGenerator.tsx`
- Az auto tipust megjelenito sorban (sor ~567): a `carBrand carModel` melle zarojelben hozzaadni az onboard charger erteket
- Peldaul: `Tesla Model 3 Standard Range (11kW fedélzeti töltő)`
- Ehhez az `EmailGenerator` komponensnek is hasznalnia kell a `useEVData` hook-ot

### Emlekeztet az EVIONOR edge function-rol
Az email sablon frissitese utan a `process-leads/index.ts`-ben is erdemeshet hasonlo modositast vegezni, de az manualis copy-paste szukseges az EVIONOR Supabase-be.

