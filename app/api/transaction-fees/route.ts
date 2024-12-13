import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const feeRanges = await db.transactionFeeRange.findMany({
      orderBy: { minAmount: "asc" },
    });
    return NextResponse.json(feeRanges);
  } catch (error) {
    console.error("Error fetching fee ranges:", error);
    return NextResponse.json(
      { error: "Failed to fetch fee ranges" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const feeRange = await db.transactionFeeRange.create({
      data: {
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
        feePercentage: data.feePercentage,
        fixedFee: data.fixedFee,
        minFee: data.minFee,
        maxFee: data.maxFee,
      },
    });
    return NextResponse.json(feeRange);
  } catch (error) {
    console.error("Error creating fee range:", error);
    return NextResponse.json(
      { error: "Failed to create fee range" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const feeRange = await db.transactionFeeRange.update({
      where: { id: data.id },
      data: {
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
        feePercentage: data.feePercentage,
        fixedFee: data.fixedFee,
        minFee: data.minFee,
        maxFee: data.maxFee,
      },
    });
    return NextResponse.json(feeRange);
  } catch (error) {
    console.error("Error updating fee range:", error);
    return NextResponse.json(
      { error: "Failed to update fee range" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Fee range ID is required" },
        { status: 400 }
      );
    }

    await db.transactionFeeRange.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting fee range:", error);
    return NextResponse.json(
      { error: "Failed to delete fee range" },
      { status: 500 }
    );
  }
}
