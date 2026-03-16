

## Terhelésmenedzsment — B2B vs B2C összehasonlítás

A B2B email generátorban a terhelésmenedzsment toggle **már működik**: bekerül az email sablonba és a PDF ajánlatba is, ha az operátor bekapcsolja. Azonban van néhány eltérés a B2C verzióhoz képest, amit érdemes kijavítani:

### Jelenlegi eltérések

1. **Hiányzó termék URL-ek** — A B2C verzió kattintható linkként jeleníti meg a terhelésmenedzser nevét (pl. `evionor.hu/products/zaptec-sense-...`), a B2B verzió nem tartalmaz URL-eket a `LOAD_MANAGERS` tömbben.

2. **Megjelenítési stílus** — A B2C "Opciós tételek" fejléc alatt sorolja fel (kattintható terméklink + ár), a B2B egy külön "Terhelésmenedzsment" fejléces dobozt használ — ez valójában jobb a B2B kontextusban.

3. **Charge Amps hiányzik** — A B2C verzióban van Charge Amps Amp Guard opció is, a B2B `LOAD_MANAGERS`-ből hiányzik.

### Terv

**Fájl: `src/components/b2b/B2BEmailGenerator.tsx`**

1. **URL-ek hozzáadása a `LOAD_MANAGERS` tömbhöz** — Zaptec Sense és Easee Equalizer terméklink hozzáadása, plusz Charge Amps Amp Guard hozzáadása a tömbhöz (a B2C-ből átvett URL-ekkel).

2. **Email sablon frissítése** — A terhelésmenedzser neve legyen kattintható link (mint a B2C-ben), az `<a href>` stílussal.

3. **`detectLoadManager` bővítése** — Charge Amps felismerés hozzáadása.

Nincs új fájl, egyetlen fájl módosítás.

