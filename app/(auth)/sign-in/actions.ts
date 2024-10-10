"use server";

import { SignInSchema } from "@/lib/definitions";
import * as z from "zod";

export async function signIn(formData: z.infer<typeof SignInSchema>) {
  const validationResult = SignInSchema.safeParse(formData);

  if (!validationResult.success) {
    return { error: "Les données ne sont pas valides !" };
  }

  return { success: "Un code de confirmation a été envoyé par mail" };
}
