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

function generateRIB(type: string, userId: string): string {
  // Bank code (5 digits) - using a fixed code for the bank
  const bankCode = '12345';
  
  // Branch code (5 digits) - using first 5 chars of userId
  const branchCode = userId.slice(0, 5).padStart(5, '0');
  
  // Account number (11 digits)
  // First digit represents account type: 1=courant, 2=epargne, 3=béni
  const typePrefix = type === 'courant' ? '1' : type === 'epargne' ? '2' : '3';
  const timestamp = Date.now().toString().slice(-9);
  const accountNumber = (typePrefix + timestamp).padStart(11, '0');
  
  // RIB key (2 digits) - simple calculation based on other parts
  const ribBase = bankCode + branchCode + accountNumber;
  const ribKey = (97 - (parseInt(ribBase) % 97)).toString().padStart(2, '0');
  
  return `${bankCode}${branchCode}${accountNumber}${ribKey}`;
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
        name: type === 'courant' ? 'Compte Courant' : type === 'epargne' ? 'Compte Épargne' : 'Compte Béni',
      },
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: 'Vous avez déjà un compte de ce type' },
        { status: 400 }
      );
    }

    const rib = generateRIB(type, session.user.id);

    // Create new account
    const account = await db.bankAccount.create({
      data: {
        name: type === 'courant' ? 'Compte Courant' : type === 'epargne' ? 'Compte Epargne' : 'Compte Béni',
        code: rib,
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
