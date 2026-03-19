import { corsHeaders } from "../_shared/cors.ts";
import { requireEvionorAdmin } from "../_shared/evionorAdmin.ts";
import { buildResidentialOfferWithQuotes } from "../_shared/residentialOfferServer.ts";
import type { ResidentialOfferInput } from "../../../src/shared/residentialOffer.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    await requireEvionorAdmin(body.access_token);

    const input = body.offerInput as ResidentialOfferInput | undefined;
    if (!input) {
      throw new Error("offerInput is required");
    }

    const renderedOffer = await buildResidentialOfferWithQuotes(input);

    return new Response(JSON.stringify({ success: true, ...renderedOffer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ success: false, error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
