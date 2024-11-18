'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type AccountType = 'epargne' | 'courant' | 'béni';

interface BankAccount {
  id: string;
  name: string;
  code: string;
  amount: number;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts');
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      toast.error('Echec de réccupération de comptes');
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (type: AccountType) => {
    if (accounts.some(account => account.code === type)) {
      toast.error(`Vous avez déja un compte ${type}`);
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) throw new Error('Failed to create account');

      await fetchAccounts();
      toast.success(`Compte ${type} créé avec succès`);
    } catch (error) {
      toast.error('Erreur lors de la création du compte');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">My Bank Accounts</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader>
              <CardTitle>{account.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{account.amount.toLocaleString()} XAF</p>
              <p className="text-sm text-gray-500">Account: {account.code}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Create New Account</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['epargne', 'courant', 'béni'] as AccountType[]).map((type) => {
            const hasAccount = accounts.some(account => account.code === type);
            if(hasAccount) {
                return null
            }
            return (
              <Button
                key={type}
                onClick={() => createAccount(type)}
                disabled={creating || hasAccount}
                className="w-full"
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {hasAccount ? `${type} Account Exists` : `Create ${type} Account`}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}