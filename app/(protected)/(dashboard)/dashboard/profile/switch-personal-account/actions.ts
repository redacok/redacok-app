"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  personnalVerificationSchema,
  uploadFileSchema,
} from "@/lib/definitions";
import { Kyc } from "@prisma/client";
import { redirect } from "next/navigation";
import * as z from "zod";

export async function personnalVerificationAction(
  formData: z.infer<typeof personnalVerificationSchema>
) {
  const session = await auth();
  if (!session || !session?.user) {
    return redirect("/sign-in?callback=/dashboard/profile");
  }

  const validationResult = personnalVerificationSchema.safeParse(formData);

  if (!validationResult.success) {
    return { error: "Les données ne sont pas valides !", data: {} };
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return redirect("/sign-in?callback=/dashboard/profile");
  }

  const { id, idType, idNumber, name, surname, idExpires } = formData;

  if (id) {
    await db.kyc.update({
      where: {
        id,
      },
      data: {
        name,
        surname,
        idExpires,
        idType,
        idNumber,
      },
    });
  } else {
    await db.kyc.create({
      data: {
        name,
        surname,
        idExpires,
        idType,
        idNumber,
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

export async function personnalVerificationFileAction(fileData: FormData) {
  const session = await auth();

  const formData = {
    imgUrl: fileData.get("imgUrl") as string,
    fileType: fileData.get("fileType") as string,
    kycId: fileData.get("kycId") as string,
    fileName: fileData.get("fileName") as string,
    field: fileData.get("field") as string,
  };

  if (!session || !session?.user) {
    return redirect("/sign-in?callback=/dashboard/profile");
  }

  const validationResult = uploadFileSchema.safeParse(formData);
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

  const media = await db.media.create({
    data: {
      name: formData.fileName,
      type: formData.fileType,
      url: formData.imgUrl,
    },
  });

  await db.kyc.update({
    where: {
      id: formData.kycId,
    },
    data: {
      [formData.field]: media.id,
    },
  });

  return {
    success: "Documents mis à jour avec succès !",
  };
}

export async function getKycAction(type: string = "personal") {
  const session = await auth();
  if (!session || !session?.user) {
    return redirect("/sign-in?callback=/dashboard/profile");
  }

  const kyc = await db.kyc.findUnique({
    where: {
      userId_type: {
        userId: session.user.id!,
        type,
      },
    },
  });

  return kyc;
}

export async function getKycOrganisationAction(kyc: Kyc) {
  const session = await auth();
  if (!session || !session?.user) {
    return redirect("/sign-in?callback=/dashboard/profile");
  }

  const organisation = await db.organisation.findUnique({
    where: {
      userId: session.user.id!,
      kycId: kyc.id,
    },
  });

  return organisation;
}
