import VerificationEmail from "@/components/mail/verification-email";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const baseUrl = process.env.NEXT_APP_URL;

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${baseUrl}/auth/new-verification?token=${token}`;

  await resend.emails.send({
    from: "redacok@resend.dev",
    to: email,
    subject: "Confirmez votre adresse email",
    react: VerificationEmail({ verificationLink: confirmLink }),
  });
};
