import { auth } from "@/auth";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify that the user is an admin
    const admin = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (admin?.role !== UserRole.ADMIN) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const data = await request.json();
    const { role, active } = data;

    // Update user role and status
    const user = await db.user.update({
      where: { id: params.userId },
      data: {
        ...(role && { role: role as UserRole }),
        ...(typeof active === 'boolean' && { active }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
