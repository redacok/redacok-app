"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const UpdateReferralCodeSchema = z.object({
  referralCode: z.string().min(3).max(50),
});

export async function updateReferralCode(formData: z.infer<typeof UpdateReferralCodeSchema>) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Non autorisé" };
    }

    const validationResult = UpdateReferralCodeSchema.safeParse(formData);
    if (!validationResult.success) {
      return { error: "Code de parrainage invalide" };
    }

    // Check if the referral code is already used
    const existingUser = await db.user.findFirst({
      where: {
        referralCode: formData.referralCode,
        NOT: {
          id: session.user.id,
        },
      },
    });

    if (existingUser) {
      return { error: "Ce code de parrainage est déjà utilisé" };
    }

    // Check if the user has any referrals
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        referrals: true,
      },
    });

    if (!user) {
      return { error: "Utilisateur non trouvé" };
    }

    if (user.referrals.length > 0) {
      return { error: "Vous ne pouvez pas modifier votre code de parrainage car il a déjà été utilisé" };
    }

    // Update the referral code
    await db.user.update({
      where: { id: session.user.id },
      data: { referralCode: formData.referralCode },
    });

    return { success: "Code de parrainage mis à jour avec succès" };
  } catch (error) {
    console.error(error);
    return { error: "Une erreur est survenue" };
  }
}
