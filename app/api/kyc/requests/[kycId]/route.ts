import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
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

    // Get KYC request details
    const kycRequest = await db.kyc.findUnique({
      where: {
        id: params.kycId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!kycRequest) {
      return new NextResponse("KYC request not found", { status: 404 });
    }

    // Transform the response to include documents
    const documents = [
      { id: kycRequest.niu, type: 'NIU', url: kycRequest.niu },
      { id: kycRequest.idPicture, type: 'ID Picture', url: kycRequest.idPicture },
      { id: kycRequest.idOnHand, type: 'ID On Hand', url: kycRequest.idOnHand },
      { id: kycRequest.entirePhoto, type: 'Entire Photo', url: kycRequest.entirePhoto },
      { id: kycRequest.locationPlan, type: 'Location Plan', url: kycRequest.locationPlan },
    ].filter(doc => doc.url); // Only include documents that exist

    return NextResponse.json({
      ...kycRequest,
      documents,
    });
  } catch (error) {
    console.error("[KYC_REQUEST_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
