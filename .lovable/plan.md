

## Problémák a `quotePdf.ts` fájlban (szerver-oldali PDF generátor)

### 1. Angol szöveg — miért?

A `supabase/functions/_shared/quotePdf.ts` fájlt valaki (vagy az AI) angol nyelven írta meg, míg a kliens-oldali verzió (`src/lib/generateQuotePdf.ts`) teljesen magyar. Összehasonlítás:

| Szerver-oldali (quotePdf.ts) | Kliens-oldali (generateQuotePdf.ts) |
|-----|-----|
| "Residential EV charger quote" | "Árajánlat" |
| "Quote" | "Árajánlat" |
| "Date:" / "Valid until:" | "Árajánlat dátuma:" / "Érvényesség:" |
| "Issuer" | "ÁRAJÁNLAT KIBOCSÁTÓ" |
| "Customer" | "ÜGYFÉL ADATAI" |
| "Offer details" | Táblázat fejléc |
| "Item" / "Gross price" | "MEGNEVEZÉS" / "BRUTTÓ ÁR" |
| "Product link" | "Termék megtekintése:" |

A szerver-oldali fájl egy korábbi, egyszerűsített verzió, ami nem követi a kliens-oldali magyar sablont.

### 2. Elcsúszott téglalap — miért?

A díszítő doboz (`drawRectangle`, sor 173) koordinátái (`y: PDF_PAGE_HEIGHT - 500`, `height: 174`) nem egyeznek a benne lévő tartalom koordinátáival (528-638 tartomány). A doboz y=342-516 között van, a tartalom y=204-314 között → üres doboz fent, tartalom lent alatta.

### Javítás

**Fájl: `supabase/functions/_shared/quotePdf.ts`**

A teljes PDF-et újraírni a kliens-oldali `generateQuotePdf.ts` mintájára:
- Minden szöveg magyarra (Árajánlat, Kibocsátó, Ügyfél adatai, Megnevezés, Bruttó ár, stb.)
- Cégadatok bővítése (adószám, cégjegyzékszám, bankszámlaszám)
- Nettó/ÁFA/Bruttó összesítő sor
- Helyes pozícionálás a doboznak
- Lábléc: "Ez az árajánlat elektronikusan készült és aláírás nélkül érvényes."
- Megtartani a `sanitizePdfText` megoldást (pdf-lib nem támogatja az ékezeteket StandardFonts-szal)

### Scope
- 1 fájl: `supabase/functions/_shared/quotePdf.ts`

