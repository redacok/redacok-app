import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getRoleBasedRedirectPath } from "@/lib/role-redirect";
import { redirect } from "next/navigation";
import AccountsPage from "./accounts/page";

const UserDashboard = async () => {
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

  if (user.role !== "USER" && user.role !== "PERSONAL") {
    redirect(getRoleBasedRedirectPath(user.role));
  }

  return <AccountsPage />;
};

export default UserDashboard;
