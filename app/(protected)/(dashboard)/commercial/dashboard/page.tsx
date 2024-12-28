import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DisplayAccounts } from "./account/_components/display-accounts";

const AccountsPage = async () => {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in?callback=/dashboard");
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    redirect("/");
  }

  return (
    <div className="min-h-[calc(100vh-80px)] pb-4">
      <DisplayAccounts user={user} />
    </div>
  );
};

export default AccountsPage;
