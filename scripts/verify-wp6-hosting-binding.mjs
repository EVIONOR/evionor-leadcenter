import { readFile } from "node:fs/promises";
import { ALLOWED_TARGETS } from "./probe-wp6-public-assets.mjs";

const TARGETS = {
  "wizard-suffix": {
    repo: "EVIONOR/charger-offer-wizard-c89ba3bc",
    intended_commit: "1dc99567f609cef417f8d0ae335b4dd15533d174",
    rollback_commit: "df3ed053830e7f5bfbf0c292fa2864ff70076267",
  },
  "lead-center": {
    repo: "EVIONOR/evionor-leadcenter",
    intended_commit: "0371538b3c83c239d5013e8cb84b5e76801fbcc0",
  },
};

const fullSha = /^[0-9a-f]{40}$/;
const digest = /^[0-9a-f]{64}$/;

export function validateHostingEvidence(evidence) {
  const failures = [];
  const target = TARGETS[evidence?.target];
  const expectedUrl = ALLOWED_TARGETS.get(evidence?.target);
  if (!target || !expectedUrl) return ["target_not_allowlisted"];
  if (evidence.production_url !== expectedUrl) failures.push("production_url_mismatch");
  if (evidence.secret_values_included !== false) failures.push("secret_value_evidence_forbidden");
  if (!evidence.captured_at || Number.isNaN(Date.parse(evidence.captured_at))) failures.push("capture_time_missing");
  if (!Array.isArray(evidence.assets) || !evidence.assets.some((asset) => asset.path?.endsWith(".js"))) {
    failures.push("javascript_asset_missing");
  }
  for (const asset of evidence.assets || []) {
    if (!/^\/[^?#]+\.(?:js|css)$/.test(asset.path || "")) failures.push("invalid_asset_path");
    if (!Number.isInteger(asset.bytes) || asset.bytes <= 0) failures.push("invalid_asset_size");
    if (!digest.test(asset.sha256 || "")) failures.push("invalid_asset_digest");
  }

  const hosting = evidence.hosting_metadata;
  if (hosting == null) {
    if (evidence.binding_status !== "IDENTITY_BLOCKED") failures.push("missing_hosting_metadata_must_block");
    return failures;
  }
  if (!hosting.project_id) failures.push("hosting_project_id_missing");
  if (hosting.connected_repo !== target.repo) failures.push("connected_repo_mismatch");
  if (hosting.production_branch !== "main") failures.push("production_branch_mismatch");
  if (!fullSha.test(hosting.deployed_commit || "")) failures.push("deployed_commit_invalid");
  if (hosting.secret_values_included !== false) failures.push("hosting_secret_value_evidence_forbidden");
  if (evidence.binding_status === "DEPLOYED_MATCH" && hosting.deployed_commit !== target.intended_commit) {
    failures.push("deployed_commit_not_intended");
  }
  if (evidence.binding_status === "STALE_DEPLOYMENT" && hosting.deployed_commit === target.intended_commit) {
    failures.push("stale_status_contradicts_commit");
  }
  if (!['DEPLOYED_MATCH', 'STALE_DEPLOYMENT'].includes(evidence.binding_status)) {
    failures.push("invalid_binding_status_with_metadata");
  }
  return failures;
}

if (import.meta.url === new URL(`file:///${process.argv[1]?.replace(/\\/g, "/")}`).href) {
  const path = process.argv[2];
  if (!path) throw new Error("usage:evidence.json");
  const evidence = JSON.parse(await readFile(path, "utf8"));
  const failures = validateHostingEvidence(evidence);
  if (failures.length) {
    console.error(`WP6 hosting evidence rejected:\n- ${failures.join("\n- ")}`);
    process.exit(1);
  }
  console.log(`WP6 hosting evidence valid: ${evidence.target} ${evidence.binding_status}.`);
}
