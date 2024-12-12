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
import { Check, MoreHorizontal, Trash2Icon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
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

  const { data: session } = useSession();

  return (
    <>
      <DeleteTransactionDialog
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
        transactionId={transaction.id}
      />
      <TreatTransactionDialog
        open={showTreatmentDialog}
        setOpen={setShowDeleteDialog}
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
          <DropdownMenuItem
            className="flex items-center gap-2"
            onSelect={() => {
              setShowTreatmentDialog((prev) => !prev);
            }}
          >
            <Check />
            Traiter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default RowActions;
