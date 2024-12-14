"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { transactionTreatmentSchema } from "@/lib/definitions";
import { editHistory } from "@/lib/helpers";
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
    await db.$transaction(async (tx) => {
      await tx.transaction.update({
        where: {
          id,
        },
        data: {
          status: decision,
          reviewedBy: user.id,
          reviewedAt: new Date(),
        },
      });

      // Mettre à jour le solde
      await tx.bankAccount.update({
        where: {
          id: transaction.fromAccountId!,
        },
        data: {
          amount: {
            decrement: transaction.amount + transaction.fee,
          },
        },
      });

      // Mettre à jour ou créer l'historique
      await editHistory(
        transaction.userId,
        transaction.fromAccountId!,
        transaction,
        transaction.amount + transaction.fee,
        "expense",
        tx
      );
    });
  }

  if (transaction.type === "TRANSFER") {
    await db.$transaction(async (tx) => {
      // Approver la transaction
      await tx.transaction.update({
        where: {
          id,
        },
        data: {
          status: decision,
          reviewedBy: user.id,
          reviewedAt: new Date(),
        },
      });

      // Mettre à jour le solde
      await tx.bankAccount.update({
        where: {
          id: transaction.fromAccountId!,
        },
        data: {
          amount: {
            decrement: transaction.amount,
          },
        },
      });

      //Mettre a jour le solde du destinataire
      await tx.bankAccount.update({
        where: {
          id: transaction.fromAccountId!,
        },
        data: {
          amount: {
            increment: transaction.amount,
          },
        },
      });

      // Mettre à jour l'historique de l'expéditeur
      await editHistory(
        transaction.fromAccount!.userId,
        transaction.fromAccountId!,
        transaction,
        transaction.amount + transaction.fee,
        "expense",
        tx
      );

      // Mettre à jour l'historique du destinataire
      await editHistory(
        transaction.toAccount!.userId,
        transaction.toAccountId!,
        transaction,
        transaction.amount,
        "income",
        tx
      );
    });
  }

  return { success: "transaction validée"! };
}
