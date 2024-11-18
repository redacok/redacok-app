import { Button } from "@/components/ui/button";
import { AccountType, BankAccount } from "@/lib/bank-account";
import { Loader2 } from "lucide-react";

export type CreateAccountButtonsProps = {
  accounts: BankAccount[];
  creating: boolean;
  createAccount: (type: AccountType) => void;
}

export const CreateAccountButtons = ({accounts, creating, createAccount}: CreateAccountButtonsProps) => {
  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Créer un compte</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['epargne', 'courant', 'béni'] as AccountType[]).map((type) => {
          const hasAccount = accounts.some(
            account => account.name === `Compte ${type.charAt(0).toUpperCase() + type.slice(1)}`
          );
          if (hasAccount) {
            return null;
          }
          return (
            <Button
              key={type}
              onClick={() => createAccount(type)}
              disabled={creating}
              className="w-full"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Créer un compte {type}
            </Button>
          );
        })}
      </div>
    </div>
  )
}