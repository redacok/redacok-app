"use server";

import { signIn } from "@/auth";
import { SignInSchema } from "@/lib/definitions";
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

  try {
    await signIn("credentials", { email, password, redirectTo: redirect });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Vos informations ne sont pas correctes" };
        default:
          return { error: "une erreur inatendue s'et produite" };
      }
    }

    throw error;
  }

  return { success: "Un code de confirmation a été envoyé par mail" };
}
