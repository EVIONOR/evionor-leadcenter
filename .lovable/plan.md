

# Deployment Plan: Residential Offer Automation Runtime

## Current blockers

1. **Edge Functions import from `src/`** — `residentialOfferServer.ts` imports from `../../../src/shared/residentialOffer.ts`, and `render-residential-offer/index.ts` does the same. The Edge Function bundler only has access to `supabase/functions/`, so these imports fail at deploy time.

2. **`residentialOffer.ts` itself imports from `src/`** — it imports `priceList.ts` and `questionnaire.ts` from `src/data/` and `src/types/`.

3. **`config.toml` missing 3 function entries** — `render-residential-offer`, `process-residential-offers`, `manage-residential-automation` are not registered.

4. **Migration not applied** — the cron job, `pg_cron`/`pg_net` extensions, RLS tightening, and `residential_automation_enabled` default row are not yet in place.

5. **Settings RLS is too open** — current policies allow public read/insert/update. Your migration tightens this to deny all public access (service-role only), which is correct.

## Plan

### Step 1: Copy 3 shared files into Edge Functions

Duplicate into `supabase/functions/_shared/`:

| Source | New file |
|---|---|
| `src/shared/residentialOffer.ts` | `supabase/functions/_shared/residentialOffer.ts` |
| `src/data/priceList.ts` | `supabase/functions/_shared/priceList.ts` |
| `src/types/questionnaire.ts` | `supabase/functions/_shared/questionnaire.ts` |

Adjust imports in the copies:
- `residentialOffer.ts` → import from `./priceList.ts` and `./questionnaire.ts`

The `src/` originals stay untouched. Frontend keeps using them. This is duplication but unavoidable.

### Step 2: Fix imports in existing Edge Function files

- `residentialOfferServer.ts` line 1-8 → change `../../../src/shared/residentialOffer.ts` to `./residentialOffer.ts`
- `render-residential-offer/index.ts` line 4 → change `../../../src/shared/residentialOffer.ts` to `../_shared/residentialOffer.ts`

### Step 3: Update `config.toml`

Add entries (cannot edit directly since it's auto-managed, but the 3 new functions need `verify_jwt = false`):

```toml
[functions.render-residential-offer]
verify_jwt = false

[functions.process-residential-offers]
verify_jwt = false

[functions.manage-residential-automation]
verify_jwt = false
```

### Step 4: Apply the migration SQL you provided

This will be run via the **insert SQL tool** (not migration tool) since it contains project-specific URLs and anon keys:

- Enable `pg_cron` and `pg_net`
- Ensure `settings` table exists
- **Replace** current open RLS policies with deny-all (service-role only access)
- Add index on `settings.key`
- Insert `residential_automation_enabled = false` default row
- Create `invoke_process_residential_offers_job()` function
- Schedule cron job `process-residential-offers-every-2-hours` (every 2 hours)

### Step 5: Deploy all 4 Edge Functions

Deploy: `send-email`, `render-residential-offer`, `process-residential-offers`, `manage-residential-automation`

### Step 6: Verify

- Query `settings` table for `residential_automation_enabled` row = `{"enabled": false}`
- Confirm cron job exists
- Automation stays **disabled**

## What this does NOT change

- No business logic, template, pricing, or normalization changes
- No existing functions removed
- `src/` files untouched
- Automation flag stays disabled

## Risk: duplication

`residentialOffer.ts`, `priceList.ts`, `questionnaire.ts` will exist in both `src/` and `supabase/functions/_shared/`. Future changes to pricing or templates must be synced to both. This is an inherent Edge Function limitation.

