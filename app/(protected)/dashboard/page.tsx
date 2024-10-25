import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { DoorOpen, Wallet } from "lucide-react";
import { FcDebt, FcMoneyTransfer } from "react-icons/fc";
import { StatCard } from "./_components/stat-card";

const page = async () => {
  const session = await auth();

  return (
    <div className="flex flex-col gap-y-4">
      <h1 className="font-semibold text-2xl">Dashboard</h1>
      <h1 className="font-semibold text-xl">
        salut {session?.user.name} et bienvenue dans votre compte d&apos;épargne
        à 10%
      </h1>
      <div className="flex gap-4">
        <StatCard
          title="Solde"
          value={253000}
          icon={
            <Wallet className="h-12 w-12 items-center rounded-lg p-2 text-blue-500 bg-blue-400/10" />
          }
        />
        <StatCard
          title="Dépenses"
          value={433000}
          icon={
            <FcMoneyTransfer className="h-12 w-12 items-center rounded-lg p-2 text-blue-500 bg-blue-400/10" />
          }
        />
        <StatCard
          title="Crédit"
          value={1253000}
          icon={
            <FcDebt className="h-12 w-12 items-center rounded-lg p-2 text-blue-500 bg-blue-400/10" />
          }
        />
      </div>
      {/* {JSON.stringify(session?.user)} */}
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <Button type="submit">
          <DoorOpen className="size-5 mr-3" /> Se déconnecter
        </Button>
      </form>
    </div>
  );
};

export default page;
