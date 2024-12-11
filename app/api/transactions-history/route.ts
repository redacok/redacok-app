import { auth } from "@/auth";
import { db } from "@/lib/db";
import { OverviewQuerySchema } from "@/lib/definitions";
import { getFormatterForCurrency } from "@/lib/helpers";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  try {
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
      queryParams.data.to,
      user.role === "ADMIN"
    );

    return Response.json(transactions);
  } catch (error) {
    console.error(error);
    return Response.json("Error occurred while processing request", {
      status: 500,
    });
  }
}

export type getTransactionsHistoryResponseType = Awaited<
  ReturnType<typeof getTransactionsHistory>
>;

export async function getTransactionsHistory(
  userId: string,
  from: Date,
  to: Date,
  isAdmin: boolean = false
) {
  let whereClause: Prisma.TransactionWhereInput = {
    createdAt: {
      gte: from,
      lte: to,
    },
  };

  if (!isAdmin) {
    const userBankAccounts = await db.bankAccount.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
      },
    });

    const accountIds = userBankAccounts.map((account) => account.id);

    whereClause = {
      ...whereClause,
      OR: [
        {
          fromAccountId: {
            in: accountIds,
          },
        },
        {
          toAccountId: {
            in: accountIds,
          },
        },
      ],
    };
  }

  const transactions = await db.transaction.findMany({
    where: whereClause,
    include: {
      fromAccount: {
        include: {
          user: true,
        },
      },
      toAccount: {
        include: {
          user: true,
        },
      },
      categories: true,
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const userBankAccounts = await db.bankAccount.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
    },
  });

  const accountIds = userBankAccounts.map((account) => account.id);

  return transactions.map((transaction) => {
    const isOutgoing =
      !isAdmin && accountIds.includes(transaction.fromAccountId!);
    const displayAmount = isOutgoing ? -transaction.amount : transaction.amount;
    const formatter = getFormatterForCurrency(
      transaction.fromAccount?.currency || "XAF"
    );

    let username: string | undefined | null = "Moi";
    let accountName: string | undefined | null =
      transaction.toAccount?.name || null;

    if (isOutgoing) {
      if (transaction.type === "TRANSFER") {
        accountName =
          transaction.toAccount?.name +
          " - " +
          transaction.toAccount?.user?.name;
      } else {
        accountName = transaction.fromAccount?.name;
      }
    }

    if (isAdmin) {
      if (accountName === null) {
        accountName = transaction.fromAccount?.name;
      }
      if (transaction.type === "TRANSFER") {
        accountName =
          transaction.toAccount?.name +
          " - " +
          transaction.toAccount?.user?.name;
      }
      username = isOutgoing
        ? transaction.fromAccount?.user?.name
        : transaction.user?.name;
    }

    return {
      id: transaction.id,
      username,
      accountName,
      amount: displayAmount,
      formattedAmount: formatter.format(Math.abs(displayAmount)),
      fee: formatter.format(Math.abs(transaction.fee)),
      category: transaction.categories[0]?.name || "Non catégorisé",
      date: transaction.createdAt,
      type: transaction.type,
      description: transaction.description || "",
      status: transaction.status,
      user: transaction.user,
    };
  });
}
