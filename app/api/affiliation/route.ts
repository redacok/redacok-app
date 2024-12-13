"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user's referral data
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        referralCode: true,
        referrals: {
          select: {
            id: true,
            name: true,
            email: true,
            hasFirstDeposit: true,
            createdAt: true,
          },
        },
      },
    });

    // Get affiliate earnings from transactions
    const affiliateEarnings = await db.transaction.findMany({
      where: {
        userId: session.user.id,
        isAffiliateReward: true,
      },
      select: {
        id: true,
        amount: true,
        createdAt: true,
        affiliateRewardTransaction: {
          select: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        referralCode: user?.referralCode,
        referrals: user?.referrals,
        affiliateEarnings,
      },
    });
  } catch (error) {
    console.error("[AFFILIATION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
