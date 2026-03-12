

# B2B Kvalifikacio Bovites - Terv

## 1. B ag bovites: telepitesi es tolto kivalasztasi kerdesek

A B ag (nincs sajat villanyszerelo) bovul:
- **Telepitesi korulmenyek**: elerheto betap fazisok, amper, toltopontok tavolsaga a foelosztotol
- **Tolto kivalasztasi kerdesek**: ugyanazok mint az A agnal (auto tipusok, EV tipus, fazis, biztositek, terhelesmen., napelem, wifi, kabel/aljzat, funkciok)

Uj DB oszlopok a `b2b_qualifications` tablaban:
- `distance_from_panel` (text) -- tavolsag a foelosztotol

A `phases` es `main_fuse` mar letezik, ezeket a B agnal is megjelenitem.

## 2. B2B Email Generator komponens

Uj komponens: `src/components/b2b/B2BEmailGenerator.tsx`

Funkcionalitas:
- **Tolto valasztas**: ugyanazok a chargerTemplates mint a B2C-ben (multi-select)
- **Kedvezmeny**: operator altal beallithato % vagy fix osszeg kedvezmeny az arakra
- **Telepites opcionalis**: toggle + kabel tavolsag valasztas a telepitesi arhoz:
  - 5m kábelig: 219 000 Ft
  - 10m kábelig: 249 000 Ft
  - 20m kábelig: 299 000 Ft
  - 30m kábelig: 349 000 Ft
- **Email sablon**: a meglevo B2C email sablonra epul, de B2B adatokkal (cegnev, kapcsolattarto, helyszin)
- **PDF ajanlat generalas** es feltoltes (mint a B2C-ben)
- **Email kuldes** a Resend edge function-on keresztul

## 3. Integralas a B2BQualifyForm-ba

A kvalifikalasi urlap aljara kerul az email generator szekciokent, vagy kulon tab/gombbal elerheto.

## 4. Fajlok

```text
Uj:
  src/components/b2b/B2BEmailGenerator.tsx

Modositott:
  src/components/b2b/B2BQualifyForm.tsx (B ag bovites + email generator integralas)
  src/types/b2b.ts (distance_from_panel mezo)

Migracio:
  distance_from_panel oszlop hozzaadasa
```

## Technikai reszletek

- A kedvezmeny %-ban mukodik, az operator 0-50% kozott allithatja be, minden toltore egysegesen alkalmazodik
- A telepitesi ar a kabel tavolsag alapjan automatikusan valasztodik ki
- Az email HTML sablon a meglevo B2C sablonra epul, de ceg-specifikus adatokkal (cegnev vs ugyfel nev, helyszin vs epulet tipus)
- A `chargerTemplates` es `priceList` adatforrasokat ujrahasznaljuk

