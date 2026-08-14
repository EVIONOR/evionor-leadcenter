# WP6 canonical application portfolio

The machine-readable manifest assigns every customer-facing EVIONOR application exactly one Meta-coverage owner and one state. Primary repositories are unique; alternate forks are related evidence only, never a second candidate. Candidate PRs are unique and must remain externally blocked until hosting identity is proven.

Public asset observation is separate from deployed-commit identity. Only Wizard, Lead Center, B2B checkout and the Shopify calculator have proven public URLs. Unknown hostnames remain `IDENTITY_BLOCKED`; they are not guessed. Source absence is classified `SAFE_ABSENCE` only when no Meta sender exists, so no speculative sender is introduced.

The two active source candidates are ROI PR #2 and B2B Fleet PR #3. Shopify is a WP5 handoff, Partner Database is a WP3 handoff, Core schema/deployment remains Tier 3, and Wizard production deployment remains Tier 3/external-hosting blocked. There is no third overlapping source candidate.

Validate with `node scripts/verify-wp6-app-portfolio.mjs scripts/fixtures/wp6-app-portfolio.json`.
