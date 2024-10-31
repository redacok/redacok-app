import { SignInButton } from "@/components/auth/sign-in-button";
import { Button } from "@/components/ui/button";
import { DashboardIcon } from "@radix-ui/react-icons";
import { ArrowRight, LogIn } from "lucide-react";
import { User } from "next-auth";
import Link from "next/link";

export const DashboardButton = ({
  session,
  label,
}: {
  session: ({ role: string; phone: string } & User) | undefined;
  label: string;
}) => {
  return !session ? (
    <SignInButton>
      <Button
        variant="secondary"
        className="flex gap-2 hover:cursor-pointer z-50"
      >
        {label}
        {label === "Connexion" ? <LogIn /> : <ArrowRight />}
      </Button>
    </SignInButton>
  ) : (
    <Link href="/dashboard" className="z-50">
      <Button variant="secondary" size="lg">
        <DashboardIcon className="h-4 w-4 mr-1" />
        Dashboard
      </Button>
    </Link>
  );
};
