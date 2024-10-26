import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { getVerificationTokenByIdentifier } from "./verification-token";

export const generateVerificationToken = async (
  email?: string,
  phone?: string
) => {
  let token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);
  let verificationToken;
  let identifier = email;

  if (!identifier) {
    identifier = phone;
    token = token.slice(0, 6);
  }
  if (!identifier) {
    throw new Error("No email or phone provided");
  }
  const existingToken = await getVerificationTokenByIdentifier(identifier);

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
        identifier,
        token,
        expires,
      },
    });
  }

  return verificationToken;
};
