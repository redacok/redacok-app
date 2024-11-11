"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { businessVerificationSchema } from "@/lib/definitions";
import { redirect } from "next/navigation";
import * as z from "zod";

export async function BusinessVerificationAction(
  formData: z.infer<typeof businessVerificationSchema>
) {
  const session = await auth();
  if (!session || !session?.user) {
    return redirect("/sign-in?callback=/dashboard/profile");
  }

  const validationResult = businessVerificationSchema.safeParse(formData);

  if (!validationResult.success) {
    return { error: "Les données ne sont pas valides !" };
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return redirect("/sign-in?callback=/dashboard/profile");
  }

  const { id, name, surname } = formData;

  if (id) {
    await db.kyc.update({
      where: {
        id,
      },
      data: {
        name,
        surname,
      },
    });
  } else {
    await db.kyc.create({
      data: {
        name,
        surname,
        user: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });
  }

  return { success: "Informations mises à jour" };
}
