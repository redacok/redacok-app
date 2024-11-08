"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { UpdateInfoSchema } from "@/lib/definitions";
import { Kyc } from "@prisma/client";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import * as z from "zod";

export async function updateInfoAction(
  formData: z.infer<typeof UpdateInfoSchema>
) {
  const session = await auth();

  if (!session || !session?.user) {
    return redirect("/sign-in?callback=/dashboard/profile");
  }

  const validationResult = UpdateInfoSchema.safeParse(formData);

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

export async function kycSubmited(kyc: Kyc) {
  const session = await auth();

  if (!session || !session?.user) {
    return redirect("/sign-in?callback=/dashboard/profile");
  }

  if (
    kyc.idExpires &&
    kyc.idNumber &&
    kyc.idOnHand &&
    kyc.idPicture &&
    kyc.idType &&
    kyc.locationPlan &&
    kyc.name &&
    kyc.niu &&
    kyc.surname
  ) {
    return true;
  } else {
    return false;
  }
}
