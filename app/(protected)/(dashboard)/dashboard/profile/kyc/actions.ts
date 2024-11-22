"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { KycType } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Types pour les formulaires
interface PersonalInfoFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  idType: string;
  idNumber: string;
  idExpirationDate: string;
  type: KycType;
}

interface DocumentsFormData {
  niu: string;
  idPicture: string;
  idOnHand: string;
  entirePhoto: string;
  locationPlan: string;
}

interface BusinessDocumentsFormData {
  founderDocument: string;
  organisationDocument: string;
}

// Action pour soumettre les informations personnelles
export async function submitPersonalInfo(formData: PersonalInfoFormData) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.id) {
      return { error: "Non autorisé" };
    }

    // Vérifier si l'utilisateur a déjà une demande KYC en cours
    const existingKyc = await db.kyc.findFirst({
      where: {
        userId: session.user.id,
        status: "PENDING",
      },
    });

    if (existingKyc) {
      return { error: "Une demande de vérification KYC est déjà en cours" };
    }

    // Créer la nouvelle demande KYC
    const kyc = await db.kyc.create({
      data: {
        type: formData.type,
        userId: session.user.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: new Date(formData.dateOfBirth),
        nationality: formData.nationality,
        idType: formData.idType,
        idNumber: formData.idNumber,
        idExpirationDate: new Date(formData.idExpirationDate),
      },
    });

    revalidatePath("/dashboard/profile");
    return { success: true, kycId: kyc.id };
  } catch (error) {
    console.error("[SUBMIT_PERSONAL_INFO]", error);
    return {
      error: "Une erreur est survenue lors de la soumission des informations",
    };
  }
}

// Action pour soumettre les documents
export async function submitDocuments(
  kycId: string,
  formData: DocumentsFormData
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Non autorisé" };
    }

    // Vérifier que le KYC appartient à l'utilisateur
    const kyc = await db.kyc.findFirst({
      where: {
        id: kycId,
        userId: session.user.id!,
      },
    });

    if (!kyc) {
      return { error: "KYC non trouvé" };
    }

    // Mettre à jour le KYC avec les documents
    await db.kyc.update({
      where: {
        id: kycId,
      },
      data: {
        niu: formData.niu,
        idPicture: formData.idPicture,
        idOnHand: formData.idOnHand,
        entirePhoto: formData.entirePhoto,
        locationPlan: formData.locationPlan,
      },
    });

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    console.error("[SUBMIT_DOCUMENTS]", error);
    return {
      error: "Une erreur est survenue lors de la soumission des documents",
    };
  }
}

// Action pour soumettre les documents d'entreprise
export async function submitBusinessDocuments(
  kycId: string,
  formData: BusinessDocumentsFormData
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Non autorisé" };
    }

    // Vérifier que le KYC appartient à l'utilisateur
    const kyc = await db.kyc.findFirst({
      where: {
        id: kycId,
        userId: session.user.id!,
      },
    });

    if (!kyc) {
      return { error: "KYC non trouvé" };
    }

    // Mettre à jour le KYC avec les documents
    await db.organisation.update({
      where: {
        id: kycId,
      },
      data: {
        founderDocument: formData.founderDocument,
        organisationDocument: formData.organisationDocument,
      },
    });

    revalidatePath("/dashboard/profile/kyc");
    return { success: true };
  } catch (error) {
    console.error("[SUBMIT_DOCUMENTS]", error);
    return {
      error: "Une erreur est survenue lors de la soumission des documents",
    };
  }
}

// Action pour soumettre les informations d'entreprise (pour le type BUSINESS)
export async function submitBusinessInfo(
  kycId: string,
  formData: { orgName: string }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Non autorisé" };
    }

    // Vérifier que le KYC appartient à l'utilisateur et est de type BUSINESS
    const kyc = await db.kyc.findFirst({
      where: {
        id: kycId,
        userId: session.user.id,
      },
    });

    if (!kyc) {
      return { error: "KYC non trouvé ou non valide pour une entreprise" };
    }

    // Créer l'organisation
    await db.organisation.create({
      data: {
        name: formData.orgName,
        type: "BUSINESS", // Add the type property
        user: {
          connect: {
            id: session.user.id, // Connect the user who is creating the organisation
          },
        },
        kyc: {
          connect: {
            id: kycId,
          },
        },
      },
    });

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    console.error("[SUBMIT_BUSINESS_INFO]", error);
    return {
      error:
        "Une erreur est survenue lors de la soumission des informations d'entreprise",
    };
  }
}

export async function getKycAction(type: KycType = "PERSONAL") {
  const session = await auth();
  if (!session || !session?.user) {
    return { error: "Non autorisé" };
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
