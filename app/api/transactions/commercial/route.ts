import { auth } from "@/auth";
import { MIN_BALANCE } from "@/constants";
import { db } from "@/lib/db";
import { sendTransactionMail } from "@/lib/mail";
import { checkKycStatus } from "@/middleware/check-kyc-status";
import { TransactionStatus, TransactionType } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session?.user.role !== "COMMERCIAL") {
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
    const { type, amount, account, clientAccount, fee } = body;

    const totalAmount = amount + fee;

    // Validation de base
    if (!type || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Données invalides" },
        { status: 400 }
      );
    }

    // Vérifier le solde du compte compte pour les dépôts
    if (type === "DEPOSIT") {
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

      // Vérifier le solde disponible pour les dépots
      const availableBalance = bankAccount.amount - MIN_BALANCE;
      if (availableBalance < totalAmount) {
        return NextResponse.json(
          {
            success: false,
            message: `Solde insuffisant. N'oubliez pas que vous devez maintenir un solde minimum de ${MIN_BALANCE} XAF`,
          },
          { status: 400 }
        );
      }
    }

    // Vérifier le compte du client pour les retraits
    if (type === "WITHDRAWAL") {
      const toAccount = await db.bankAccount.findUnique({
        where: { id: clientAccount },
      });

      if (!toAccount) {
        return NextResponse.json(
          { success: false, message: "Compte du client non trouvé" },
          { status: 404 }
        );
      }

      const availableBalance = toAccount.amount - MIN_BALANCE;
      if (availableBalance < totalAmount) {
        return NextResponse.json(
          {
            success: false,
            message: `Solde insuffisant. N'oubliez pas que vous devez maintenir un solde minimum de ${MIN_BALANCE} XAF`,
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
          fee,
          status: TransactionStatus.PENDING,
          fromAccountId: type === "DEPOSIT" ? account : clientAccount,
          toAccountId: type === "DEPOSIT" ? clientAccount : account,
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