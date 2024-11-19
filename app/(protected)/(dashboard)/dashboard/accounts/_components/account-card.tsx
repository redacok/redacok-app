'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BankAccount, formatRIB } from '@/lib/bank-account';
import { getFormatterForCurrency } from '@/lib/helpers';

interface AccountCardProps {
  account: BankAccount;
  currency: string;
}

export function AccountCard({ account, currency }: AccountCardProps) {
  const formatter = getFormatterForCurrency(currency);

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
            Dernière transaction: {new Date(account.updatedAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground font-mono">
            RIB: {formatRIB(account.rib)}
          </p>
          <p className="text-xs text-muted-foreground">
            Créé le {new Date(account.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
