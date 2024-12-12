import { auth } from "@/auth";
import { generateRIB, getAccountTypeName } from "@/lib/bank-account";
import { db } from "@/lib/db";
import { checkKycStatus } from "@/middleware/check-kyc-status";
import {
  AccountType,
  TransactionStatus,
  TransactionType,
} from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createAccountSchema = z.object({
  accountType: z.enum(["epargne", "courant", "business"]),
  currency: z.enum(["XAF", "EUR", "USD"]).default("XAF"),
  initialDeposit: z
    .number()
    .min(3000, "Le dépôt initial doit être d'au moins 1000 XAF"),
  fee: z.number().default(0),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accounts = await db.bankAccount.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    const kycCheck = await checkKycStatus();
    if (!kycCheck.allowed) {
      return NextResponse.json({ error: kycCheck.message }, { status: 403 });
    }

    const body = await req.json();
    const result = createAccountSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { accountType, currency, initialDeposit, fee } = result.data;

    // Vérifier si l'utilisateur a déjà un compte avec ce nom
    const existingAccount = await db.bankAccount.findFirst({
      where: {
        userId: session.user.id,
        name: getAccountTypeName(accountType),
      },
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: "Vous avez déjà un compte avec ce nom" },
        { status: 400 }
      );
    }

    // Créer un compte avec la transaction initiale
    const account = await db.$transaction(async (tx) => {
      const userId = session.user.id;
      if (!userId) {
        throw new Error("Utilisateur non trouvé");
      }

      // Créer le compte
      const account = await tx.bankAccount.create({
        data: {
          userId,
          name: getAccountTypeName(accountType),
          type: accountType as AccountType,
          currency,
          amount: initialDeposit,
          rib: generateRIB(accountType as AccountType, userId),
        },
      });

      // Créer la transaction initiale
      const transaction = await tx.transaction.create({
        data: {
          type: "DEPOSIT",
          amount: initialDeposit,
          fee,
          description: "Dépôt initial",
          status: "COMPLETED",
          toAccountId: account.id,
          userId,
        },
      });

      // Vérifier si c'est le premier dépôt de l'utilisateur et gérer la récompense d'affiliation
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { referredBy: true, bankAccounts: true },
      });

      if (!user?.hasFirstDeposit && user?.referredBy) {
        // Calculer la récompense de 10%
        const rewardAmount = initialDeposit * 0.1;

        // Créer la transaction de récompense d'affiliation
        await tx.transaction.create({
          data: {
            type: TransactionType.DEPOSIT,
            amount: rewardAmount,
            description: `Gains d'affiliation pour le premier dépot de ${user.name}`,
            status: TransactionStatus.COMPLETED,
            isAffiliateReward: true,
            affiliateRewardForTransactionId: transaction.id,
            userId: user.referredBy.id,
            toAccountId: user.bankAccounts[0].id, // Assuming the reward goes to their primary account
          },
        });

        // Mettre à jour le statut du premier dépôt de l'utilisateur
        await db.user.update({
          where: { id: session.user.id },
          data: { hasFirstDeposit: true },
        });

        // Mettre à jour le solde du compte du parrain
        await db.bankAccount
          .findFirst({
            where: { userId: user.referredBy.id },
          })
          .then((account) => {
            if (account) {
              return db.bankAccount.update({
                where: { id: account.id }, // Use the found account's ID
                data: {
                  amount: {
                    increment: rewardAmount,
                  },
                },
              });
            }
          });
      }
    });

    return NextResponse.json({ success: true, account });
  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du compte" },
      { status: 500 }
    );
  }
}
