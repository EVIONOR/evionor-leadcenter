# WP6 exact read-only production access request

Grant a time-bounded read-only operator session for Supabase project
`rhbfjjfbulppqhjjxofh`. Required evidence only:

1. deployed Edge Function names, versions and deployment timestamps;
2. cron/schedule definitions and enabled state;
3. boolean values plus updated timestamps for `automatic_processing_enabled`,
   `b2b_automation_enabled` and `b2b_auto_group_enabled`;
4. aggregate queue pending/failed counts and latest-created/processed timestamps;
5. secret names only—never values;
6. project ref, capture timestamp and operator identity.

No SQL mutation, function invocation, webhook replay, lead fetch, secret read,
subscription change, email or campaign action is authorized. Export the fields
to the verifier JSON shape and run:

`node scripts/verify-wp6-production-state.mjs evidence.json`

The verifier checks structure and source fail-closed invariants. It does not
claim deployment equivalence merely because an export is structurally valid.
