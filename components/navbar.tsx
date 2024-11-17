"use client";

import { signOutUser } from "@/app/(auth)/sign-in/actions";
import { getRoleBasedRedirectPath } from "@/lib/role-redirect";
import { UserRole } from "@prisma/client";
import { DashboardIcon } from "@radix-ui/react-icons";
import { LogOut, User2 } from "lucide-react";
import { User } from "next-auth";
import Link from "next/link";
import { DashboardButton } from "./auth/dashboard-button";
import { Logo } from "./logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { UserAvatar } from "./user-avatar";

export const Navbar = ({
  session,
}: {
  session: ({ role: string; phone: string } & User) | undefined;
}) => {
  return (
    <div className="w-full absolute z-50 top-0 items-center backdrop-blur-sm border-b border-slate-900 flex py-1 px-4">
      <nav className="container mx-auto flex items-center justify-between">
        <Logo size="text-white" />

        {!session ? (
          <DashboardButton label="Connexion" session={session} />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex gap-2 cursor-pointer text-white items-center">
                <UserAvatar
                  name={session.name!}
                  image={null}
                  className="text-slate-800"
                />
                <span className="font-semibold">{session.name}</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" className="min-w-44 z-50">
              <DropdownMenuLabel>{session?.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link
                  href={getRoleBasedRedirectPath(session.role as UserRole)}
                  className="flex gap-2 items-center"
                >
                  <DashboardIcon />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href={`${getRoleBasedRedirectPath(
                    session.role as UserRole
                  )}/profile`}
                  className="flex gap-2 items-center"
                >
                  <User2 />
                  <span>Prodile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => signOutUser()}>
                <LogOut className="rotate-180" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </nav>
    </div>
  );
};
