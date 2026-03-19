

## Plan: Update Phase 3 Template Selection for Automated Offers

### Context
- Phase 1 already returns AMINA 1 + Charge Amps Halo — no change needed.
- Phase 3 (non-solar) currently returns only Zaptec Go — needs to also include Easee Charge Up.
- Solar integration cannot be derived from lead data (no field exists), so `solarIntegration` is hardcoded to `"nem"` in `normalizeResidentialLead`. The solar branch is unreachable for automated sends.

### Changes

**1. Update `getAutomaticResidentialTemplateIds` in both locations:**
- `src/shared/residentialOffer.ts`
- `supabase/functions/_shared/residentialOffer.ts`

Change phase 3 non-solar return from `["template3b"]` to `["template3b", "template3a"]` (Zaptec Go + Easee Charge Up).

**2. Redeploy edge functions:**
- `process-residential-offers`
- `render-residential-offer`

That's it — two file edits, two deploys.

