"use server";

import { generateVerificationToken } from "@/data/tokens";
import { db } from "@/lib/db";
import { SignUpSchema } from "@/lib/definitions";
import { sendVerificationEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";
import * as z from "zod";

export async function signUpAction(formData: z.infer<typeof SignUpSchema>) {
  const validationResult = SignUpSchema.safeParse(formData);

  if (!validationResult.success) {
    return { error: "Les données ne sont pas valides !" };
  }

  const { email, password, name, phone, country, countryCode } = formData;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await db.user.findUnique({
    where: {
      email,
    },
  });
  if (existingUser) {
    return { error: "Cette adresse mail est déjà utilisée !" };
  }

  const existingUserPhone = await db.user.findUnique({
    where: {
      phone,
    },
  });
  if (existingUserPhone) {
    return { error: "Ce numéro de téléphone est déjà utilisé !" };
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

  await db.user.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword,
      country: {
        connect: {
          id: existCountry.id,
        },
      },
    },
  });

  const verificationToken = await generateVerificationToken(email);
  await sendVerificationEmail(
    verificationToken.identifier,
    verificationToken.token
  );
  // TODO: send verification token via sms

  return {
    success:
      "Compte crée ! Un mail de vérification vous a été envoyé, veuillez consulter votre adresse email",
  };
}
