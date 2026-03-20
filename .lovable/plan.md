

## Problem

The Stats page fetches B2C leads with `limit: 5000, order: ascending`, but the EVIONOR PostgREST server caps responses at 1000 rows. Since the order is ascending (oldest first), only the oldest 1000 leads are returned. The most recent ~300+ leads are cut off, so the 30-day filter shows 0 results.

B2B is unaffected because it only has ~59 leads total.

## Fix

Implement pagination in `Stats.tsx` to fetch all rows in batches of 1000.

### File: `src/pages/Stats.tsx`

Replace the single `queryEvionorTable` call for B2C with a loop:

```text
async function fetchAllPages(table, select, order) {
  const PAGE = 1000
  let offset = 0
  let all = []
  while (true) {
    const result = await queryEvionorTable(table, {
      limit: PAGE, offset, select, order
    })
    const rows = result?.data || []
    all.push(...rows)
    if (rows.length < PAGE) break
    offset += PAGE
  }
  return all
}
```

- Call this for B2C (`questionnaire_responses`) instead of the single query
- B2B can stay as a single call (only ~59 rows)
- No other changes needed

### Scope
- 1 file edited: `src/pages/Stats.tsx`
- Add a `fetchAllPages` helper and use it in the `useEffect`

