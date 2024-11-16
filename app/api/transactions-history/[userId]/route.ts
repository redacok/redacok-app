import { OverviewQuerySchema } from "@/lib/definitions";
import { getTransactionsHistory } from "../route";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
    request: Request,
  { params }: { params: { userId: string } }
) {
    const user = await db.user.findUnique({
        where: { id: params.userId },
        select: {
          id: true,
        },
      });
  
      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
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
