import { Resend } from "resend";

let resend: Resend | null = null;

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }

  return resend;
}

export async function sendCommissionNotification(input: {
  name: string;
  email: string;
  message: string;
}) {
  const client = getResendClient();
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>";

  if (!client || !to) {
    return { skipped: true };
  }

  await client.emails.send({
    from,
    to,
    replyTo: input.email,
    subject: `Nuova commissione da ${input.name}`,
    text: `${input.name} <${input.email}>\n\n${input.message}`,
  });

  return { skipped: false };
}
