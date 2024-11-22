import { uploadToCloudinary } from "@/lib/cloudinary";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;
    console.log("voici le ficier :", file);

    const fileBuffer = await file.arrayBuffer();

    const mimeType = file.type;
    const encoding = "base64";
    const base64Data = Buffer.from(fileBuffer).toString("base64");

    // this will be used to upload the file
    const fileUri = "data:" + mimeType + ";" + encoding + "," + base64Data;

    const res = await uploadToCloudinary(fileUri, file.name);

    if (res.success && res.result) {
      // return NextResponse.json({
      //   message: "success",
      //   fileUrl: res.result.secure_url,
      // });

      const newMedia = await db.media.create({
        data: {
          name: res.result.original_filename,
          type: file.type,
          url: res.result.secure_url,
        }
      });

      return NextResponse.json({
        message: "success",
        fileUrl: newMedia.url,
        fileId: newMedia.id
      });

    } else return NextResponse.json({ message: "failure" });
  } catch (error) {
    return NextResponse.json(
      {
        message: "error" + error,
      },
      { status: 500 }
    );
  }
}
