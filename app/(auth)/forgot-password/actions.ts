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
    return { error: "Veuillez renseigner un email ou un numéro de téléphone !" };
  }

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Utilisateur inexistant !" };
  }

  const TOKEN_EXPIRATION_MS = 3600000; 
  
  try {
    const currentVerificationToken = await getVerificationTokenByIdentifier(identifier);
    const currentDate = new Date();
    
    const isTokenExpired = currentVerificationToken
      ? currentDate.getTime() - currentVerificationToken.expires.getTime() > TOKEN_EXPIRATION_MS
      : true;
  
    if (!currentVerificationToken || isTokenExpired) {
      const verificationToken = await generateVerificationToken(existingUser.email);
  
      if (!verificationToken) {
        return { error: "Erreur lors de la génération du token de vérification" };
      }
  
      if (email) {
        try {
          await sendForgotPasswordVerificationEmail(
            verificationToken.identifier,
            verificationToken.token
          );
          return {
            success: "Un lien de vérification vous a été envoyé à l'adresse mentionnée",
          };
        } catch (error) {
          console.error("Verification email sending failed:", error);
          return { error: "Erreur lors de l'envoi de l'email de vérification" };
        }
      } else {
        // Handle phone verification if implemented
        return { error: "La vérification par téléphone n'est pas encore implémentée" };
      }
    } else {
      return {
        error: "Un lien de vérification a déjà été envoyé. Veuillez consulter votre messagerie",
      };
    }
  } catch (error) {
    console.error("Verification email sending failed:", error);
    return { error: "Une erreur est survenue lors de la réinitialisation du mot de passe" };
  }
}
