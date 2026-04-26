import { resend } from "./client";

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!params.to || !process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    return;
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: params.to,
    subject: params.subject,
    html: params.html
  });
}
