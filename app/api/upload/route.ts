import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

type UploadResponse =
  | { success: true; result?: UploadApiResponse }
  | { success: false; error: UploadApiErrorResponse };

const uploadToCloudinary = (
  fileUri: string,
  fileName: string
): Promise<UploadResponse> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload(fileUri, {
        invalidate: true,
        resource_type: "auto",
        filename_override: fileName,
        folder: "ecommerce-carrefour", // any sub-folder name in your cloud
        use_filename: true,
      })
      .then((result) => {
        resolve({ success: true, result });
      })
      .catch((error) => {
        reject({ success: false, error });
      });
  });
};

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
      return NextResponse.json({
        message: "success",
        imgUrl: res.result.secure_url,
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
// export async function POST(req: Request) {
//   // const session = await auth();

//   // if (!session?.user) {
//   //   return new NextResponse("Unauthorized", { status: 401 });
//   // }

//   // const user = await db.user.findUnique({
//   //   where: {
//   //     id: session.user.id,
//   //   },
//   // });

//   // if (!user) {
//   //   return new NextResponse("Unauthorized", { status: 401 });
//   // }

//   try {
//     const formDate = await  req.formData();
//     const response = await cloudinary.uploader.upload(file, {
//       resource_type: "auto", // Pour accepter images, PDF, vidéos, etc.
//     });
//     return NextResponse.json({ url: response.secure_url });
//   } catch (error) {
//     console.error("[CLOUDINARY_UPLOAD_ERROR]: ", error);
//     return new NextResponse("Internal Error", { status: 500 });
//   }
// }
