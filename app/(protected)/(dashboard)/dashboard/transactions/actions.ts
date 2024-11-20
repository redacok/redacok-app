"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function DeleteTransaction(id: string) {
  const session = await auth();
  if (!session || !session?.user) {
    redirect("/sign-in");
  }

  const user = session.user;

  const transaction = await db.transaction.findUnique({
    where: {
      userId: user.id,
      id,
    },
  });

  if (!transaction) {
    throw new Error("Bad request !");
  }

  await db.$transaction([
    //delete transaction
    db.transaction.delete({
      where: {
        id,
        userId: user.id,
      },
    }),
    // Update month History
    db.monthHistory.update({
      where: {
        day_month_year_userId_bankAccountId: {
          userId: user.id!,
          day: transaction.createdAt.getUTCDate(),
          month: transaction.createdAt.getUTCMonth(),
          year: transaction.createdAt.getUTCFullYear(),
          bankAccountId: transaction.fromAccountId!,
        },
      },
      data: {
        ...(transaction.type === "DEPOSIT" && {
          expense: {
            decrement: transaction.amount,
          },
        }),
        ...(transaction.type === "TRANSFER" && {
          income: {
            decrement: transaction.amount,
          },
        }),
      },
    }),
    // Update year History
    db.yearHistory.update({
      where: {
        month_year_userId_bankAccountId: {
          userId: user.id!,
          month: transaction.createdAt.getUTCMonth(),
          year: transaction.createdAt.getUTCFullYear(),
          bankAccountId: transaction.fromAccountId!,
        },
      },
      data: {
        ...(transaction.type === "DEPOSIT" && {
          expense: {
            decrement: transaction.amount,
          },
        }),
        ...(transaction.type === "TRANSFER" && {
          income: {
            decrement: transaction.amount,
          },
        }),
      },
    }),
  ]);
}
