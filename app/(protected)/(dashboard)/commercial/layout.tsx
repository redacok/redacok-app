import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function CommercialDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "COMMERCIAL") {
    redirect("/");
  }

  return <div className="flex min-h-screen flex-col pb-4">{children}</div>;
}
