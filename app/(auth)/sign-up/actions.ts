"use server";

import { db } from "@/lib/db";
import { SignUpSchema } from "@/lib/definitions";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import bcrypt from "bcryptjs";
import * as z from "zod";

export async function signUpAction(
  formData: z.infer<typeof SignUpSchema>,
  redirect: string = DEFAULT_LOGIN_REDIRECT
) {
  const validationResult = SignUpSchema.safeParse(formData);
  console.log(redirect);
  if (!validationResult.success) {
    return { error: "Les données ne sont pas valides !" };
  }

  const { email, password, name } = formData;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await db.user.findUnique({
    where: {
      email,
    },
  });
  if (existingUser) {
    return { error: "Cette addresse mail est déjà utilisée !" };
  }
  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  //TODO : Send verification token email

  return { success: "Votre compte a été crée !" };
}
