import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Country } from "@prisma/client";
import { User } from "next-auth";
import Link from "next/link";

const accountFeatures = [
  {
    type: "USER",
    features: [],
  },
  {
    type: "PERSONAL",
    features: [
      "⭐ Demander un crédit à 10% d'interêt",
      "⭐ Fonctionnalité 2",
      "⭐ Troisième fonctionnalité du type de compte",
    ],
  },
  {
    type: "BUSINESS",
    features: [
      "⭐ Demander un crédit à 10% d'interêt",
      "⭐ Fonctionnalité 2",
      "⭐ Troisième fonctionnalité du type de compte",
    ],
  },
  {
    type: "COMMERCIAL",
    features: [
      "⭐ Demander un crédit à 10% d'interêt",
      "⭐ Fonctionnalité 2",
      "⭐ Troisième fonctionnalité du type de compte",
    ],
  },
  {
    type: "ADMIN",
    features: [
      "⭐ Supervider tous les Utilisateurs",
      "⭐ Avoir un droit de regard sur toutes les opérations",
      "⭐ Valider ou nom le passage d'un compte a l'autre",
      "⭐ Ajouter un nouvel administrateur",
    ],
  },
];

export const AccountType = ({
  session,
}: {
  session: { role: string; phone: string; country: Country } & User;
}) => {
  return (
    <div className="flex flex-col gap-4">
      {session.role === "USER" ? (
        <div>
          <p>
            Vous possédez actuellement un compte{" "}
            <span className="font-semibold">Ordinaire</span>
          </p>
        </div>
      ) : session.role === "PERSONAL" ? (
        <div>
          <p>
            Vous possédez actuellement un compte{" "}
            <span className="font-semibold">Personnel</span>
          </p>
        </div>
      ) : session.role === "BUSINESS" ? (
        <div>
          <p>
            Vous possédez actuellement un compte{" "}
            <span className="font-semibold">Business</span>
          </p>
        </div>
      ) : session.role === "COMMERCIAL" ? (
        <div>
          <p>
            Vous possédez actuellement un compte{" "}
            <span className="font-semibold">Commercial</span>
          </p>
        </div>
      ) : (
        <div>
          <p>
            Vous possédez actuellement un compte{" "}
            <span className="font-semibold">Administrateur</span>
          </p>
        </div>
      )}
      {session.role !== "USER" && (
        <>
          <p>Ce type de compte vous offre les fonctionnalités suivantes: </p>
          <ul>
            {accountFeatures.map((account) =>
              account.type === session.role
                ? account.features.map((feature, index) => (
                    <li className="ml-3" key={index}>
                      {feature}
                    </li>
                  ))
                : null
            )}
          </ul>
        </>
      )}
      {session.role !== "ADMIN" && session.role !== "COMMERCIAL" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-fit">Vérification Intermédiaire</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            <DropdownMenuLabel>Changer de type de compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/dashboard/profile/switch-personal-account">
                Passer à compte personnel
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/dashboard/profile/switch-business-account">
                Passer à compte Business
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
