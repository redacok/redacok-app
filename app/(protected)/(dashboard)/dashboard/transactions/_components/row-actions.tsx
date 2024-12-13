"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Computer, Loader2, MoreHorizontal, Trash2Icon } from "lucide-react";
import { Session } from "next-auth";
import { useEffect, useState } from "react";
import { getAuth } from "../actions";
import DeleteTransactionDialog from "./delete-transaction-dialog";
import { TransactionHistoryRow } from "./transaction-table";
import TreatTransactionDialog from "./treat-transaction-dialog";

const RowActions = ({
  transaction,
}: {
  transaction: TransactionHistoryRow;
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTreatmentDialog, setShowTreatmentDialog] = useState(false);
  const [session, setSession] = useState<Session | null | "nothing">("nothing");

  useEffect(() => {
    const fetchSession = async () => {
      const sessionData = await getAuth();
      setSession(sessionData);
    };

    fetchSession();
  }, []);

  if (session === "nothing")
    return (
      <div className="flex items-center justify-center p-2">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (
    (session?.user.id === transaction.user.id &&
      transaction.type !== "TRANSFER") ||
    transaction.status === "COMPLETED" ||
    transaction.status === "REJECTED"
  )
    return null;

  return (
    <>
      <DeleteTransactionDialog
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
        transactionId={transaction.id}
      />
      <TreatTransactionDialog
        open={showTreatmentDialog}
        setOpen={setShowTreatmentDialog}
        transactionId={transaction.id}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"ghost"} className="h-8 w-8 p-0">
            <span className="sr-only">Ouvrir le menu</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {session?.user?.role === "ADMIN" && (
            <DropdownMenuItem
              className="flex items-center gap-2"
              onSelect={() => {
                setShowDeleteDialog((prev) => !prev);
              }}
            >
              <Trash2Icon />
              Supprimer
            </DropdownMenuItem>
          )}
          {session?.user.role === "ADMIN" ||
            (session?.user.role === "COMMERCIAL" && (
              <DropdownMenuItem
                className="flex items-center gap-2"
                onSelect={() => {
                  setShowTreatmentDialog((prev) => !prev);
                }}
              >
                <Computer />
                Traiter
              </DropdownMenuItem>
            ))}
          {session?.user.id === transaction.user.id &&
            transaction.type === "TRANSFER" &&
            transaction.status === "PENDING" && (
              <DropdownMenuItem
                className="flex items-center gap-2"
                onSelect={() => {
                  setShowTreatmentDialog((prev) => !prev);
                }}
              >
                <Trash2Icon />
                Annuler
              </DropdownMenuItem>
            )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default RowActions;
