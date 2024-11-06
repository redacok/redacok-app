import { auth } from "@/auth";
import { db } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextApiRequest) {
  const session = await auth();

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { file } = req.body;

    const response = await cloudinary.uploader.upload(file, {
      resource_type: "auto", // Pour accepter images, PDF, vidéos, etc.
    });
    return NextResponse.json({ url: response.secure_url });
  } catch (error) {
    console.error("[CLOUDINARY_UPLOAD_ERROR]: ", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
