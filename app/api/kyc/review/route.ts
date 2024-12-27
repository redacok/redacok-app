import { auth } from "@/auth";
import { db } from "@/lib/db";
import { sendKycTreatmentMail } from "@/lib/mail";
import { KycStatus, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Vérifier que l'utilisateur est un administrateur
    const admin = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (admin?.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const data = await req.json();
    const { kycId, status, rejectionReason } = data;

    // Vérifier que le statut est valide
    if (!Object.values(KycStatus).includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    // Mettre à jour le KYC
    const kyc = await db.kyc.update({
      where: { id: kycId },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason : null,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
      },
      include: {
        user: true,
      },
    });

    // Si le KYC est approuvé, mettre à jour le rôle de l'utilisateur
    if (status === "APPROVED") {
      await db.user.update({
        where: { id: kyc.userId },
        data: {
          role: kyc.type === "BUSINESS" ? UserRole.BUSINESS : UserRole.PERSONAL,
        },
      });
    }

    //Envoi du mail de notification a l'utilisateur
    await sendKycTreatmentMail(kyc, kyc.user.email!);

    return NextResponse.json(kyc);
  } catch (error) {
    console.error("[KYC_REVIEW]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
