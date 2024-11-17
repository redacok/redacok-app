import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { FcCurrencyExchange, FcDebt, FcMoneyTransfer } from "react-icons/fc";
import { StatCard } from "./_components/stat-card";

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

  return (
    <div className="container space-y-4 w-full mx-auto pb-4">
      <PageHeader
        title={`Salut ${user.name!}`}
        description="Bienvenu dans votre compte d'épargne à 10%"
      />
      <div className="relative md:container px-2 mx-auto flex w-full flex-wrap gap-4 md:flex-nowrap">
        <StatCard
          title="Solde courant"
          value={253000}
          currency={user.currency || "XAF"}
          icon={
            <FcCurrencyExchange className="h-12 w-12 items-center rounded-lg p-2 text-slate-700 bg-blue-400/10" />
          }
        />
        <StatCard
          title="Solde d'épargne"
          value={433000}
          currency={user.currency || "XAF"}
          icon={
            <FcMoneyTransfer className="h-12 w-12 items-center rounded-lg p-2 bg-blue-400/10" />
          }
        />
        <StatCard
          title="Solde Journalier"
          value={12544}
          currency={user.currency || "XAF"}
          icon={
            <FcDebt className="h-12 w-12 items-center rounded-lg p-2 bg-blue-400/10" />
          }
        />
      </div>
      <div className="flex gap-4 relatice md:container px-2 mx-auto w-full flex-wrap sm:flex-nowrap">
        {[...new Array(2)].map((i) => (
          <div
            key={"second-array" + i}
            className="w-full aspect-video rounded-lg border border-slate-300  bg-slate-200 dark:bg-neutral-800 animate-pulse"
          />
        ))}
      </div>
      {/* {JSON.stringify(session?.user)} */}
      <div className="flex gap-2 container px-2 mx-auto flex-1 flex-wrap md:flex-nowrap">
        {[...new Array(4)].map((i) => (
          <div
            key={"first-array" + i}
            className="w-full h-48 rounded-lg  bg-slate-300 dark:bg-neutral-800 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
