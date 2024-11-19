import { auth } from "@/auth";
import { generateRIB, getAccountTypeName } from "@/lib/bank-account";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createAccountSchema = z.object({
  accountType: z.enum(["savings", "checking", "business"]),
  currency: z.enum(["XAF", "EUR", "USD"]).default("XAF"),
  initialDeposit: z.number().min(1000, "Le dépôt initial doit être d'au moins 1000 XAF"),
  accountName: z.string().min(3, "Le nom du compte doit contenir au moins 3 caractères"),
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

    const body = await req.json();
    const result = createAccountSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { accountType, currency, initialDeposit, accountName } = result.data;

    // Check if user already has an account with this name
    const existingAccount = await db.bankAccount.findFirst({
      where: {
        userId: session.user.id,
        name: accountName,
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
          name: accountName,
          type: accountType,
          currency,
          amount: initialDeposit,
          rib: generateRIB(accountType, userId),
        },
      });

      // Create initial transaction
      await tx.transaction.create({
        data: {
          type: "DEPOSIT",
          amount: initialDeposit,
          description: "Dépôt initial",
          status: "COMPLETED",
          fromAccountId: account.id,
          userId,
        },
      });

      return account;
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
