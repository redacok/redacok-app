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

    const { accountType, currency, initialDeposit } = result.data;

    // Check if user already has an account with this name
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

    // Create account with initial transaction
    const account = await db.$transaction(async (tx) => {
      const userId = session.user.id;
      if (!userId) {
        throw new Error("Utilisateur non trouvé");
      }

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

      // Create initial transaction
      const transaction = await tx.transaction.create({
        data: {
          type: "DEPOSIT",
          amount: initialDeposit,
          description: "Dépôt initial",
          status: "COMPLETED",
          fromAccountId: account.id,
          userId,
        },
      });

      // Check if this is user's first deposit and handle affiliate reward
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { referredBy: true, bankAccounts: true },
      });

      if (!user?.hasFirstDeposit && user?.referredBy) {
        // Calculate 10% reward
        const rewardAmount = initialDeposit * 0.1;

        // Create affiliate reward transaction
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

        // Update user's first deposit status
        await db.user.update({
          where: { id: session.user.id },
          data: { hasFirstDeposit: true },
        });

        // Update referrer's account balance
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
