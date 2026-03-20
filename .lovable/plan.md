

## Plan: "False" lead szűrő — bővített heurisztikával

### `isFakeLead()` vizsgálati szempontok

**Név ellenőrzés:**
- Túl rövid (< 3 karakter)
- Csak azonos betűk ismétlése ("aaa", "bbb")
- Tartalmaz számokat
- Ismert teszt nevek: "test", "teszt", "próba", "asd", "asdf", "xxx", "abc", "qwer", "fake"
- Csak mássalhangzók vagy csak magánhangzók (nem valós név)
- Nincs benne szóköz (magyar neveknél elvárás a vezetéknév + keresztnév)

**Email ellenőrzés:**
- Ismert temp/teszt domainok: mailinator, yopmail, guerrillamail, tempmail, throwaway, sharklasers, grr.la, dispostable, maildrop, 10minutemail, trashmail
- Lokális rész csak azonos karakterek ("aaaa@")
- Lokális rész ismert teszt minta ("test", "asdf", "fake", "xxx", "aaa")
- Email és név teljesen megegyezik (pl. név: "test", email: "test@...")
- Túl rövid lokális rész (< 3 karakter a @ előtt)

**Telefon ellenőrzés:**
- Túl kevés számjegy (< 7 szám a formázás eltávolítása után)
- Csak azonos számok ("1111111", "0000000")
- Szekvenciális számok ("1234567", "7654321")
- Ismert fake számok ("0612345678", "06301234567")
- Tartalmaz betűket

**Kombinált szabályok:**
- Ha 2+ mező is gyanús → biztosan fake (egyenként lehetne véletlen, együtt nem)
- Név + email + telefon mind "minimális erőfeszítés" (pl. rövid név + rövid email + szekvenciális szám)

### Fájlok

| Fájl | Művelet |
|------|---------|
| `src/components/stats/fakeLead.ts` | Létrehozás — `isFakeLead()` a fenti szabályokkal |
| `src/pages/Stats.tsx` | Módosítás — select bővítés (name, email, phone), false szűrő toggle |
| `src/components/stats/LeadKPIs.tsx` | Módosítás — "False leadek" KPI kártya |
| `src/components/stats/DailyLeadsChart.tsx` | Módosítás — false lead megkülönböztetés (stacked bar, szürke szín) |

