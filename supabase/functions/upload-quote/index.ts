import { corsHeaders } from "../_shared/cors.ts";
import { requireEvionorAdmin } from "../_shared/evionorAdmin.ts";
import { createLocalServiceClient } from "../_shared/supabaseClients.ts";

const MAX_PDF_BYTES = 5 * 1024 * 1024; // 5 MB
const SAFE_FILENAME = /^[a-zA-Z0-9._-]+\.pdf$/;

function base64ToUint8Array(b64: string): Uint8Array {
  const binaryString = atob(b64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    await requireEvionorAdmin(body.access_token);

    const { fileName, pdfBase64 } = body;

    if (typeof fileName !== "string" || !SAFE_FILENAME.test(fileName)) {
      throw new Error("Invalid fileName");
    }
    if (typeof pdfBase64 !== "string" || pdfBase64.length === 0) {
      throw new Error("pdfBase64 is required");
    }

    const pdfBytes = base64ToUint8Array(pdfBase64);
    if (pdfBytes.byteLength > MAX_PDF_BYTES) {
      throw new Error("PDF exceeds maximum allowed size");
    }

    const storageClient = createLocalServiceClient();
    const { error: uploadError } = await storageClient.storage
      .from("quotes")
      .upload(fileName, pdfBytes, { contentType: "application/pdf", upsert: true });

    if (uploadError) {
      throw new Error(`Failed to upload quote PDF: ${uploadError.message}`);
    }

    const { data } = storageClient.storage.from("quotes").getPublicUrl(fileName);

    return new Response(
      JSON.stringify({ success: true, publicUrl: data.publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    );
  }
});
