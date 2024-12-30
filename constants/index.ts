import {
  Settings2Icon,
  TerminalIcon,
  User2Icon,
  Users2Icon,
  Wallet,
} from "lucide-react";

export const MAX_DATE_RANGE_DAYS = 90;

export const Currencies = [
  { value: "XAF", label: "Franc CFA", locale: "fr-FR" },
  // { value: "XOF", label: "Franc CFAO", locale: "fr-FR" },
  { value: "EUR", label: "€ Euro", locale: "fr-FR" },
  { value: "USD", label: "$ Dollar", locale: "us-US" },
];

export type Currency = (typeof Currencies)[0];

export const AdminLinks = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: TerminalIcon,
  },

  {
    label: "Analytics",
    href: "/admin/dashboard/analytics",
    icon: Settings2Icon,
  },
  {
    label: "Utilisateurs",
    href: "/admin/dashboard/users",
    icon: Users2Icon,
  },
  {
    label: "Transations",
    href: "/admin/dashboard/transactions",
    icon: Wallet,
  },
  {
    label: "Paramètres",
    href: "/admin/dashboard/settings",
    icon: Settings2Icon,
  },
  {
    label: "Profile",
    href: "/admin/dashboard/profile",
    icon: User2Icon,
  },
];

export const UserLinks = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: TerminalIcon,
  },
  // {
  //   label: "Mes comptes",
  //   href: "/dashboard/accounts",
  //   icon: Wallet,
  // },
  {
    label: "Transations",
    href: "/dashboard/transactions",
    icon: Wallet,
  },
  {
    label: "Affiliation",
    href: "/dashboard/affiliation",
    icon: User2Icon,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User2Icon,
  },
];

export const CommercialLinks = [
  {
    label: "Dashboard",
    href: "/commercial/dashboard",
    icon: TerminalIcon,
  },
  {
    label: "Transations",
    href: "/commercial/dashboard/transactions",
    icon: Wallet,
  },
  {
    label: "Profile",
    href: "/commercial/dashboard/profile",
    icon: User2Icon,
  },
];

export const idTypes = [
  { type: "IDCard", label: "Carte Nationale d'identité" },
  { type: "Passport", label: "Passeport" },
  { type: "DiverLicence", label: "Permi de conduire" },
  { type: "Reciep", label: "Récépissé CNI" },
];

export const businessType = [
  { type: "boutique", label: "Boutique" },
  { type: "entreprise", label: "Entreprise" },
  { type: "etablissement scolaire", label: "Etablissement Scolaire" },
  { type: "microfinance", label: "MicroFinance" },
];
