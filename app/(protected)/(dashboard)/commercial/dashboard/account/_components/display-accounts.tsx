"use client";

import { CreateTransactionDialog } from "@/app/(protected)/(dashboard)/dashboard/transactions/_components/create-transaction-dialog";
import { PageHeader } from "@/components/page-header";
import { BankAccount } from "@/lib/bank-account";
import bankStore from "@/store/bank-store";
import { User } from "@prisma/client";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AccountCard } from "./account-card";
import { CreateClientTransactionDialog } from "./create-client-transactions";

interface DisplayAccountsProps {
  user: User;
}

export function DisplayAccounts({ user }: DisplayAccountsProps) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const lastUpdate = bankStore((state) => state.lastUpdate);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get("/api/accounts");
      setAccounts(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la récupération des comptes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [lastUpdate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-4">
      <PageHeader
        title="Opérations client"
        description="Effectuer des dépots et retraits à des comptes client"
        block={
          <div className="flex flex-col gap-3">
            <CreateClientTransactionDialog />
          </div>
        }
      />
      <PageHeader
        title="Mes Comptes"
        description="Effectuez des opérations sur vos comptes personnels"
        block={
          <div className="flex flex-col gap-3">
            <CreateTransactionDialog />
          </div>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            currency={user.currency || "XAF"}
          />
        ))}
      </div>
      {accounts.length === 0 && (
        <div className="bg-white rounded-xl p-6 text-center text-muted-foreground">
          Vous n&apos;avez pas encore de compte. Créez-en un pour commencer.
        </div>
      )}
    </div>
  );
}
