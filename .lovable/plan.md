
# PDF Árajánlat generátor

## Összefoglaló
Minden töltőhöz automatikusan generálódik egy Billingo-stílusú PDF árajánlat, feltöltésre kerül a cloud storage-ba, és az emailben az "Ajánlat letöltése" gomb mutat rá.

## Elkészült

- `quotes` storage bucket létrehozva (publikus olvasás)
- `src/lib/generateQuotePdf.ts` - jsPDF alapú PDF generátor Billingo-stílusban
  - Cégadatok: Nordisk Inova Kft, adószám, cégjegyzékszám, bankszámlaszám (K&H)
  - Ügyfél adatok az emailből
  - Termék táblázat nettó/ÁFA/bruttó bontásban
  - 14 napos érvényesség
- `src/components/questionnaire/EmailGenerator.tsx` módosítva:
  - PDF generálás + feltöltés a cloud-ba email generáláskor
  - "Ajánlat letöltése" gomb a "Megnézem" mellett

## Fontos megjegyzés

Az EVIONOR Supabase `process-leads` edge function-ben is érdemes frissíteni az email template-et, ha ott is szeretnéd az "Ajánlat letöltése" gombot.
