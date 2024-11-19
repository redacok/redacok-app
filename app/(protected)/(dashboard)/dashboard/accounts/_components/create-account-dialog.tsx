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
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { BankAccount } from "@/lib/bank-account";
import bankStore from "@/store/bank-store";

const accountSchema = z.object({
  accountType: z.enum(["epargne", "courant", "business"]),
  currency: z.enum(["XAF", "EUR", "USD"]).default("XAF"),
  initialDeposit: z.coerce
    .number()
    .min(1000, "Le dépôt initial doit être d'au moins 1000 XAF"),
});

type AccountFormValues = z.infer<typeof accountSchema>;

export function CreateAccountDialog({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const lastUpdate = bankStore((state) => state.lastUpdate);
  const invalidateData = bankStore((state) => state.invalidateData);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      accountType: "epargne",
      currency: user.currency as "XAF" | "EUR" | "USD" | undefined,
      initialDeposit: 3000,
    },
  });

  const onSubmit = async (data: AccountFormValues) => {
    try {
      setLoading(true);
      const response = await axios.post("/api/accounts", data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create account");
      }

      toast.success("Compte créé avec succès");
      invalidateData();
      setOpen(false);
      form.reset();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            "Erreur lors de la création du compte"
        );
      } else {
        toast.error("Erreur lors de la création du compte");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get("/api/accounts");
        setAccounts(response.data);
      } catch (error) {
        toast.error("Erreur lors de la récupération des comptes");
      }
    };
    fetchAccounts();
  }, [lastUpdate]);

  const availableAccountTypes = ["epargne", "courant", "business"].filter(
    (type) => !accounts.some((account) => account.type === type)
  );

  if (availableAccountTypes.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Nouveau Compte</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer un Compte</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour créer un nouveau compte
            bancaire.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="accountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de compte</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type de compte" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableAccountTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type === "epargne" && "Compte Épargne"}
                          {type === "courant" && "Compte Courant"}
                          {type === "business" && "Compte Professionnel"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Devise</FormLabel>
                  <Select
                    disabled
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner la devise" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="XAF">XAF (FCFA)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="initialDeposit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dépoto initial (min. 3000 XAF)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={3000}
                      step={100}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="Montant du dépoto initial"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  "Créer le compte"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
