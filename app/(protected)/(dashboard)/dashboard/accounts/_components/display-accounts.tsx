'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AccountType, BankAccount } from '@/lib/bank-account';
import { PageHeader } from '@/components/page-header';
import { AccountCard } from './account-card';
import axios from 'axios';
import { User } from '@prisma/client';
import { CreateAccountButtons } from './create-account-buttons';
import TransactionsPage from '../../transactions/page';

interface DisplayAccountsProps {
  user: User;
}

export function DisplayAccounts({ user }: DisplayAccountsProps) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const { data } = await axios.get<BankAccount[]>('/api/accounts');
      setAccounts(data);
    } catch (error) {
      toast.error('Échec de récupération des comptes');
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (type: AccountType) => {
    setCreating(true);
    try {
      await axios.post('/api/accounts', { type });
      await fetchAccounts();
      toast.success(`Compte ${type} créé avec succès`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Erreur lors de la création du compte');
      }
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

  // Check if all account types exist
  const hasAllAccountTypes = ['epargne', 'courant', 'béni'].every(type =>
    accounts.some(account => account.name === `Compte ${type.charAt(0).toUpperCase() + type.slice(1)}`)
  );

  // Check if some account types exist
  const hasSomeAccountTypes = ['epargne', 'courant', 'béni'].some(type =>
    accounts.some(account => account.name === `Compte ${type.charAt(0).toUpperCase() + type.slice(1)}`)
  );

  return (
    <div className="container mx-auto p-6 space-y-4">
      <PageHeader title="Mes Comptes" description="Gestion de vos comptes bancaires" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {accounts.map((account) => (
          <AccountCard 
            key={account.id} 
            account={account} 
            currency={user.currency || 'XAF'} 
          />
        ))}
      </div>

      {!hasAllAccountTypes && (
        <CreateAccountButtons accounts={accounts} creating={creating} createAccount={createAccount} />
      )}

      {hasSomeAccountTypes && (
        <TransactionsPage />
      )}
    </div>
  );
}
