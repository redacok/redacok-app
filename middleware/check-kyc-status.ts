"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function checkKycStatus() {
  const session = await auth();
  if (!session?.user) {
    return {
      allowed: false,
      message: "Unauthorized",
    };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return {
      allowed: false,
      message: "User not found",
    };
  }

  // Vérifier si un Kyc est en cours de traitement
  const kyc = await db.kyc.findFirst({
    where: {
      userId: session.user.id,
      status: "PENDING",
    },
  });
  if (kyc) {
    return {
      allowed: false,
      message: "Veuillez patienter que votre identification soit validé",
    };
  }

  // Vérifier si l'utilisateur a le rôle approprié
  if (user.role === "USER") {
    return {
      allowed: false,
      message:
        "Veuillez soumettre votre vérification intermédiaire pour effectuer cette action",
    };
  }

  // Si l'utilisateur a déjà un rôle PERSONAL ou BUSINESS, il est autorisé
  if (
    user.role === "PERSONAL" ||
    user.role === "BUSINESS" ||
    user.role === "COMMERCIAL"
  ) {
    return {
      allowed: true,
      message: null,
    };
  }

  return {
    allowed: false,
    message: "Statut utilisateur non valide pour les transactions",
  };
}

export async function displayKycForm() {
  const session = await auth();
  if (!session?.user) {
    return {
      display: false,
      message: "Unauthorized",
      status: "REJECTED",
    };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return {
      display: false,
      message: "User not found",
      status: "REJECTED",
    };
  }

  const kyc = await db.kyc.findFirst({
    where: {
      userId: user.id,
    },
  });

  if (kyc) {
    if (kyc.status === "PENDING") {
      if (
        kyc.niu === null ||
        kyc.idPicture === null ||
        kyc.idOnHand === null ||
        kyc.entirePhoto === null ||
        kyc.locationPlan === null
      ) {
        return {
          display: true,
          status: kyc.status,
          message: "",
        };
      } else {
        return {
          display: false,
          status: "REVIEWING",
          message:
            "Votre vérification a été soumise et est en cours de traitement",
        };
      }
    } else if (kyc.status === "REJECTED") {
      return {
        display: true,
        status: kyc.status,
        message: "Votre demande de vérification a été rejetée",
      };
    } else {
      return {
        display: true,
        status: kyc.status,
        message: "Votre vérification a été approuvée !",
      };
    }
  }
}
