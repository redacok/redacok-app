import ForgotPasswordVerificationEmail from "@/components/mail/forgot-password-verification-email";
import KycTreatment from "@/components/mail/kyc-treatment";
import NewUserEmail from "@/components/mail/new-user-email";
import TransactionMail from "@/components/mail/transaction-mail";
import VerificationEmail from "@/components/mail/verification-email";
import { Kyc, Transaction } from "@prisma/client";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const baseUrl = process.env.NEXT_APP_URL;

//Mail de vérification a la création du compte
export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${baseUrl}/auth/new-verification?token=${token}`;

  await resend.emails.send({
    from: "Bienvenu sur Redacok <welcome@redacok.laclass.dev>",
    to: email,
    subject: "Confirmez votre adresse email",
    react: VerificationEmail({ verificationLink: confirmLink }),
  });
};

// Mail de réinitialisation du mot de passe
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

// Mail de notification de création de comlpte par un admin
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

//Mail de notification du traitement des vérifications KYC
export const sendKycTreatmentMail = async (kyc: Kyc, email: string) => {
  await resend.emails.send({
    from: "Redacok <kyc-no-reply@redacok.laclass.dev>",
    to: email,
    subject: `Votre vérification intermédiaire`,
    react: KycTreatment({ kyc }),
  });
};

//Mail de notification de transaction
export const sentTransactionMail = async (
  transaction: Transaction,
  email: string
) => {
  await resend.emails.send({
    from: "Redacok <new-transaction@redacok.laclass.dev>",
    to: email,
    subject: `Votre vérification intermédiaire`,
    react: TransactionMail({ transaction }),
  });
};
