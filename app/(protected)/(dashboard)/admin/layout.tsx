import { auth } from "@/auth";
import { getRoleBasedRedirectPath } from "@/lib/role-redirect";
import { SessionProvider } from "next-auth/react";
import { redirect } from "next/navigation";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  if (session.user.role !== "ADMIN") {
    redirect(getRoleBasedRedirectPath(session.user.role));
  }

  return (
    <SessionProvider>
      <div className="flex min-h-screen flex-col pb-4">{children}</div>;
    </SessionProvider>
  );
}
