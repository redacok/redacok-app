"use server";

import { db } from "@/lib/db";
import { SignUpSchema } from "@/lib/definitions";
import bcrypt from "bcrypt";
import * as z from "zod";

export async function signUp(formData: z.infer<typeof SignUpSchema>) {
  const validationResult = SignUpSchema.safeParse(formData);

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
