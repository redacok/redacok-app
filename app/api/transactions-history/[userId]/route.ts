import { auth } from "@/auth";
import { db } from "@/lib/db";
import { OverviewQuerySchema } from "@/lib/definitions";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getTransactionsHistory } from "../route";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/sign-in");
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorize" }, { status: 502 });
  }

  const user = await db.user.findUnique({
    where: { id: params.userId },
    select: {
      id: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const queryParams = OverviewQuerySchema.safeParse({
    from,
    to,
  });

  if (!queryParams.success) {
    return Response.json(queryParams.error.message, {
      status: 400,
    });
  }

  const transactions = await getTransactionsHistory(
    user.id!,
    queryParams.data.from,
    queryParams.data.to
  );

  return Response.json(transactions);
}
