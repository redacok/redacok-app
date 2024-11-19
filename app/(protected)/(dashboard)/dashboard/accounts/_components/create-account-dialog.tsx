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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const accountSchema = z.object({
  accountType: z.enum(["epargne", "courant", "business"]),
  currency: z.enum(["XAF", "EUR", "USD"]).default("XAF"),
  initialDeposit: z.coerce
    .number()
    .min(1000, "Le dépôt initial doit être d'au moins 1000 XAF"),
});

type AccountFormValues = z.infer<typeof accountSchema>;

export async function CreateAccountDialog({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      accountType: "epargne",
      currency: user.currency as "XAF" | "EUR" | "USD" | undefined,
      initialDeposit: 1000,
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
                      <SelectItem value="epargne">Compte Épargne</SelectItem>
                      <SelectItem value="courant">Compte Courant</SelectItem>
                      <SelectItem value="business">
                        Compte Professionnel
                      </SelectItem>
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
                  <FormLabel>Dépôt initial (min. 1000 XAF)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="Montant du dépôt initial"
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
