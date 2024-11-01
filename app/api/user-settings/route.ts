import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in?callback=/dashboard/settings");
  }
  let userCurrency = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!userCurrency) {
    userCurrency = await db.user.create({
      data: {
        id: session.user.id,
        currency: "XAF",
      },
    });
  }

  revalidatePath("/");
  return Response.json(userCurrency);
}
