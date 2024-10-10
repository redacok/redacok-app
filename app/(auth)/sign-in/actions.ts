"use server";

import { SignInSchema } from "@/_lib/definitions";

export async function signIn(formData: FormData) {
  const validationResult = SignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
    };
  }
}
