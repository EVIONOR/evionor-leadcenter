# WP6 secret-free hosting/deployed-commit probe

This checker separates public asset observation from authoritative hosting metadata. It never executes application JavaScript, sends a lead or Meta event, reads a secret, deploys, or changes hosting configuration.

## Public probe

Run `node scripts/probe-wp6-public-assets.mjs wizard-suffix` or `node scripts/probe-wp6-public-assets.mjs lead-center`. Only the two allowlisted HTTPS origins are accepted. Redirects and cross-origin assets fail closed. The command prints HTML-linked JS/CSS paths, byte lengths and SHA-256 values to stdout.

## Binding evidence

Add read-only hosting metadata to the captured JSON: non-secret project ID, connected GitHub owner/repository, production branch, full deployed commit SHA, and `secret_values_included: false`. Until this metadata exists, `binding_status` must be `IDENTITY_BLOCKED`; a fingerprint alone is not a deployed-commit claim.

Validate with `node scripts/verify-wp6-hosting-binding.mjs evidence.json`. `DEPLOYED_MATCH` is accepted only when the metadata commit is the exact intended commit. A different commit must be recorded as `STALE_DEPLOYMENT`.

Current intended source identities are Wizard suffix main `1dc99567f609cef417f8d0ae335b4dd15533d174` and Lead Center main `0371538b3c83c239d5013e8cb84b5e76801fbcc0`; the Lead Center deployed commit remains deliberately unresolved until read-only provider metadata is available.

This unit does not authorize deployment, Pixel/secret/DNS/config changes, Edge Function deployment, Supabase writes, or live browser execution.
