import {
  Settings2Icon,
  TerminalIcon,
  User2Icon,
  Users2Icon,
  Wallet,
} from "lucide-react";

export const Currencies = [
  { value: "XAF", label: "Franc CFA", locale: "fr-FR" },
  { value: "XOF", label: "Franc CFAO", locale: "fr-FR" },
  { value: "EUR", label: "€ Euro", locale: "fr-FR" },
  { value: "USD", label: "$ Dollar", locale: "us-US" },
];

export type Currency = (typeof Currencies)[0];

export const AdminLinks = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: TerminalIcon,
  },
  {
    label: "Utilisateurs",
    href: "/dashboard/users",
    icon: Users2Icon,
  },
  {
    label: "Transations",
    href: "/dashboard/transactions",
    icon: Wallet,
  },
  {
    label: "Paramètres",
    href: "/dashboard/settings",
    icon: Settings2Icon,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User2Icon,
  },
];

export const UserLinks = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: TerminalIcon,
  },
  {
    label: "Transations",
    href: "/dashboard/transactions",
    icon: Wallet,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User2Icon,
  },
];
