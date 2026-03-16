

## Diagnózis

A kód logikája helyes — a `loadManager` változó megfelelően van scope-olva és használva mind az email sablonban, mind a PDF-ben. 

A valószínű probléma: **az email preview nem frissül automatikusan** ha a toggle-t a generálás UTÁN kapcsolja be a felhasználó. Az email HTML csak az "Email generálása" gomb megnyomásakor generálódik, és nem reagál a toggle változásaira utólag.

## Megoldás

**Fájl: `src/components/b2b/B2BEmailGenerator.tsx`**

1. **Auto-regenerálás toggle változáskor** — Ha már van generált email (`generatedEmail` nem üres), a `includeLoadManagement` vagy `includeInstallation` toggle változásakor automatikusan újra kell generálni az emailt. Ezt egy `useEffect`-tel oldjuk meg, ami figyeli ezeket a state változókat.

2. **Vizuális jelzés** — A toggle bekapcsolásakor, ha már van generált email, jelenítsünk meg egy figyelmeztetést: "Az email újragenerálása szükséges" — vagy inkább automatikusan generáljuk újra.

3. **Alternatív egyszerűbb megoldás** — A generált emailt töröljük (`setGeneratedEmail("")`) amikor bármely beállítás változik (toggle, kedvezmény, töltő kiválasztás), így a felhasználónak újra kell nyomnia az "Email generálása" gombot a friss beállításokkal.

A 3. opció a legegyszerűbb és legkevésbé hibahajlamos: minden beállítás-változásnál reset-eljük a preview-t, így mindig friss emailt generál a felhasználó.

