import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { transactionTreatmentSchema } from "@/lib/definitions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { TreatTransactionAction } from "../actions";

interface TreatCategoryDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  transactionId: string;
}

type transactionTreatmentValues = z.infer<typeof transactionTreatmentSchema>;

const TreatTransactionDialog = async ({
  transactionId,
  open,
  setOpen,
}: TreatCategoryDialogProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm<transactionTreatmentValues>({
    resolver: zodResolver(transactionTreatmentSchema),
    defaultValues: {
      id: transactionId,
      decision: "PENDING",
      rejectionReason: "",
    },
  });

  const onSubmit = (formData: transactionTreatmentValues) => {
    startTransition(() => {
      TreatTransactionAction(formData).then((data) => {
        toast.error(data.error);
        toast.success(data.success);
      });
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Traiter la transaction </DialogTitle>
          <DialogDescription>
            Approuvez ou rejetez la transaction
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="decision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de transaction</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DEPOSIT">Dépôt</SelectItem>
                        <SelectItem value="WITHDRAWAL">Retrait</SelectItem>
                        <SelectItem value="TRANSFER">Transfert</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </DialogContent>
        <DialogFooter>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              "Traiter la transaction"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TreatTransactionDialog;
