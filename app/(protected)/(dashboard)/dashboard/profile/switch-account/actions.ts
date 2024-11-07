"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { switchToPersonalAccountSchema } from "@/lib/definitions";
import axios from "axios";
import { redirect } from "next/navigation";

const baseUrl = process.env.NEXT_APP_URL;

// interface UploadResult {
//   file: string;
// }

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

  // Vérification de la session utilisateur
  if (!session || !session.user) {
    return redirect("/sign-in?callback=/dashboard/profile");
  }

  // Validation des données via Zod
  const validationResult = switchToPersonalAccountSchema.safeParse(formData);
  if (!validationResult.success) {
    return { error: "Les données ne sont pas valides !" };
  }

  // Extraction des champs
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

  // Upload des fichiers et création des entrées en base de données
  try {
    await Promise.all(
      files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        await axios
          .post(`${baseUrl}/api/upload`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then(async (response) => {
            const data = response.data;
            await db.media.create({
              data: {
                name: file.name,
                type: data.format,
                url: data.imgUrl,
              },
            });
          })
          .catch((err) => {
            console.log("errue cloudinary", err);
          });
      })
    );

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
        "Votre identification KYC a été soumise et sera traitée dans un délai de 24h.",
    };
  } catch (error) {
    console.error(
      "Erreur lors de l'upload ou de la création en base de données :"
      // error
    );
    return {
      error: "Erreur lors de la soumission des données. Veuillez réessayer.",
    };
  }
}
