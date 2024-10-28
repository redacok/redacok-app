import {
  Settings2Icon,
  TerminalIcon,
  User2Icon,
  Users2Icon,
} from "lucide-react";

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
    label: "Paramètres",
    href: "dashboard/settings",
    icon: Settings2Icon,
  },
];

export const UserLinks = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: TerminalIcon,
  },
  {
    label: "Profile",
    href: "/dashboard/users",
    icon: User2Icon,
  },
];
