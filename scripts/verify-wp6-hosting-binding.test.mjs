import assert from "node:assert/strict";
import { probePublicAssets } from "./probe-wp6-public-assets.mjs";
import { validateHostingEvidence } from "./verify-wp6-hosting-binding.mjs";

function response(url, body, contentType = "text/plain") {
  const bytes = new TextEncoder().encode(body);
  return {
    ok: true,
    status: 200,
    url: String(url),
    text: async () => body,
    arrayBuffer: async () => bytes.buffer,
    headers: new Headers({ "content-type": contentType }),
  };
}

const calls = [];
const fakeFetch = async (url, options) => {
  calls.push({ url: String(url), options });
  if (String(url).endsWith("/")) {
    return response(url, '<script type="module" src="/assets/index-test.js"></script><link href="/assets/index-test.css" rel="stylesheet">', "text/html");
  }
  return response(url, String(url).endsWith(".js") ? "console.log('fixture')" : "body{}");
};

const probe = await probePublicAssets("wizard-suffix", fakeFetch);
assert.equal(probe.secret_values_included, false);
assert.equal(probe.assets.length, 2);
assert.equal(probe.assets[0].sha256.length, 64);
assert.ok(calls.every((call) => call.options.redirect === "error"));

const blocked = { ...probe, binding_status: "IDENTITY_BLOCKED" };
assert.deepEqual(validateHostingEvidence(blocked), []);

const matched = {
  ...probe,
  binding_status: "DEPLOYED_MATCH",
  hosting_metadata: {
    project_id: "non-secret-project-id",
    connected_repo: "EVIONOR/charger-offer-wizard-c89ba3bc",
    production_branch: "main",
    deployed_commit: "1dc99567f609cef417f8d0ae335b4dd15533d174",
    secret_values_included: false,
  },
};
assert.deepEqual(validateHostingEvidence(matched), []);

const falseClaim = {
  ...matched,
  hosting_metadata: { ...matched.hosting_metadata, deployed_commit: "df3ed053830e7f5bfbf0c292fa2864ff70076267" },
};
assert.ok(validateHostingEvidence(falseClaim).includes("deployed_commit_not_intended"));
assert.ok(validateHostingEvidence({ ...probe, binding_status: "DEPLOYED_MATCH" }).includes("missing_hosting_metadata_must_block"));
assert.ok(validateHostingEvidence({ ...blocked, secret_values_included: true }).includes("secret_value_evidence_forbidden"));
await assert.rejects(() => probePublicAssets("unknown", fakeFetch), /target_not_allowlisted/);

console.log("WP6 hosting probe and fail-closed binding verifier passed.");
