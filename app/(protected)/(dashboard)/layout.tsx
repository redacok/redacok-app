import { auth } from "@/auth";
import { SidebarApp } from "@/components/sidebar-app";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  if (!user.currency) {
    redirect("/wizard");
  }

  return (
    <SidebarApp session={session.user}>
      <main className="w-full flex py-3">
        <div className="px-2 sm:px-3 w-full">{children}</div>
      </main>
    </SidebarApp>
  );
}