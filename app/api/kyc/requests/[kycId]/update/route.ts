import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { kycId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const { status, rejectionReason } = body;

    // Update KYC request status
    const updatedKyc = await db.kyc.update({
      where: {
        id: params.kycId,
      },
      data: {
        status,
        ...(rejectionReason && { rejectionReason }),
      },
    });

    return NextResponse.json(updatedKyc);
  } catch (error) {
    console.error("[KYC_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
