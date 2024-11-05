import { Button } from "@/components/ui/button";
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
      "Demander un crédit à 10% d'interêt",
      "Fonctionnalité 2",
      "Troisième fonctionnalité du type de compte",
    ],
  },
  {
    type: "BUSINESS",
    features: [
      "Demander un crédit à 10% d'interêt",
      "Fonctionnalité 2",
      "Troisième fonctionnalité du type de compte",
    ],
  },
  {
    type: "COMMERCIAL",
    features: [
      "Demander un crédit à 10% d'interêt",
      "Fonctionnalité 2",
      "Troisième fonctionnalité du type de compte",
    ],
  },
  {
    type: "ADMIN",
    features: [
      "Supervider tous les Utilisateurs",
      "Avoir un droit de regard sur toutes les opérations",
      "Valider ou nom le passage d'un compte a l'autre",
      "Ajouter un nouvel administrateur",
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
      ) : (
        <div></div>
      )}
      {session.role !== "USER" && (
        <>
          <p>Ce type de compte vous offre les fonctionnalités suivantes: </p>
          <ul>
            {accountFeatures.map((account) =>
              account.type === session.role
                ? account.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))
                : null
            )}
          </ul>
        </>
      )}
      <Link href="/dashboard/profile/switch-account">
        <Button>Vérification Intermédiaire</Button>
      </Link>
    </div>
  );
};
