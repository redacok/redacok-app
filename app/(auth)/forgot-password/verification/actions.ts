"use server";

import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token";
import { db } from "@/lib/db";
import { ResetPasswordSchema } from "@/lib/definitions";
import { User } from "@prisma/client";
import bcrypt from "bcryptjs";

export const PasswordVerificationToken = async (token: string) => {
  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return { error: "Token inconnu !" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token expiré, veuillez réessayer" };
  }

  const existingUser = await getUserByEmail(existingToken.identifier);

  if (!existingUser) {
    return { error: "Compte Inexistante" };
  }

  return { success: "Votre compte est vérifié, vous pouvez vous connecter" };
};

export const ResetPasswordAction = async (
  formData: Zod.infer<typeof ResetPasswordSchema>
) => {
  const validationResult = ResetPasswordSchema.safeParse(formData);

  if (!validationResult.success) {
    return { error: "Les données ne sont pas valides !" };
  }

  const { token, password } = formData;

  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return { error: "Token inconnu !" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token expiré, veuillez réessayer" };
  }

  let existingUser: User | null;

  existingUser = await db.user.findUnique({
    where: {
      email: existingToken.identifier,
    },
  });

  if (!existingUser) {
    existingUser = await db.user.findUnique({
      where: {
        phone: existingToken.identifier,
      },
    });
  }

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Email ou mot de passe incorrect !" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const updateUser = await db.user.update({
    where: {
      id: existingUser.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  if (!updateUser) {
    return { error: "Une erreur inatendue est survenue" };
  }

  return { success: "Votre mot de passe a été modifié avec succès" };
};
