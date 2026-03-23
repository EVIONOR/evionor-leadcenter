

## Plan: ROI szekció szövegmódosítások — mindkét projektben

### Probléma
A képernyőképen látható "Otthoni töltőd megtérülése" szekció szövegeinek módosítása szükséges:
- Új mondat beszúrása a DC/otthoni költség összehasonlítás és a megtakarítás/megtérülés dobozok közé: **"Ha otthon töltesz nyilvános gyorstöltő helyett akkor:"**
- "Éves megtakarítás" → **"Éves megtakarításod:"**
- "Megtérülési idő" → **"Töltőd megtérülési ideje:"**

### Hol találhatók ezek?

A képernyőképen lévő pontos szövegek ("Nyilvános gyorstöltő költség", "Otthoni töltési költség", "Éves megtakarítás", "Megtérülési idő") **egyetlen elérhető Lovable projektben sem találhatók**. Valószínűleg a Shopify-on hosztolt evionor.hu weboldal kódjában vannak, amihez itt nincs hozzáférésem.

A legközelebbi egyezés a [B2B charger offer calc](/projects/2ce23b2f-f5ab-45fb-bc9a-639ff1703e92) projektben van, de ott a címkék eltérnek:
- "Nyilvános gyorstöltő" (nem "Nyilvános gyorstöltő költség")
- "Megtakarítás velünk" (nem "Éves megtakarítás")
- "Megtérülési idő" (ez egyezik)

### Amit meg tudok csinálni

**1. B2B charger offer calc projekt** — hasonló módosítások:
- `src/lib/translations.ts`: `annualSavings` → "Éves megtakarításod:"
- `src/lib/translations.ts`: `roiPeriod` → "Töltőd megtérülési ideje:"
- `src/components/EVQuestionnaire.tsx`: Új sor beszúrása a DC/AC összehasonlító grid és a megtakarítás/megtérülés blokk közé

**2. Ez a projekt (lead management)** — a residential email sablonba nem releváns, mert az email nem tartalmaz ROI szekciót. Ha szeretnéd hozzáadni, azt külön kérésként tudom megcsinálni.

### Kérdés
Melyik projekt kódját módosítsam? A B2B charger offer calc-ot tudom módosítani, de a Shopify oldalt nem. Ha a Shopify-on van az eredeti, azt manuálisan kell frissíteni.

