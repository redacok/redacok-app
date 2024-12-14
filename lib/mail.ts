import ForgotPasswordVerificationEmail from "@/components/mail/forgot-password-verification-email";
import NewUserEmail from "@/components/mail/new-user-email";
import VerificationEmail from "@/components/mail/verification-email";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const baseUrl = process.env.NEXT_APP_URL;

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${baseUrl}/auth/new-verification?token=${token}`;

  await resend.emails.send({
    from: "Bienvenu sur Redacok <welcome@redacok.laclass.dev>",
    to: email,
    subject: "Confirmez votre adresse email",
    react: VerificationEmail({ verificationLink: confirmLink }),
  });
};

export const sendForgotPasswordVerificationEmail = async (
  email: string,
  token: string
) => {
  const confirmLink = `${baseUrl}/forgot-password/verification?token=${token}`;

  await resend.emails.send({
    from: "Mot de passe oublié <forgot-password@redacok.laclass.dev>",
    to: email,
    subject: "Réinitialisez votre mot de passe",
    react: ForgotPasswordVerificationEmail({ verificationLink: confirmLink }),
  });
};

export const sendNewUserEmail = async (
  name: string,
  email: string,
  pin: string
) => {
  await resend.emails.send({
    from: "Vos accès Redacok <welcome@redacok.laclass.dev>",
    to: email,
    subject: `Bienvenu ${name} sur Redacok`,
    react: NewUserEmail({ email, pin }),
  });
};
