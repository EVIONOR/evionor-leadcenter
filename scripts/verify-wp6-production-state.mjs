import { readFile } from "node:fs/promises";

export async function validateEvidence(evidence, read = readFile) {
  const failures = [];
  if (evidence.project_ref !== "rhbfjjfbulppqhjjxofh") failures.push("wrong_project_ref");
  if (evidence.central_project_ref !== "zqnaexspgdlaccaqcsmq") failures.push("wrong_central_project_ref");
  for (const key of ["automatic_processing_enabled", "b2b_automation_enabled", "b2b_auto_group_enabled"]) {
    if (typeof evidence.switches?.[key] !== "boolean") failures.push(`invalid_switch:${key}`);
  }
  if (!Array.isArray(evidence.deployed_functions) || evidence.deployed_functions.length < 7) failures.push("function_inventory_incomplete");
  if (!Array.isArray(evidence.crons)) failures.push("cron_inventory_missing");
  if (!evidence.queue?.latest_created_at || !Number.isInteger(evidence.queue?.pending_count)) failures.push("queue_freshness_missing");
  if (evidence.secret_values_included !== false) failures.push("secret_value_evidence_forbidden");
  if (!evidence.captured_at || !evidence.operator) failures.push("capture_provenance_missing");

  const config = await read(new URL("../supabase/config.toml", import.meta.url), "utf8");
  if (!config.includes('project_id = "rhbfjjfbulppqhjjxofh"')) failures.push("source_project_mismatch");
  for (const [path, invariant] of [
    ["../supabase/functions/process-residential-offers/index.ts", 'if (mode === "scheduled")'],
    ["../supabase/functions/process-b2b-offers/index.ts", 'if (mode === "scheduled")'],
    ["../supabase/functions/manage-b2b-automation/index.ts", 'B2B_AUTOMATION_KEY = "b2b_automation_enabled"'],
  ]) {
    const source = await read(new URL(path, import.meta.url), "utf8");
    if (!source.includes(invariant)) failures.push(`source_invariant_missing:${path}`);
  }
  return failures;
}

if (import.meta.url === new URL(`file:///${process.argv[1]?.replace(/\\/g, "/")}`).href) {
  const path = process.argv[2];
  if (!path) throw new Error("usage:evidence.json");
  const evidence = JSON.parse(await readFile(path, "utf8"));
  const failures = await validateEvidence(evidence);
  if (failures.length) {
    console.error(`WP6 production-state evidence rejected:\n- ${failures.join("\n- ")}`);
    process.exit(1);
  }
  console.log(`WP6 production-state evidence structurally valid (${evidence.fixture === true ? "fixture" : "operator export"}).`);
}
