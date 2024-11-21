import { auth } from "@/auth";
import { db } from "@/lib/db";
import { KycType } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await req.json();
    const {
      type,
      firstName,
      lastName,
      dateOfBirth,
      nationality,
      idType,
      idNumber,
      idExpirationDate,

      address,
      city,
      postalCode,
      country,
      idDocument,
      proofOfAddress,
      companyName,
      registrationNumber,
      companyDocument,
    } = data;

    // Vérifier si l'utilisateur a déjà une demande KYC en cours
    const existingKyc = await db.kyc.findFirst({
      where: {
        userId: session.user.id,
        status: "PENDING",
      },
    });

    if (existingKyc) {
      return new NextResponse(
        "Une demande de vérification KYC est déjà en cours",
        { status: 400 }
      );
    }

    // Créer la nouvelle demande KYC
    const kyc = await db.kyc.create({
      data: {
        type: type as KycType,
        userId: session.user.id!,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        nationality,
        idType,
        idNumber,
        idExpirationDate: new Date(idExpirationDate),
        // address,
        // city,
        // postalCode,
        // country,
        // idDocument,
        // proofOfAddress,
        // ...(type === "BUSINESS" && {
        //   companyName,
        //   registrationNumber,
        //   companyDocument,
        // }),
      },
    });

    return NextResponse.json(kyc);
  } catch (error) {
    console.error("[KYC_SUBMIT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
