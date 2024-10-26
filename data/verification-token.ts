import { db } from "@/lib/db";

export const getVerificationTokenByToken = async (token: string) => {
  try {
    const verificationToken = await db.verificationRequest.findUnique({
      where: {
        token,
      },
    });
    return verificationToken;
  } catch {
    return null;
  }
};

export const getVerificationTokenByIdentifier = async (identifier: string) => {
  try {
    const verificationToken = await db.verificationRequest.findFirst({
      where: {
        identifier,
      },
    });
    return verificationToken;
  } catch {
    return null;
  }
};
