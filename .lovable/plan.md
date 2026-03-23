

## Plan: Kalkuláció eredménye a visszaigazoló emailben

### Hol van a kód?
A visszaigazoló email a **B2B charger offer calc** (`charge-wizard-ai`) projektben van:
- `supabase/functions/send-welcome-email/index.ts` — email sablon + küldés
- `src/components/EVQuestionnaire.tsx` — itt hívja meg a `send-welcome-email` Edge Function-t

### Mi a teendő?
A `calculateROI()` eredményeit átadni a `send-welcome-email` Edge Function-nek, és az email HTML-be beépíteni a költség összehasonlítást és megtérülést (ajánlott töltők nélkül).

### Módosítások

**1. `src/components/EVQuestionnaire.tsx` (~340. sor)**
A `send-welcome-email` híváshoz hozzáadni a ROI adatokat:
```typescript
const roi = calculateROI();
await supabase.functions.invoke("send-welcome-email", {
  body: {
    email: data.email,
    name: data.name,
    roi: {
      fleetCount: roi.fleetCount,
      totalAnnualKm: roi.totalAnnualKm,
      annualConsumptionKwh: roi.annualConsumptionKwh,
      dcChargingCostPerYear: roi.dcChargingCostPerYear,
      acChargingCostPerYear: roi.acChargingCostPerYear,
      annualSavings: roi.annualSavings,
      netInvestment: roi.netInvestment,
      monthsToROI: roi.monthsToROI,
      chargingStations: roi.chargingStations,
      homeChargers: roi.homeChargers,
    },
  },
});
```

**2. `supabase/functions/send-welcome-email/index.ts`**
- Bővíteni az interfészt a `roi` objektummal
- Az email HTML-be beépíteni egy kalkuláció szekciót:
  - Nyilvános gyorstöltő éves költsége (piros doboz)
  - Otthoni/céges töltés éves költsége (kék doboz)
  - "Ha otthon töltesz nyilvános gyorstöltő helyett akkor:"
  - Éves megtakarításod (zöld doboz)
  - Töltőd megtérülési ideje (gradient doboz)
- Ajánlott töltők NEM kerülnek be
- Ha nincs `roi` adat (régi hívás), az email a jelenlegi formában jelenik meg (visszafelé kompatibilis)

### Vizuális felépítés az emailben

```text
┌─────────────────────────────────┐
│  Kedves [név]!                  │
│  Köszönjük, hogy kitöltötted... │
├─────────────────────────────────┤
│  Az Ön kalkulációjának eredménye│
│  ┌──────────┐ ┌──────────┐     │
│  │ DC költség│ │AC költség │     │
│  │ (piros)   │ │(kék)     │     │
│  └──────────┘ └──────────┘     │
│  Ha otthon töltesz...          │
│  ┌──────────┐ ┌──────────┐     │
│  │ Éves     │ │Megtérülés│     │
│  │megtakarít│ │  ideje   │     │
│  │ (zöld)   │ │(gradient)│     │
│  └──────────┘ └──────────┘     │
├─────────────────────────────────┤
│  EVIONOR.HU megtekintése       │
└─────────────────────────────────┘
```

### Fontos
Ez a módosítás a **charge-wizard-ai** projektben történik, nem ebben a projektben. Át kell váltani arra a projektre a módosításhoz.

### Scope
- 2 fájl a charge-wizard-ai projektben

