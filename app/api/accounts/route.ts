import { auth } from "@/auth";
import { generateRIB, getAccountTypeName } from "@/lib/bank-account";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createAccountSchema = z.object({
  type: z.enum(["epargne", "courant", "béni"] as const),
  initialAmount: z
    .number()
    .min(500, { message: "Le montant minimum est de 500 XAF" }),
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

    const { type, initialAmount } = result.data;

    // Check if user already has this type of account
    const existingAccount = await db.bankAccount.findFirst({
      where: {
        userId: session.user.id,
        name: getAccountTypeName(type),
      },
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: `Vous avez déjà un compte ${type}` },
        { status: 400 }
      );
    }

    // Create account with initial transaction
    const account = await db.$transaction(async (tx) => {
      // Create the account
      const userId = session.user.id;
      if (!userId) {
        return NextResponse.json(
          { error: "Utilisateur non trouvé" },
          { status: 400 }
        );
      }

      const account = await tx.bankAccount.create({
        data: {
          userId: userId,
          name: getAccountTypeName(type),
          code: generateRIB(type, userId),
          amount: initialAmount,
        },
      });

      // Create initial transaction
      await tx.transaction.create({
        data: {
          bankAccountId: account.id,
          type: "DEPOSIT",
          amount: initialAmount,
          description: "Dépôt initial",
          date: new Date(),
          userId: userId,
          categoryId: "",
        },
      });

      return account;
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du compte" },
      { status: 500 }
    );
  }
}
