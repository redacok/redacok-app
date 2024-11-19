import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("timeRange") || "7days";

    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case "24h":
        startDate.setHours(startDate.getHours() - 24);
        break;
      case "7days":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get total users
    const totalUsers = await db.user.count();

    // Get active users (users with transactions in the time range)
    const activeUsers = await db.user.count({
      where: {
        transactions: {
          some: {
            createdAt: {
              gte: startDate,
              lte: now,
            },
          },
        },
      },
    });

    // Get total transactions in time range
    const totalTransactions = await db.transaction.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: now,
        },
      },
    });

    // Get previous period metrics for comparison
    const previousStartDate = new Date(startDate);
    const previousEndDate = new Date(now);
    
    switch (timeRange) {
      case "24h":
        previousStartDate.setHours(previousStartDate.getHours() - 24);
        previousEndDate.setHours(previousEndDate.getHours() - 24);
        break;
      case "7days":
        previousStartDate.setDate(previousStartDate.getDate() - 7);
        previousEndDate.setDate(previousEndDate.getDate() - 7);
        break;
      case "30days":
        previousStartDate.setDate(previousStartDate.getDate() - 30);
        previousEndDate.setDate(previousEndDate.getDate() - 30);
        break;
      case "90days":
        previousStartDate.setDate(previousStartDate.getDate() - 90);
        previousEndDate.setDate(previousEndDate.getDate() - 90);
        break;
    }

    const previousTotalTransactions = await db.transaction.count({
      where: {
        createdAt: {
          gte: previousStartDate,
          lte: previousEndDate,
        },
      },
    });

    const previousActiveUsers = await db.user.count({
      where: {
        transactions: {
          some: {
            createdAt: {
              gte: previousStartDate,
              lte: previousEndDate,
            },
          },
        },
      },
    });

    // Calculate percentage changes
    const transactionChange = previousTotalTransactions === 0 
      ? 100 
      : ((totalTransactions - previousTotalTransactions) / previousTotalTransactions) * 100;
    
    const activeUsersChange = previousActiveUsers === 0 
      ? 100 
      : ((activeUsers - previousActiveUsers) / previousActiveUsers) * 100;

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalTransactions,
      systemStatus: "Healthy",
      metrics: {
        transactionChange: transactionChange.toFixed(1),
        activeUsersChange: activeUsersChange.toFixed(1),
      }
    });
  } catch (error) {
    console.error("[ANALYTICS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
