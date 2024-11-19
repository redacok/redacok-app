import { AccountType } from "@prisma/client";

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
  if (typeDigit === '3') return 'business';
  return null;
}

export function getAccountTypeName(type: AccountType): string {
  switch (type) {
    case 'courant':
      return 'Compte Courant';
    case 'epargne':
      return 'Compte Épargne';
    case 'business':
      return 'Compte Béni';
  }
}

export function generateRIB(type: string, userId: string): string {
  // Bank code (5 digits) - using a fixed code for the bank
  const bankCode = "12345";

  // Branch code (5 digits) - using first 5 chars of userId
  const branchCode = userId.slice(0, 5).padStart(5, "0");

  // Account number (11 digits)
  // First digit represents account type: 1=courant, 2=epargne, 3=béni
  const typePrefix = type === "courant" ? "1" : type === "epargne" ? "2" : "3";
  const timestamp = Date.now().toString().slice(-9);
  const accountNumber = (typePrefix + timestamp).padStart(11, "0");

  // RIB key (2 digits) - simple calculation based on other parts
  const ribBase = bankCode + branchCode + accountNumber;
  const ribKey = (97 - (parseInt(ribBase) % 97)).toString().padStart(2, "0");

  return `${bankCode}${branchCode}${accountNumber}${ribKey}`;
}