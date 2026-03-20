

## Plan: Fix "Ismeretlen" megye — jobb location→megye feloldás

### Probléma
A `getCountyByCity` függvény pontos egyezést keres a város nevére, de a `location` mező az EVIONOR adatbázisban tartalmazhat:
- Irányítószámot (pl. "1116", "2030")
- Budapest kerületet (pl. "Budapest, XI. kerület" vagy "Budapest XI")
- Város nevet eltérő formátumban (ékezetek, szóközök, stb.)
- Város + irányítószám kombinációt (pl. "2030 Érd")

Ezért a leadek 70%-ánál nem talál egyezést → "Ismeretlen".

### Megoldás

**Fájl: `src/components/stats/countyMapping.ts`**

A `getCountyByCity` függvényt kibővíteni több lépcsős feloldással:

1. **Irányítószám detektálás**: Ha a bemenet 4 számjegy, közvetlenül keresés a `zipToCounty`-ból (első 2 jegy)
2. **Budapest kerület**: Ha tartalmazza a "budapest" szót → "Budapest"
3. **Város + irányítószám kombináció**: Ha tartalmaz 4 jegyű számot, azt kiszedni és zip-ként kezelni
4. **Pontos egyezés**: Meglévő város→megye lookup (mint most)
5. **Részleges egyezés**: Ha nincs pontos találat, keresni a `cityToCountyMap`-ben részleges egyezéssel (a location szó benne van-e valamelyik város nevében, vagy fordítva)

### Scope
- 1 fájl módosítás: `src/components/stats/countyMapping.ts`

