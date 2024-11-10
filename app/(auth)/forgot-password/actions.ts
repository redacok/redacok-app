"use server";

import { generateVerificationToken } from "@/data/tokens";
import { getUserByEmail, getUserByPhone } from "@/data/user";
import { getVerificationTokenByIdentifier } from "@/data/verification-token";
import { ForgotPasswordSchema } from "@/lib/definitions";
import { sendForgotPasswordVerificationEmail } from "@/lib/mail";
import { User } from "@prisma/client";
import { z } from "zod";

export async function ForgotPasswordAction(
  formData: z.infer<typeof ForgotPasswordSchema>
) {
  const validationResult = ForgotPasswordSchema.safeParse(formData);

  if (!validationResult.success) {
    return { error: "Les données ne sont pas valides !" };
  }

  let existingUser: User | null;
  let identifier: string;

  const { email, phone } = formData;
  if (email && email.length > 1) {
    existingUser = await getUserByEmail(email);
    identifier = email;
  } else if (phone && phone.length > 1) {
    existingUser = await getUserByPhone(phone);
    identifier = phone;
  } else {
    return { error: "" };
  }

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Utilisateur inexistant !" };
  }

  const currentVerificationToken = await getVerificationTokenByIdentifier(
    identifier
  );
  const currentDate = new Date();
  if (
    currentVerificationToken === null ||
    currentDate.getTime() - currentVerificationToken.expires.getTime() > 3600000
  ) {
    const verificationToken = await generateVerificationToken(
      existingUser.email!
    );

    if (email && email.length > 1) {
      sendForgotPasswordVerificationEmail(
        verificationToken.identifier,
        verificationToken.token
      );
    }
  }

  return {
    success: "Un lien de vérification vous a été envoyé à l'adresse mentionnée",
  };
}
