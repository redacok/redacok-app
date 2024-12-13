"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { transactionTreatmentSchema } from "@/lib/definitions";
import { redirect } from "next/navigation";
import * as z from "zod";

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

export async function getAuth() {
  const session = await auth();
  return session;
}

export async function TreatTransactionAction(
  formData: z.infer<typeof transactionTreatmentSchema>
) {
  const validationResult = transactionTreatmentSchema.safeParse(formData);

  if (!validationResult.success) {
    return { error: "Les données ne sont pas valides !" };
  }

  const session = await auth();
  if (!session || !session?.user) {
    redirect("/sign-in");
  }

  const user = session.user;

  if (user.role !== "ADMIN" && user.role !== "COMMERCIAL") {
    return { error: "Action non autorisée !" };
  }

  const { id, decision, rejectionReason } = formData;

  const transaction = await db.transaction.findUnique({
    where: {
      id,
    },
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
    },
  });

  if (!transaction) {
    return { error: "transaction non trouvée !" };
  }

  if (decision === "REJECTED") {
    try {
      const treatedTransaction = await db.transaction.update({
        where: {
          id,
        },
        data: {
          status: decision,
          reviewedBy: user.id,
          reviewedAt: new Date(),
          rejectionReason,
        },
      });
      if (!treatedTransaction) {
        return { error: "Une erreur inattendue est survenue" };
      }
      return { success: "transaction rejetée !" };
    } catch (error) {
      return {
        error: "Erreur lors de la mise à jour de la transaction : " + error,
      };
    }
  }

  if (transaction.type === "WITHDRAWAL") {
    await db.$transaction([
      db.transaction.update({
        where: {
          id,
        },
        data: {
          status: decision,
          reviewedBy: user.id,
          reviewedAt: new Date(),
        },
      }),

      // Update the user balance
      db.bankAccount.update({
        where: {
          id: transaction.fromAccountId!,
        },
        data: {
          amount: {
            decrement: transaction.amount + transaction.fee,
          },
        },
      }),

      // Update user Month History
      // db.monthHistory.update({
      //   where: {
      //     day_month_year_userId_bankAccountId: {
      //       userId: transaction.userId,
      //       day: transaction.createdAt.getUTCDate(),
      //       month: transaction.createdAt.getUTCMonth(),
      //       year: transaction.createdAt.getUTCFullYear(),
      //       bankAccountId: transaction.fromAccountId ?? "",
      //     },
      //   },
      //   data: {
      //     expense: {
      //       increment: transaction.amount,
      //     },
      //   },
      // }),

      // // Update user year History
      // db.yearHistory.update({
      //   where: {
      //     month_year_userId_bankAccountId: {
      //       userId: transaction.fromAccount!.userId!,
      //       month: transaction.createdAt.getUTCMonth(),
      //       year: transaction.createdAt.getUTCFullYear(),
      //       bankAccountId: transaction.fromAccountId!,
      //     },
      //   },
      //   data: {
      //     expense: {
      //       increment: transaction.amount,
      //     },
      //   },
      // }),
    ]);
  }

  if (transaction.type === "TRANSFER") {
    await db.$transaction([
      // Approve transaction
      db.transaction.update({
        where: {
          id,
        },
        data: {
          status: decision,
          reviewedBy: user.id,
          reviewedAt: new Date(),
        },
      }),

      // Update the senderBalance
      db.bankAccount.update({
        where: {
          id: transaction.fromAccountId!,
        },
        data: {
          amount: {
            decrement: transaction.amount,
          },
        },
      }),

      //Update recieverAccount
      db.bankAccount.update({
        where: {
          id: transaction.fromAccountId!,
        },
        data: {
          amount: {
            increment: transaction.amount,
          },
        },
      }),

      // Update sender Month History
      db.monthHistory.update({
        where: {
          day_month_year_userId_bankAccountId: {
            userId: transaction.fromAccount!.userId,
            day: transaction.createdAt.getUTCDate(),
            month: transaction.createdAt.getUTCMonth(),
            year: transaction.createdAt.getUTCFullYear(),
            bankAccountId: transaction.fromAccountId!,
          },
        },
        data: {
          expense: {
            increment: transaction.amount,
          },
        },
      }),

      // Update reciever mounth history
      db.monthHistory.update({
        where: {
          day_month_year_userId_bankAccountId: {
            userId: transaction.toAccount!.userId,
            day: transaction.createdAt.getUTCDate(),
            month: transaction.createdAt.getUTCMonth(),
            year: transaction.createdAt.getUTCFullYear(),
            bankAccountId: transaction.toAccountId!,
          },
        },
        data: {
          income: {
            increment: transaction.amount,
          },
        },
      }),

      // Update sender year History
      db.yearHistory.update({
        where: {
          month_year_userId_bankAccountId: {
            userId: transaction.fromAccount!.userId!,
            month: transaction.createdAt.getUTCMonth(),
            year: transaction.createdAt.getUTCFullYear(),
            bankAccountId: transaction.fromAccountId!,
          },
        },
        data: {
          expense: {
            increment: transaction.amount,
          },
        },
      }),

      // Update reciever year History
      db.yearHistory.update({
        where: {
          month_year_userId_bankAccountId: {
            userId: transaction.toAccount!.userId!,
            month: transaction.createdAt.getUTCMonth(),
            year: transaction.createdAt.getUTCFullYear(),
            bankAccountId: transaction.toAccountId!,
          },
        },
        data: {
          income: {
            increment: transaction.amount,
          },
        },
      }),
    ]);
  }

  return { success: "transaction validée"! };
}
