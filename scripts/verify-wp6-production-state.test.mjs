import assert from "node:assert/strict";
import { validateEvidence } from "./verify-wp6-production-state.mjs";
import positive from "./fixtures/wp6-production-state-positive.json" with { type: "json" };
import negative from "./fixtures/wp6-production-state-negative.json" with { type: "json" };

assert.deepEqual(await validateEvidence(positive), []);
const failures = await validateEvidence(negative);
for (const expected of ["wrong_project_ref", "invalid_switch:b2b_automation_enabled", "function_inventory_incomplete", "queue_freshness_missing", "secret_value_evidence_forbidden"]) {
  assert.ok(failures.includes(expected), `negative fixture must fail:${expected}`);
}
console.log("WP6 Lead Center verifier passed positive fixture and fail-closed negatives.");
