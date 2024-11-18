import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accounts = await db.bankAccount.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = await req.json();

    // Validate account type
    if (!['epargne', 'courant', 'béni'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid account type' },
        { status: 400 }
      );
    }

    // Check if user already has this type of account
    const existingAccount = await db.bankAccount.findFirst({
      where: {
        userId: session.user.id,
        code: type,
      },
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: 'You already have this type of account' },
        { status: 400 }
      );
    }

    // Create new account
    const account = await db.bankAccount.create({
      data: {
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Account`,
        code: type,
        amount: 0,
        userId: session.user.id,
      },
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
