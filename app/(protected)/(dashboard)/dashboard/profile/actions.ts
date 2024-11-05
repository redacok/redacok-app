"use server";

import { db } from "@/lib/db";
import { UpdateInfoSchema } from "@/lib/definitions";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import bcrypt from "bcryptjs";
import * as z from "zod";

export async function updateInfoAction(
  formData: z.infer<typeof UpdateInfoSchema>,
  redirect: string = DEFAULT_LOGIN_REDIRECT
) {
  const validationResult = UpdateInfoSchema.safeParse(formData);
  console.log(redirect);
  if (!validationResult.success) {
    return { error: "Les données ne sont pas valides !" };
  }

  const { id, email, password, name, phone, country, countryCode } = formData;
  if (password.length !== 0 && password.length < 4) {
    return { error: "Le code PIN doit avoir au moins 4 chiffres" };
  }

  const hashedPassword = await bcrypt.hash(password.toString(), 10);

  const existingUser = await db.user.findUnique({
    where: {
      id,
    },
  });
  if (!existingUser) {
    return {
      error: "Le code PIN actuel n'est pas valide",
    };
  }

  let existCountry = await db.country.findUnique({
    where: {
      name_code: {
        name: country,
        code: countryCode,
      },
    },
  });

  if (!existCountry) {
    existCountry = await db.country.create({
      data: {
        name: country,
        code: countryCode,
      },
    });
  }

  await db.user.update({
    where: {
      id,
    },
    data: {
      name,
      email,
      phone,
      password: password ? hashedPassword : existingUser.password,
      country: {
        connect: {
          id: existCountry.id,
        },
      },
    },
  });

  return {
    success: "Informations modifiées avec succès !",
  };
}
