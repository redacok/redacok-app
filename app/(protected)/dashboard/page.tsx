import { auth } from "@/auth";
import { FcCurrencyExchange, FcDebt, FcMoneyTransfer } from "react-icons/fc";
import { StatCard } from "./_components/stat-card";

const page = async () => {
  const session = await auth();

  return (
    <div className="flex flex-col gap-y-4 w-full mx-auto pb-4">
      <div className="bg-card border-b w-full">
        <div className="flex items-center justify-between container mx-auto">
          <h1 className="font-semibold text-3xl">Dashboard</h1>
        </div>
      </div>
      <div className="border-b">
        <div className="container mx-auto py-8">
          <p className="text-3xl font-bold">salut {session?.user.name}!</p>
          <p className="text-xl">
            bienvenue dans votre compte d&apos;épargne à 10%
          </p>
        </div>
      </div>
      <div className="relative container mx-auto flex w-full flex-wrap gap-4 md:flex-nowrap">
        <StatCard
          title="Solde courant"
          value={253000}
          icon={
            <FcCurrencyExchange className="h-12 w-12 items-center rounded-lg p-2 text-slate-700 bg-blue-400/10" />
          }
        />
        <StatCard
          title="Solde d'épargne"
          value={433000}
          icon={
            <FcMoneyTransfer className="h-12 w-12 items-center rounded-lg p-2 bg-blue-400/10" />
          }
        />
        <StatCard
          title="Solde Journalier"
          value={12544}
          icon={
            <FcDebt className="h-12 w-12 items-center rounded-lg p-2 bg-blue-400/10" />
          }
        />
      </div>
      <div className="flex gap-4 relatice container mx-auto w-full flex-wrap sm:flex-nowrap">
        {[...new Array(2)].map((i) => (
          <div
            key={"second-array" + i}
            className="w-full aspect-video rounded-lg border border-slate-300  bg-slate-200 dark:bg-neutral-800 animate-pulse"
          />
        ))}
      </div>
      {/* {JSON.stringify(session?.user)} */}
      <div className="flex gap-2 container mx-auto flex-1 flex-wrap md:flex-nowrap">
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

export default page;
