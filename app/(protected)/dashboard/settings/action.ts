"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { UpdateUserCurrencySchema } from "@/lib/definitions";
import { redirect } from "next/navigation";

export async function UpdateUserCurrency(currency: string) {
  const parsedBody = UpdateUserCurrencySchema.safeParse({
    currency,
  });

  if (!parsedBody.success) {
    throw parsedBody.error;
  }

  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const userSettings = await db.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      currency,
    },
  });

  return userSettings;
}
