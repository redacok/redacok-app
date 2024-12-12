import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DeleteTransaction } from "../actions";

interface TreatCategoryDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  transactionId: string;
}

const TreatTransactionDialog = async ({
  transactionId,
  open,
  setOpen,
}: TreatCategoryDialogProps) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: DeleteTransaction,
    onSuccess: async () => {
      toast.success("Transaction supprimée", {
        id: transactionId,
      });

      await queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });
    },
    onError: () => {
      toast.error("Une erreur est survenue, veuillez réessayer plus tard", {
        id: transactionId,
      });
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes vous vraiment sûre ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible, et supprimera définitivement la
            transaction
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              toast.loading("Suppression en cours...", {
                id: transactionId,
              });
              deleteMutation.mutate(transactionId);
            }}
          >
            Continuer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TreatTransactionDialog;
