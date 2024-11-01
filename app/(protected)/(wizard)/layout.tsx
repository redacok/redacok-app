import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

async function Layout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in?callback=/dashboard");
  }
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center">
      {children}
    </div>
  );
}

export default Layout;
