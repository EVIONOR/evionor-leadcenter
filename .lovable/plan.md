

## Plan: Megyenév felismerés a location mezőben

### Probléma
A `getCountyByCity` nem keresi a megyeneveket közvetlenül a `location` stringben. Ha a location "Pest megye", "Győr-Moson-Sopron" vagy hasonló formátumú, egyik lépés sem találja meg → "Ismeretlen".

### Megoldás

**Fájl: `src/components/stats/countyMapping.ts`**

Új lépés hozzáadása a Budapest-ellenőrzés után (2. lépésként): közvetlen megyenév keresés a location stringben.

- Létrehozni egy `COUNTY_NAMES` listát az összes magyar megyével (19 megye + Budapest)
- A location stringben keresni, hogy tartalmaz-e bármelyik megyenevet (case-insensitive)
- A "megye" szó eltávolítása a keresés előtt (pl. "Pest megye" → "Pest")
- Ez a lépés a Budapest-ellenőrzés után és a zip-kód keresés előtt fut

### Módosítás részletei

```text
Jelenlegi sorrend:          Új sorrend:
1. Budapest keyword         1. Budapest keyword
2. Pure zip                 2. ÚJ: Közvetlen megyenév keresés
3. Embedded zip             3. Pure zip
4. Exact city match         4. Embedded zip
5. Partial city match       5. Exact city match
                            6. Partial city match
```

A `COUNTY_NAMES` tömb tartalmazza az összes egyedi megyenevet a már meglévő `zipToCounty` map értékeiből — így nem kell karbantartani egy külön listát.

### Scope
- 1 fájl: `src/components/stats/countyMapping.ts`

