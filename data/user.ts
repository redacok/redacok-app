import { db } from "@/lib/db";

export async function getUserByEmail(email: string) {
  const user = await db.user.findUnique({
    where: {
      email,
    },
  });
  return user;
}

export async function getUserByPhone(phone: string) {
  const user = await db.user.findUnique({
    where: {
      phone,
    },
  });
  return user;
}

export async function getUserById(id: string) {
  const user = await db.user.findUnique({
    where: {
      id,
    },
  });
  return user;
}
