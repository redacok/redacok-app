import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export const VerificationState = () => {
  return (
    <div className="container flex w-full h-full py-10 my-auto flex-col items-center justify-between gap-4">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Etat de vérification</CardTitle>
          <CardDescription>
            Votre vérification est en cours de traitement. Vous serez notifié
            une fois celle-ci traitée
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/profile">
            <Button>Revenir en arrière</Button>
          </Link>
        </CardContent>
      </Card>
      <div className="mt-8">
        <Logo />
      </div>
    </div>
  );
};
