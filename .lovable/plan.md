

## Problem: Lead Manager Filter Performance Issues

### Identified Issues

**1. B2C LeadManager — `toast` in useEffect dependency array (line 163)**
The `useToast` hook returns a new `toast` function reference on renders. Since `toast` is in the useEffect dependency array, this causes unnecessary refetches — sometimes double-fetching when a toast is shown during a fetch.

**2. B2C LeadManager — Full loading spinner on every fetch (line 99)**
`setLoading(true)` runs on every filter/page change, showing the full-page spinner. Only the initial load should show the spinner; subsequent fetches should happen in the background (like B2B already partially does with `isInitialLoad`).

**3. B2C "False" filter — Re-fetches all 1000+ leads on every page change**
When paginating within the False filter, the entire dataset is re-fetched from the server. The data should be cached and only re-fetched when the filter changes, not on page changes.

**4. B2B LeadManager — Fetches ALL qualifications + ALL leads on every interaction**
`fetchResponses()` calls `manage-qualifications` (list) AND `getB2BQuestionnaireResponses` on every filter change, page change, and after status updates. The qualifications list rarely changes and could be cached.

**5. B2B "False" filter — Same re-fetch issue as B2C**
Paginating within False re-fetches all B2B leads.

### Fix Plan

**File: `src/pages/LeadManager.tsx`**
- Remove `toast` from useEffect dependency array
- Add `isInitialLoad` ref (like B2B has) — only show full spinner on first load
- For False filter: split dependencies so all-leads fetch only runs when `statusFilter` changes, and page changes only re-slice the cached `allFalseLeads`

**File: `src/pages/B2BLeadManager.tsx`**
- Cache qualifications in a ref, only refetch when explicitly needed (status change, initial load)
- For False filter: same pagination-from-cache fix
- Remove `fetchResponses` from `handleStatusChange` error path (or at minimum debounce it)

### Scope
- 2 files: `src/pages/LeadManager.tsx`, `src/pages/B2BLeadManager.tsx`

