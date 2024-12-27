import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const feeRangeSchema = z.object({
  minAmount: z.number().min(0),
  maxAmount: z.number().min(0),
  feePercentage: z.number().min(0).max(100),
  fixedFee: z.number().min(0),
  minFee: z.number().min(0),
  maxFee: z.number().min(0),
  transactionType: z.enum(["DEPOSIT", "TRANSFER", "WITHDRAWAL"]),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = feeRangeSchema.parse(body);

    const feeRange = await db.transactionFeeRange.create({
      data: validatedData,
    });

    return NextResponse.json(feeRange);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }

    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id, ...data } = await req.json();
    if (!id) {
      return new NextResponse("Missing id", { status: 400 });
    }

    const validatedData = feeRangeSchema.parse(data);

    const feeRange = await db.transactionFeeRange.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(feeRange);
  } catch (error) {
    console.error("Error updating fee range:", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }

    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const feeRanges = await db.transactionFeeRange.findMany({
      orderBy: {
        minAmount: "asc",
      },
    });

    return NextResponse.json(feeRanges);
  } catch (error) {
    console.error("Error fetching fee ranges:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
