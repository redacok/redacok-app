export type AccountType = 'epargne' | 'courant' | 'béni';

export interface BankAccount {
  id: string;
  name: string;
  code: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export function formatRIB(rib: string): string {
  if (rib.length !== 23) return rib;
  return `${rib.slice(0, 5)} ${rib.slice(5, 10)} ${rib.slice(10, 21)} ${rib.slice(21)}`;
}

export function getAccountTypeFromRIB(rib: string): AccountType | null {
  const typeDigit = rib[10];
  if (typeDigit === '1') return 'courant';
  if (typeDigit === '2') return 'epargne';
  if (typeDigit === '3') return 'béni';
  return null;
}

export function getAccountTypeName(type: AccountType): string {
  switch (type) {
    case 'courant':
      return 'Compte Courant';
    case 'epargne':
      return 'Compte Épargne';
    case 'béni':
      return 'Compte Béni';
  }
}