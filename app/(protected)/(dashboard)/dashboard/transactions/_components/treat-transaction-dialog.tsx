import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Input } from "@/components/ui/input";
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
import { startTransition, useEffect, useState } from "react";
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

const TreatTransactionDialog = ({
  transactionId,
  open,
  setOpen,
}: TreatCategoryDialogProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showRejectionReason, setShowRejectionReason] =
    useState<boolean>(false);

  const form = useForm<transactionTreatmentValues>({
    resolver: zodResolver(transactionTreatmentSchema),
    defaultValues: {
      id: transactionId,
      decision: "PENDING",
      rejectionReason: "",
    },
  });

  useEffect(() => {
    if (form.watch("decision") === "REJECTED") {
      setShowRejectionReason(true);
    } else {
      setShowRejectionReason(false);
    }
  }, [form.watch("decision")]);

  const onSubmit = (formData: transactionTreatmentValues) => {
    setLoading(true);
    startTransition(() => {
      TreatTransactionAction(formData).then((data) => {
        toast.error(data.error);
        toast.success(data.success);
        setLoading(false);
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="decision"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choisissez une action à effectuer</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Action..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="COMPLETED">Valider</SelectItem>
                      <SelectItem value="REJECTED">Rejeter</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  {showRejectionReason && (
                    <FormField
                      control={form.control}
                      name="rejectionReason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Raison du rejet</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Entrez la raison..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </FormItem>
              )}
            />
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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TreatTransactionDialog;
