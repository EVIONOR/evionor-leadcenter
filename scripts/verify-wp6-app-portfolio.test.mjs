import assert from "node:assert/strict";
import manifest from "./fixtures/wp6-app-portfolio.json" with { type: "json" };
import { validatePortfolio } from "./verify-wp6-app-portfolio.mjs";

assert.deepEqual(validatePortfolio(manifest), []);
const duplicate = structuredClone(manifest);
duplicate.apps[1].app_id = duplicate.apps[0].app_id;
duplicate.apps[1].primary_repo = duplicate.apps[0].primary_repo;
duplicate.apps[1].candidate_pr = "EVIONOR/ev-charge-finder-roi-95559#2";
duplicate.apps[1].secret = "forbidden";
const failures = validatePortfolio(duplicate);
assert.ok(failures.some((failure) => failure.startsWith("duplicate_app:")));
assert.ok(failures.some((failure) => failure.startsWith("primary_repo_duplicate_or_invalid:")));
assert.ok(failures.some((failure) => failure.startsWith("duplicate_candidate:")));
assert.ok(failures.includes("forbidden_secret_field"));

const unsafe = { ...manifest, secret_values_included: true };
assert.ok(validatePortfolio(unsafe).includes("secret_value_evidence_forbidden"));
console.log("WP6 app portfolio uniqueness and fail-closed tests passed.");
