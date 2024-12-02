import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { auth } from "@/auth";

const settingSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
  description: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = settingSchema.parse(body);

    const setting = await db.adminSettings.upsert({
      where: {
        key: validatedData.key,
      },
      update: {
        value: validatedData.value,
        description: validatedData.description,
      },
      create: validatedData,
    });

    return NextResponse.json(setting);
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

    const validatedData = settingSchema.parse(data);

    const setting = await db.adminSettings.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error("Error updating setting:", error);
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

    const settings = await db.adminSettings.findMany({
      orderBy: {
        key: "asc",
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
