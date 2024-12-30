"use client";

import { PageHeader } from "@/components/page-header";
import { BankAccount } from "@/lib/bank-account";
import bankStore from "@/store/bank-store";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import TransactionsPage from "../../../dashboard/transactions/page";
import { CreateClientTransactionDialog } from "../account/_components/create-client-transactions";

export default function CommercialTransactionsPage() {
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
        title="Transactions"
        description="Retrouvez toutes les transactions que vous avez effectuer"
        block={
          <div className="flex flex-col gap-3">
            <CreateClientTransactionDialog />
          </div>
        }
      />

      {accounts.length === 0 ? (
        <div className="bg-white rounded-xl p-6 text-center text-muted-foreground">
          Vous n&apos;avez pas encore de compte. Créez-en un pour commencer à
          effectuer des opérations.
        </div>
      ) : (
        <TransactionsPage />
      )}
    </div>
  );
}
