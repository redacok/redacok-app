"use client";

import { User } from "next-auth";
import { DashboardButton } from "./auth/dashboard-button";
import { Logo } from "./logo";

export const Navbar = ({
  session,
}: {
  session: ({ role: string; phone: string } & User) | undefined;
}) => {
  return (
    <div className="w-full absolute z-50 top-0 items-center backdrop-blur-sm border-b border-slate-900 flex py-1">
      <nav className="container mx-auto flex items-center justify-between">
        <Logo size="text-white" />
        <DashboardButton label="Connexion" session={session} />
      </nav>
    </div>
  );
};
