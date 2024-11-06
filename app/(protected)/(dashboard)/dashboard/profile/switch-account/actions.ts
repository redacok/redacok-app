"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { switchToPersonalAccountSchema } from "@/lib/definitions";
import { redirect } from "next/navigation";

const baseUrl = process.env.NEXT_APP_URL;

export async function SwitchToPersonalAccountAction(simpleData: FormData) {
  const session = await auth();

  const formData = {
    idType: simpleData.get("idType") as string,
    idNumber: simpleData.get("idNumber") as string,
    name: simpleData.get("name") as string,
    surname: simpleData.get("surname") as string,
    idExpires: simpleData.get("idExpires") as string,
    NIU: simpleData.get("NIU") as File,
    idPicture: simpleData.get("idPicture") as File,
    idOnHand: simpleData.get("idOnHand") as File,
    locationPlan: simpleData.get("locationPlan") as File,
  };

  if (!session || !session?.user) {
    return redirect("/sign-in?callback=/dashboard/profile");
  }

  const validationResult = switchToPersonalAccountSchema.safeParse(formData);

  if (!validationResult.success) {
    return { error: "Les données ne sont pas valides !" };
  }

  const {
    idType,
    idNumber,
    name,
    surname,
    idExpires,
    NIU,
    idPicture,
    idOnHand,
    locationPlan,
  } = formData;

  const files = [NIU, idPicture, idOnHand, locationPlan];

  const uploadedFiles = await Promise.all(
    files.map(async (file) => {
      const response = await fetch(`${baseUrl}/api/upload`, {
        method: "POST",
        body: file,
      });
      const result = await response.json();
      const media = await db.media.create({
        data: {
          name: file.name,
          type: result.Format,
          url: result.secure_url,
        },
      });
      return { file: media.url };
    })
  );

  console.log("LES FICHIERS: ", uploadedFiles);

  // Enregistrement des informations en base de données
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

  return {
    success:
      "Votre identification KYC a été soumise et sera traitée dans un délais de 24h ",
  };
}
