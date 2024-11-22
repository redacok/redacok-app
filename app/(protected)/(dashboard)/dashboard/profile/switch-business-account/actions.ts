"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  businessVerificationSchema,
  uploadBusinessFileSchema,
} from "@/lib/definitions";
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

  const { kycId, orgId, name, surname, orgName, type } = formData;

  if (kycId && orgId) {
    await db.kyc.update({
      where: {
        id: kycId,
      },
      data: {
        firstName: name,
        lastName: surname,
      },
    });

    await db.organisation.update({
      where: {
        id: orgId,
      },
      data: {
        name: orgName,
      },
    });
  } else {
    const newKyc = await db.kyc.create({
      data: {
        firstName: name,
        lastName: surname,
        type: "BUSINESS",
        dateOfBirth: new Date(),
        nationality: "FR",
        user: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });

    await db.organisation.create({
      data: {
        name: orgName,
        type,
        user: {
          connect: {
            id: session.user.id,
          },
        },
        kyc: {
          connect: {
            id: newKyc.id,
          },
        },
      },
    });
  }

  return { success: "Informations mises à jour" };
}

export async function businessVerificationFileAction(fileData: FormData) {
  const session = await auth();

  const formData = {
    fileUrl: fileData.get("fileUrl") as string,
    fileType: fileData.get("fileType") as string,
    kycId: fileData.get("kycId") as string,
    organisationId: fileData.get("organisationId") as string,
    fileName: fileData.get("fileName") as string,
    field: fileData.get("field") as string,
  };

  if (!session || !session?.user) {
    return redirect(
      "/sign-in?callback=/dashboard/profile/switch-business-account"
    );
  }

  const validationResult = uploadBusinessFileSchema.safeParse(formData);
  if (!validationResult.success) {
    return { error: "Les données ne sont pas valides !" };
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return redirect(
      "/sign-in?callback=/dashboard/profile/switch-business-account"
    );
  }

  const media = await db.media.create({
    data: {
      name: formData.fileName,
      type: formData.fileType,
      url: formData.fileUrl,
    },
  });

  await db.organisation.update({
    where: {
      id: formData.organisationId,
    },
    data: {
      [formData.field]: media.id,
    },
  });

  return {
    success: "Documents mis à jour avec succès !",
  };
}
