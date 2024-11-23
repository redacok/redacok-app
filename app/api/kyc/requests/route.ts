import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    // Vérifier si l'utilisateur est un administrateur
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Non autorisé", { status: 403 });
    }

    // Récupérer toutes les demandes de KYC en attente
    const kycRequests = await db.kyc.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    // Transform the response to include documents
    const transformedRequests = kycRequests.map(request => {
      const documents = [
        { id: request.niu, type: 'NIU', url: request.niu },
        { id: request.idPicture, type: 'ID Picture', url: request.idPicture },
        { id: request.idOnHand, type: 'ID On Hand', url: request.idOnHand },
        { id: request.entirePhoto, type: 'Entire Photo', url: request.entirePhoto },
        { id: request.locationPlan, type: 'Location Plan', url: request.locationPlan },
      ].filter(doc => doc.url);

      return {
        ...request,
        documents,
      };
    });

    return NextResponse.json(transformedRequests);
  } catch (error) {
    console.error("[KYC_REQUESTS]", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    // Vérifier si l'utilisateur est un administrateur
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Non autorisé", { status: 403 });
    }

    const body = await req.json();
    const { kycId, status, rejectionReason } = body;

    if (!kycId || !status || (status === "REJECTED" && !rejectionReason)) {
      return new NextResponse("Données manquantes", { status: 400 });
    }

    // Mettre à jour le statut de la demande KYC
    const updatedKyc = await db.kyc.update({
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

    // Si la demande est approuvée, mettre à jour le rôle de l'utilisateur
    if (status === "APPROVED") {
      await db.user.update({
        where: { id: updatedKyc.userId },
        data: {
          role: updatedKyc.type,
        },
      });
    }

    return NextResponse.json(updatedKyc);
  } catch (error) {
    console.error("[KYC_UPDATE]", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
}
