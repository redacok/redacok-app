import { auth } from "@/auth";
import { FcCurrencyExchange, FcDebt, FcMoneyTransfer } from "react-icons/fc";
import { StatCard } from "./_components/stat-card";

const page = async () => {
  const session = await auth();

  return (
    <div className="flex flex-col gap-y-4 w-full">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-3xl">Dashboard</h1>
      </div>
      <h1 className="text-2xl">
        salut <span className="font-semibold">{session?.user.name}</span> !
      </h1>
      <h2 className="text-xl mb-2">
        bienvenue dans votre compte d&apos;épargne à 10%
      </h2>
      <div className="relative flex w-full flex-wrap gap-4 md:flex-nowrap">
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
      {/* {JSON.stringify(session?.user)} */}
      <div className="p-2 border rounded-md border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="flex gap-2 flex-1 flex-wrap md:flex-nowrap">
          {[...new Array(4)].map((i) => (
            <div
              key={"first-array" + i}
              className="w-full h-48 rounded-lg  bg-slate-300 dark:bg-neutral-800 animate-pulse"
            />
          ))}
        </div>
        <div className="flex gap-2 flex-1 h-full">
          {[...new Array(2)].map((i) => (
            <div
              key={"second-array" + i}
              className="w-full aspect-video rounded-lg  bg-slate-200 dark:bg-neutral-800 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default page;
