import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

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

  // Vérifier si l'utilisateur a le rôle approprié
  if (user.role !== "USER") {
    return {
      allowed: false,
      message: "Veuillez soumettre votre KYC pour effectuer des transactions",
    };
  }

  // Si l'utilisateur a déjà un rôle PERSONAL ou BUSINESS, il est autorisé
  if (user.role === "PERSONAL" || user.role === "BUSINESS") {
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
