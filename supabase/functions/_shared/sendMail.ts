import { Resend } from "https://esm.sh/resend@4.0.0";

export interface SendHtmlEmailInput {
  cc?: string[];
  from?: string;
  html: string;
  subject: string;
  to: string;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

export async function sendHtmlEmail(input: SendHtmlEmailInput) {
  const emailResponse = await resend.emails.send({
    cc: input.cc,
    from: input.from || "EVIONOR <hello@notifications.evionor.hu>",
    html: input.html,
    subject: input.subject,
    to: [input.to],
  });

  return emailResponse;
}
