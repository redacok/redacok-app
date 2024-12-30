"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BankAccount } from "@/lib/bank-account";
import { getFormatterForCurrency } from "@/lib/helpers";
import { Copy } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import { CardTooltip } from "./card-tooltip";

interface AccountCardProps {
  account: BankAccount;
  currency: string;
}

export function AccountCard({ account, currency }: AccountCardProps) {
  const formatter = getFormatterForCurrency(currency);

  const copyMerchantCode = useCallback(() => {
    const ribWithoutSpaces = String(account.merchantCode);
    navigator.clipboard.writeText(ribWithoutSpaces);
    toast.info("Code marchand copié");
  }, [account.merchantCode]);

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle>{account.name}</CardTitle>
        {(account.status === "LOCKED" || account.status === "SUSPENDED") && (
          <CardTooltip
            title={account.status === "SUSPENDED" ? "Suspendu" : "Bloqué"}
            type={account.status === "LOCKED" ? "danger" : "warning"}
            text={`Compte ${
              account.status === "LOCKED" ? "bloqué" : "suspendu"
            }, veuillez contacter votre gestionnaire`}
          />
        )}
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
