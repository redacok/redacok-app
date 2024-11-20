"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getAccountTypeName } from "@/lib/bank-account";
import bankStore from "@/store/bank-store";
import { AccountType } from "@prisma/client";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { CreateAccountForm } from "./create-account-form";

interface CreateAccountButtonsProps {
  accounts: { name: string }[];
  onAccountCreated: () => Promise<void>;
}

export function CreateAccountButtons({
  accounts,
  onAccountCreated,
}: CreateAccountButtonsProps) {
  const [selectedType, setSelectedType] = useState<AccountType | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const invalidateData = bankStore((state) => state.invalidateData);

  // Check if all account types exist
  const hasAllAccountTypes = ["epargne", "courant", "business"].every((type) =>
    accounts.some(
      (account) => account.name === getAccountTypeName(type as AccountType)
    )
  );

  const createAccount = async (amount: number) => {
    if (!selectedType) return;

    try {
      await axios.post("/api/accounts", {
        type: selectedType,
        initialAmount: amount,
      });
      await onAccountCreated();
      invalidateData();
      setIsOpen(false);
      toast.success("Compte créé avec succès");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Erreur lors de la création du compte");
      }
    }
  };

  if (hasAllAccountTypes) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Créer un compte</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["epargne", "courant", "béni"] as AccountType[]).map((type) => {
          const hasAccount = accounts.some(
            (account) => account.name === getAccountTypeName(type)
          );

          if (hasAccount) {
            return null;
          }

          return (
            <Popover
              key={type}
              open={isOpen && selectedType === type}
              onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) setSelectedType(null);
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  className="w-full"
                  onClick={() => setSelectedType(type)}
                >
                  Créer un compte {type}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">
                      Création de compte {type}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Veuillez effectuer un dépôt initial pour activer votre
                      compte.
                    </p>
                  </div>
                  <CreateAccountForm
                    type={type}
                    onSubmit={createAccount}
                    onCancel={() => {
                      setIsOpen(false);
                      setSelectedType(null);
                    }}
                  />
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    </div>
  );
}
