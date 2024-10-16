import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { getVerificationTokenByEmail } from "./verification-token";

export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);
  let verificationToken;

  const existingToken = await getVerificationTokenByEmail(email);

  if (existingToken) {
    verificationToken = await db.verificationRequest.update({
      where: {
        id: existingToken.id,
      },
      data: {
        token,
        expires,
      },
    });
  } else {
    verificationToken = await db.verificationRequest.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });
  }

  return verificationToken;
};
