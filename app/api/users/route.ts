import { db } from "@/lib/db";
import { sendNewUserEmail } from "@/lib/mail";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function generatePassword(length = 8) {
  const charset = "0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const users = await db.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
              { phone: { contains: search } },
            ],
          }
        : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        active: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[USERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, role, countryId } = body;

    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        phone,
        role: role as UserRole,
        password: hashedPassword,
        countryId,
      },
    });

    await sendNewUserEmail(name, email, plainPassword);

    return NextResponse.json({ user });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'utilisateur" },
      { status: 500 }
    );
  }
}
