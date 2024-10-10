"use server";

import { SignUpSchema } from "@/_lib/definitions";
import * as z from "zod";

export async function signUp(formData: z.infer<typeof SignUpSchema>) {
  const validationResult = SignUpSchema.safeParse(formData);

  if (!validationResult.success) {
    return { error: "Les données ne sont pas valides !" };
  }

  return { success: "Un code de confirmation a été envoyé par mail" };
}
