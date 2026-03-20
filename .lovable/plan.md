

## Plan: Default phases to "3" when missing

### Problem
The `manage-residential-automation` endpoint blocks enabling automation if any "new" lead has missing `phases`. The lead `orso@freemail.hu` has no phases value, blocking the toggle.

### Change
In `normalizeResidentialLead` (both files), phases already defaults to `"1"` when invalid. But the blocker is in `auditResidentialLead` — it flags `phases` as missing before normalization ever runs.

**Fix**: Remove `phases` from `AUTOMATION_REQUIRED_FIELDS` in the audit function, and instead let `normalizeResidentialLead` default missing/invalid phases to `"3"`.

### Files to edit

**1. `supabase/functions/_shared/residentialOfferServer.ts`**
- Remove `{ key: "phases", label: "phases" }` from `AUTOMATION_REQUIRED_FIELDS`
- Remove the `isSupportedPhase` check in `auditResidentialLead` (lines 38-40)
- Change default in `normalizeResidentialLead`: when phases is missing/invalid, default to `"3"` instead of `"1"`

**2. `src/shared/residentialOffer.ts`** (if it has the same logic — sync)

**3. Redeploy edge functions**: `process-residential-offers`, `manage-residential-automation`, `render-residential-offer`

### Result
- Leads with missing phases will no longer block automation
- They'll default to 3-phase and get Zaptec Go + Easee Charge Up templates
- Leads with explicit "1" or "3" continue working as before

