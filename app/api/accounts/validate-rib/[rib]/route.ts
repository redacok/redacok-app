import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { rib: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const rib = params.rib;

    // Trouver le compte avec ce RIB
    const account = await db.bankAccount.findUnique({
      where: { rib },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!account) {
      return NextResponse.json(
        { success: false, message: "Compte non trouvé" },
        { status: 404 }
      );
    }

    // Ne pas permettre le transfert vers son propre compte
    if (account.userId === session.user.id) {
      return NextResponse.json(
        { success: false, message: "Vous ne pouvez pas transférer vers votre propre compte" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      recipient: {
        accountId: account.id,
        accountName: account.name,
        userName: account.user.name,
      },
    });
  } catch (error) {
    console.error("[VALIDATE_RIB]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
