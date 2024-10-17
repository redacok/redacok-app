"use server";

import { signIn } from "@/auth";
import { generateVerificationToken } from "@/data/tokens";
import { getUserByEmail } from "@/data/user";
import { SignInSchema } from "@/lib/definitions";
import { sendVerificationEmail } from "@/lib/mail";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import * as z from "zod";

export async function signInAction(
  formData: z.infer<typeof SignInSchema>,
  redirect: string = DEFAULT_LOGIN_REDIRECT
) {
  const validationResult = SignInSchema.safeParse(formData);

  if (!validationResult.success) {
    return { error: "Les données ne sont pas valides !" };
  }

  const { email, password } = formData;

  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Cette adresse email n'existe pas !" };
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email!
    );

    sendVerificationEmail(
      verificationToken.identifier,
      verificationToken.token
    );

    return {
      success:
        "Vous devez vérifier votre compte, un mail de vérification vous a été envoyé !",
    };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: redirect });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Vos informations ne sont pas correctes" };
        default:
          return { error: "une erreur inatendue s'est produite !" };
      }
    }

    throw error;
  }

  return { success: "Un code de confirmation a été envoyé par mail" };
}

export async function signInSocial(provider: "google" | "github") {
  try {
    await signIn(provider, { redirectTo: DEFAULT_LOGIN_REDIRECT });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Une erreur inatendue s'est produite" };
    }
    throw error;
  }
}
