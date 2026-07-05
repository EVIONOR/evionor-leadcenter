import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { sendHtmlEmail } from "../_shared/sendMail.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { requireEvionorAdmin } from "../_shared/evionorAdmin.ts";

interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
  access_token?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received email send request");

    const { to, subject, html, from, access_token }: SendEmailRequest = await req.json();

    try {
      await requireEvionorAdmin(access_token);
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : "Authentication required";
      return new Response(
        JSON.stringify({ success: false, error: message }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const cc = ["info@evionor.hu"];

    if (!to || !subject || !html) {
      console.error("Missing required fields:", { to, subject, htmlLength: html?.length });
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: to, subject, html",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    console.log("Sending email to:", to, from, cc);

    const emailResponse = await sendHtmlEmail({
      cc,
      from,
      html,
      subject,
      to,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        data: emailResponse,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown send-email failure";
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }
};

serve(handler);
