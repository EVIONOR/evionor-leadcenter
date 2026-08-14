import { createHash } from "node:crypto";

export const ALLOWED_TARGETS = new Map([
  ["wizard-suffix", "https://charger-offer-wizard.lovable.app/"],
  ["lead-center", "https://evionor-leadcenter.lovable.app/"],
]);

const assetPattern = /(?:src|href)=["']([^"']+\.(?:js|css))(?:\?[^"']*)?["']/gi;

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

export async function probePublicAssets(target, fetchImpl = fetch) {
  const expectedUrl = ALLOWED_TARGETS.get(target);
  if (!expectedUrl) throw new Error("target_not_allowlisted");
  const page = await fetchImpl(expectedUrl, { redirect: "error", headers: { accept: "text/html" } });
  if (!page.ok) throw new Error(`html_status:${page.status}`);
  if (new URL(page.url || expectedUrl).origin !== new URL(expectedUrl).origin) {
    throw new Error("html_origin_mismatch");
  }
  const html = await page.text();
  const paths = [...html.matchAll(assetPattern)].map((match) => match[1]);
  const uniquePaths = [...new Set(paths)].filter((path) => !path.startsWith("/~"));
  if (!uniquePaths.some((path) => path.endsWith(".js"))) throw new Error("javascript_asset_missing");

  const assets = [];
  for (const path of uniquePaths) {
    const url = new URL(path, expectedUrl);
    if (url.origin !== new URL(expectedUrl).origin) throw new Error("cross_origin_asset_forbidden");
    const response = await fetchImpl(url, { redirect: "error" });
    if (!response.ok) throw new Error(`asset_status:${response.status}:${url.pathname}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    assets.push({ path: url.pathname, bytes: bytes.byteLength, sha256: sha256(bytes) });
  }
  return {
    schema_version: 1,
    target,
    production_url: expectedUrl,
    captured_at: new Date().toISOString(),
    secret_values_included: false,
    assets,
  };
}

if (import.meta.url === new URL(`file:///${process.argv[1]?.replace(/\\/g, "/")}`).href) {
  const evidence = await probePublicAssets(process.argv[2]);
  process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);
}
