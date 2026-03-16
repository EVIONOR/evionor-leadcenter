

## Terv: "Saját villanyszerelő" szöveg mindig jelenjen meg

**Probléma:** A szöveg jelenleg a telepítési blokkon belül van (sor 473), ami csak akkor renderelődik, ha az `includeInstallation` toggle be van kapcsolva.

**Megoldás:** A szöveget ki kell emelni a telepítési feltételes blokkból, és önálló blokkként kell elhelyezni közvetlenül utána — a terhelésmenedzsment blokk előtt. Így mindig megjelenik az emailben, függetlenül attól, hogy a telepítés be van-e kapcsolva.

**Fájl:** `src/components/b2b/B2BEmailGenerator.tsx`
- Sor 473: törlés (a szöveg eltávolítása a telepítési blokkból)
- Sor 477 (`\` : ""\`}`) után új önálló blokk beszúrása:
  - Zöld hátterű (#d1fae5) kártya, a B2B stílushoz illeszkedő formázással
  - Szöveg: *"Van saját villanyszerelője? Rendelje meg csak a töltőt! A telepítésben és a beüzemelésben díjmentesen támogatjuk!"*

