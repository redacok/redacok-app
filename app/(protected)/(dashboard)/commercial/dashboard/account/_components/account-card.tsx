"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BankAccount } from "@/lib/bank-account";
import { getFormatterForCurrency } from "@/lib/helpers";
import { Copy } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";

interface AccountCardProps {
  account: BankAccount;
  currency: string;
}

export function AccountCard({ account, currency }: AccountCardProps) {
  const formatter = getFormatterForCurrency(currency);

  const copyMerchantCode = useCallback(() => {
    const ribWithoutSpaces = account.rib.replace(/\s+/g, "");
    navigator.clipboard.writeText(ribWithoutSpaces);
    toast.success("MerchantCode copié");
  }, [account.rib]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{account.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <p className="text-2xl font-semibold">
            {formatter.format(account.amount)}
          </p>
          <p className="text-sm text-muted-foreground">
            Dernière transaction:{" "}
            {new Date(account.updatedAt).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <div className="pt-2 border-t">
          <div className="flex gap-2 items-center justify-between">
            <p className="text-sm text-muted-foreground font-mono">
              Code marchand: {account.merchantCode}
            </p>
            <button
              onClick={copyMerchantCode}
              className="text-muted-foreground justify-end"
            >
              <Copy className="size-4" />
              <span className="sr-only">Copier le code marchand</span>
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Créé le {new Date(account.createdAt).toLocaleDateString("fr-FR")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}