import { readFile } from "node:fs/promises";

const STATES = new Set(["PARKED_OVERLAP", "BLOCKED_EXTERNAL", "PARKED_TIER3", "SAFE_ABSENCE", "SOURCE_CONTRACT_ONLY"]);
const ASSET_STATES = new Set(["OBSERVED_HTML_ONLY", "IDENTITY_BLOCKED", "STALE_DEPLOYMENT", "NOT_PUBLIC_BROWSER_SURFACE", "OBSERVED_SOURCE_BOUND"]);
const SHA = /^[0-9a-f]{40}$/;

export function validatePortfolio(manifest) {
  const failures = [];
  if (manifest?.schema_version !== 1) failures.push("schema_version_invalid");
  if (manifest?.secret_values_included !== false) failures.push("secret_value_evidence_forbidden");
  if (!manifest?.captured_at || Number.isNaN(Date.parse(manifest.captured_at))) failures.push("capture_time_missing");
  if (!Array.isArray(manifest?.apps) || manifest.apps.length < 10) return [...failures, "portfolio_incomplete"];
  const forbiddenKey = (value) => value && typeof value === "object" && Object.entries(value).some(([key, nested]) =>
    (/^(?:secret|token|password|api_key)$/i.test(key) && nested != null) || forbiddenKey(nested),
  );
  if (forbiddenKey(manifest)) failures.push("forbidden_secret_field");
  const ids = new Set();
  const primaryRepos = new Set();
  const candidatePrs = new Set();
  for (const app of manifest.apps) {
    if (!app.app_id || ids.has(app.app_id)) failures.push(`duplicate_app:${app.app_id || "missing"}`);
    ids.add(app.app_id);
    if (!app.owner) failures.push(`owner_missing:${app.app_id}`);
    if (!STATES.has(app.state)) failures.push(`state_invalid:${app.app_id}`);
    if (!app.primary_repo?.startsWith("EVIONOR/") || primaryRepos.has(app.primary_repo)) failures.push(`primary_repo_duplicate_or_invalid:${app.app_id}`);
    primaryRepos.add(app.primary_repo);
    if (!SHA.test(app.main_commit || "")) failures.push(`main_commit_invalid:${app.app_id}`);
    if (!ASSET_STATES.has(app.public_asset_state)) failures.push(`asset_state_invalid:${app.app_id}`);
    if (app.public_url !== null && !/^https:\/\//.test(app.public_url)) failures.push(`public_url_invalid:${app.app_id}`);
    if (!app.source_contract) failures.push(`source_contract_missing:${app.app_id}`);
    if (app.candidate_pr) {
      if (candidatePrs.has(app.candidate_pr)) failures.push(`duplicate_candidate:${app.candidate_pr}`);
      candidatePrs.add(app.candidate_pr);
      if (app.state !== "BLOCKED_EXTERNAL") failures.push(`candidate_not_blocked:${app.app_id}`);
    }
    for (const related of app.related_repos || []) {
      if (related === app.primary_repo) failures.push(`related_equals_primary:${app.app_id}`);
    }
  }
  return failures;
}

if (import.meta.url === new URL(`file:///${process.argv[1]?.replace(/\\/g, "/")}`).href) {
  const path = process.argv[2];
  if (!path) throw new Error("usage:portfolio.json");
  const manifest = JSON.parse(await readFile(path, "utf8"));
  const failures = validatePortfolio(manifest);
  if (failures.length) {
    console.error(`WP6 app portfolio rejected:\n- ${failures.join("\n- ")}`);
    process.exit(1);
  }
  console.log(`WP6 app portfolio valid: ${manifest.apps.length} unique applications.`);
}
