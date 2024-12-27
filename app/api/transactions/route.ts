import { auth } from "@/auth";
import { db } from "@/lib/db";
import { editHistory } from "@/lib/helpers";
import { sendTransactionMail } from "@/lib/mail";
import { checkKycStatus } from "@/middleware/check-kyc-status";
import { TransactionStatus, TransactionType } from "@prisma/client";
import { NextResponse } from "next/server";

const MIN_BALANCE = 1000; // 1000 XAF minimum balance

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Vérifier que userId est défini
    if (!session.user.id) {
      return NextResponse.json(
        { success: false, message: "Utilisateur non authentifié" },
        { status: 401 }
      );
    }

    const kycCheck = await checkKycStatus();
    if (!kycCheck.allowed) {
      return NextResponse.json({ error: kycCheck.message }, { status: 403 });
    }

    const body = await req.json();
    const { type, amount, fromAccount, toAccount, account, description, fee } =
      body;

    const totalAmount = amount + fee;

    // Validation de base
    if (!type || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Données invalides" },
        { status: 400 }
      );
    }

    // Vérifier le compte pour les dépôts et retraits
    if (type === "DEPOSIT" || type === "WITHDRAWAL") {
      if (!account) {
        return NextResponse.json(
          { success: false, message: "Compte non spécifié" },
          { status: 400 }
        );
      }

      const bankAccount = await db.bankAccount.findUnique({
        where: { id: account },
      });

      if (!bankAccount) {
        return NextResponse.json(
          { success: false, message: "Compte non trouvé" },
          { status: 404 }
        );
      }

      // Vérifier que le compte appartient à l'utilisateur
      if (bankAccount.userId !== session.user.id) {
        return NextResponse.json(
          { success: false, message: "Ce compte ne vous appartient pas" },
          { status: 403 }
        );
      }

      // Vérifier le solde disponible pour les retraits
      if (type === "WITHDRAWAL") {
        const availableBalance = bankAccount.amount - MIN_BALANCE;
        if (availableBalance < totalAmount) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Solde insuffisant. N'oubliez pas que vous devez maintenir un solde minimum de 1000 XAF",
            },
            { status: 400 }
          );
        }
      }
    }

    // Vérifier le compte source pour les transferts
    if (type === "TRANSFER") {
      const sourceAccount = await db.bankAccount.findUnique({
        where: { id: fromAccount },
      });

      if (!sourceAccount) {
        return NextResponse.json(
          { success: false, message: "Compte source non trouvé" },
          { status: 404 }
        );
      }

      const availableBalance = sourceAccount.amount - MIN_BALANCE;
      if (availableBalance < totalAmount) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Solde insuffisant. N'oubliez pas que vous devez maintenir un solde minimum de 1000 XAF",
          },
          { status: 400 }
        );
      }

      // Vérifier que le compte appartient à l'utilisateur
      if (sourceAccount.userId !== session.user.id) {
        return NextResponse.json(
          { success: false, message: "Ce compte ne vous appartient pas" },
          { status: 403 }
        );
      }
    }

    let destinationAccount = null;
    // Vérifier le compte destinataire pour les transferts
    if (type === "TRANSFER") {
      destinationAccount = await db.bankAccount.findUnique({
        where: { rib: toAccount },
      });

      if (!destinationAccount) {
        return NextResponse.json(
          { success: false, message: "Compte destinataire non trouvé" },
          { status: 404 }
        );
      }

      // Ne pas permettre le transfert vers son propre compte
      if (destinationAccount.userId === session.user.id) {
        return NextResponse.json(
          {
            success: false,
            message: "Vous ne pouvez pas transférer vers votre propre compte",
          },
          { status: 400 }
        );
      }
    }

    // Créer la transaction
    const transaction = await db.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          type: type as TransactionType,
          amount,
          description,
          fee,
          status:
            type === "DEPOSIT" || type === "TRANSFER"
              ? TransactionStatus.COMPLETED
              : TransactionStatus.PENDING,
          fromAccountId:
            type === "TRANSFER"
              ? fromAccount
              : type === "WITHDRAWAL"
              ? account
              : null,
          toAccountId:
            type === "TRANSFER"
              ? destinationAccount && destinationAccount.id
              : type === "DEPOSIT"
              ? account
              : null,
          userId: session.user.id!,
        },
        include: {
          toAccount: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
          fromAccount: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      // Mettre à jour immédiatement le soldre des comptes
      if (type === "TRANSFER") {
        // Mettre à jour le solde du compte expéditeur
        await tx.bankAccount.update({
          where: { id: fromAccount },
          data: {
            amount: {
              decrement: totalAmount,
            },
          },
        });

        // Mettre à jour le solde du compte destinataire
        await tx.bankAccount.update({
          where: { id: destinationAccount?.id },
          data: {
            amount: {
              increment: amount,
            },
          },
        });

        // Mettre à jour l'historique de l'expéditeur
        await editHistory(
          session.user.id!,
          fromAccount,
          transaction,
          transaction.amount + transaction.fee,
          "expense",
          tx
        );

        // Mettre à jour l'historique du destinataire
        await editHistory(
          destinationAccount ? destinationAccount.userId : "",
          transaction.toAccountId!,
          transaction,
          transaction.amount,
          "income",
          tx
        );
      }

      // Pour les dépôts, mettre à jour immédiatement le solde et gérer les récompenses d'affiliation
      if (type === "DEPOSIT") {
        // Mettre à jour le solde du compte
        await tx.bankAccount.update({
          where: { id: account },
          data: {
            amount: {
              increment: amount,
            },
          },
        });

        // Mettre à jour ou créer l'historique mensuel
        await editHistory(
          transaction.userId,
          account,
          transaction,
          amount,
          "income",
          tx
        );
      }

      await sendTransactionMail(
        transaction,
        transaction.toAccount!.user.email!
      );
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    console.error("[TRANSACTIONS]", error);
    return new NextResponse("Internal Error ", { status: 500 });
  }
}
