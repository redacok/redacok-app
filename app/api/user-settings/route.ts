import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session || !session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user?.currency) {
    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        currency: "XAF",
      },
    });
  }

  revalidatePath("/");
  return Response.json(user);
}
