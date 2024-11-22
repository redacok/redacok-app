import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
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

    // Mettre à jour le KYC
    const kycs = await db.kyc.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(kycs);
  } catch (error) {
    console.error("[KYC_REVIEW]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
