"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useDebounce } from "@/hooks/use-debounce";
import { BankAccount } from "@/lib/bank-account";
import { calculateTransactionFee } from "@/lib/calculate-transaction-fee";
import bankStore from "@/store/bank-store";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// const MIN_BALANCE = 1000; // 1000 XAF minimum balance
const RIB_LENGTH = 23; // Longueur standard d'un RIB

interface RecipientInfo {
  accountId: string;
  accountName: string;
  userName: string;
}

const transactionSchema = z.object({
  type: z.enum(["DEPOSIT", "WITHDRAWAL"]),
  amount: z.coerce.number().min(1),
  fee: z.number().default(0),
  clientAccount: z.string().min(8, {
    message: "Veuillez renseigner le RIB du client",
  }),
  account: z.string({ message: "Veuillez entrer un montant" }),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export function CreateClientTransactionDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userAccounts, setUserAccounts] = useState<BankAccount[]>([]);
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo | null>(
    null
  );
  const [loadingRecipient, setLoadingRecipient] = useState(false);
  const [loadingFee, setLoadingFee] = useState(false);
  const invalidateData = bankStore((state) => state.invalidateData);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "DEPOSIT",
      amount: undefined,
      fee: 0,
      account: "",
    },
  });

  // Récupérer les comptes de l'utilisateur
  useEffect(() => {
    const fetchUserAccounts = async () => {
      try {
        const response = await axios.get("/api/accounts");
        setUserAccounts(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Erreur lors de la récupération de vos comptes");
      }
    };
    fetchUserAccounts();
  }, []);

  // Rechercher le destinataire lorsque le RIB est saisi
  const debouncedRib = useDebounce(form.watch("clientAccount"), 500);
  useEffect(() => {
    const validateRib = async () => {
      if (debouncedRib?.length === RIB_LENGTH) {
        setLoadingRecipient(true);
        try {
          const response = await axios.get(
            `/api/accounts/validate-rib/${debouncedRib}`
          );
          if (response.data.success) {
            setRecipientInfo(response.data.recipient);
            toast.success(`Compte trouvé: ${response.data.recipient.userName}`);
          } else {
            setRecipientInfo(null);
          }
        } catch (error) {
          setRecipientInfo(null);
          if (axios.isAxiosError(error)) {
            toast.error(error.response?.data?.message || "RIB invalide");
          }
        } finally {
          setLoadingRecipient(false);
        }
      } else {
        setRecipientInfo(null);
      }
    };
    validateRib();

    // if (form.watch("type") === "TRANSFER") {
    //   validateRib();
    // }
  }, [debouncedRib, form]);

  // Calculer les frais en fonction du montant
  const amount = form.watch("amount");
  const transactionType = form.watch("type");
  useEffect(() => {
    if (amount) {
      setLoadingFee(true);
      const updateFee = async () => {
        const fee = await calculateTransactionFee(amount, transactionType);
        form.setValue("fee", fee.fee);
      };
      updateFee();
      setLoadingFee(false);
    }
  }, [amount, transactionType, form]);

  const onSubmit = async (data: TransactionFormValues) => {
    try {
      setLoading(true);
      if (userAccounts[0]?.status !== "ACTIVE")
        return toast.error(
          "Votre compte est suspendu ou bloqué, veuillez contacter un administrateur"
        );

      const response = await axios.post("/api/transactions/commercial", data);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to create transaction"
        );
      }

      toast.success("Transaction créée avec succès");
      invalidateData();
      setOpen(false);
      form.reset();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            "Erreur lors de la création de la transaction"
        );
      } else {
        toast.error("Erreur lors de la création de la transaction");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Nouveau dépot/retrait</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer une Transaction</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour créer une nouvelle
            transaction.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
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
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="account"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="hidden"
                      value={userAccounts[0]?.id}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientAccount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro du client</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        {...field}
                        placeholder="Entrez le RIB du destinataire"
                        maxLength={RIB_LENGTH}
                      />
                      {loadingRecipient && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Recherche du compte...
                        </div>
                      )}
                      {recipientInfo && (
                        <div className="rounded-md border p-3 text-sm border-sky-100 bg-sky-100/50">
                          <p className="font-medium">
                            {recipientInfo.userName}
                          </p>
                          <p className="text-muted-foreground">
                            {recipientInfo.accountName}
                          </p>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant (XAF)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="Entrer le montant"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frais de transaction</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value}
                      disabled
                    />
                  </FormControl>
                  <p className="p-2 bg-yellow-50 rounded-lg">
                    {loadingFee ? (
                      "Calcul du montant total"
                    ) : (
                      <>
                        Montant total :{" "}
                        <span>
                          {amount > 1000 &&
                            form.getValues("amount") + form.getValues("fee")}
                        </span>
                      </>
                    )}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                disabled={loading || loadingRecipient || loadingFee}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  "Créer la transaction"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
