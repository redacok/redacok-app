import { auth } from "@/auth";
import { db } from "@/lib/db";
import { OverviewQuerySchema } from "@/lib/definitions";
import { getFormatterForCurrency } from "@/lib/helpers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/sign-in");
  }
  const user = session.user;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const size = searchParams.get("size");

  if (size && size === "all" && user.role !== "ADMIN") {
    redirect("/");
  }

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

export type getTransactionsHistoryResponseType = Awaited<
  ReturnType<typeof getTransactionsHistory>
>;

export async function getTransactionsHistory(
  userId: string,
  from: Date,
  to: Date
) {
  const userSettings = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!userSettings?.currency) {
    throw new Error("User settings not found");
  }

  const formatter = getFormatterForCurrency(userSettings.currency!);

  const transactions = await db.transaction.findMany({
    where: {
      ...(userSettings.role !== "ADMIN" ? { userId } : {}),
      createdAt: {
        gte: from,
        lte: to,
      },
    },
    include: {
      fromAccount: true,
      toAccount: true,
      categories: true,
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return transactions.map((transaction) => ({
    ...transaction,
    formattedAmount: formatter.format(transaction.amount),
    bankAccount: transaction.fromAccount,
    category: transaction.categories[0],
    user: transaction.user, // Pour la compatibilité avec l'interface existante
  }));
}
