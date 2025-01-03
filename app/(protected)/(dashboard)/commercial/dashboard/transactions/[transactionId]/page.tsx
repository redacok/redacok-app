import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { notFound } from "next/navigation";

async function getTransaction(transactionId: string) {
  try {
    const transaction = await db.transaction.findUnique({
      where: {
        id: transactionId,
      },
      include: {
        fromAccount: { include: { user: true } },
        toAccount: { include: { user: true } },
      },
    });

    if (!transaction) return null;
    return transaction;
  } catch (error) {
    console.log("[TRANSACTION_FETCH_ERROR]", error);
    return null;
  }
}

export default async function Transaction({
  params,
}: {
  params: { transactionId: string };
}) {
  const transaction = await getTransaction(params.transactionId);

  if (!transaction) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Détails de la transaction"
        description="Plus de détails sur la transaction"
        block={
          <Badge
            variant={
              transaction.status === "COMPLETED"
                ? "secondary"
                : transaction.status === "REJECTED"
                ? "destructive"
                : "default"
            }
          >
            {transaction.status === "COMPLETED"
              ? "Complétée"
              : transaction.status === "REJECTED"
              ? "Rejetée"
              : "En attente"}
          </Badge>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Informations de la transaction</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Montant</p>
              <p>{transaction.amount} XAF</p>
            </div>
            <div>
              <p className="font-semibold">Date</p>
              <p>
                {format(transaction.createdAt, "PPP 'à' HH:mm", {
                  locale: fr,
                })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Expéditeur</p>
              <p>{transaction.fromAccount!.user.email}</p>
            </div>
            <div>
              <p className="font-semibold">Destinataire</p>
              <p>{transaction.toAccount!.user.email}</p>
            </div>
          </div>

          {transaction.description && (
            <div>
              <p className="font-semibold">Description</p>
              <p>{transaction.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
