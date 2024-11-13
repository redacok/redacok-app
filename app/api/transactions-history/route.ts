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

async function getTransactionsHistory(userId: string, from: Date, to: Date) {
  const userSettings = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!userSettings) {
    throw new Error("User settings not found");
  }

  const formatter = getFormatterForCurrency(userSettings.currency!);

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: {
        gte: from,
        lte: to,
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  return Promise.all(
    transactions.map(async (transaction) => {
      const category = await db.category.findUnique({
        where: {
          id: transaction.categoryId,
        },
      });

      return {
        ...transaction,
        // format the amount with the user currency
        formattedAmount: formatter.format(transaction.amount),
        category,
      };
    })
  );
}
