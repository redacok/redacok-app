import { db } from "@/lib/db";

export async function getUserByEmail(email: string) {
  const user = await db.user.findUnique({
    where: {
      email,
    },
  });
  return user;
}
