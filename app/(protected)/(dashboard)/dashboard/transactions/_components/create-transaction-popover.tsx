"use client";

import { Button } from "@/components/ui/button";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// const MIN_BALANCE = 1000; // 1000 XAF minimum balance

const transactionSchema = z.object({
  type: z.enum(["deposit", "withdrawal", "transfer"]),
  amount: z.number().min(1),
  fromAccount: z.string().optional(),
  toAccount: z.string().optional(),
  description: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export function CreateTransactionPopover() {
  const [open, setOpen] = useState(false);
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "deposit",
      amount: undefined,
      description: "",
    },
  });

  const onSubmit = async (data: TransactionFormValues) => {
    try {
      const response = await axios.post("/api/transactions", data);

      if (!response.data.success) {
        throw new Error("Failed to create transaction");
      }

      toast.success("Transaction créée avec succès");
      if (data.type !== "deposit") {
        toast.info(
          "La transaction sera traitée après approbation d'un administrateur"
        );
      }
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
    }
  };

  const transactionType = form.watch("type");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button>Nouvelle Transaction</Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="space-y-4 p-4">
          <h4 className="font-medium leading-none">Créer une Transaction</h4>
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
                        <SelectItem value="deposit">Dépôt</SelectItem>
                        <SelectItem value="withdrawal">Retrait</SelectItem>
                        <SelectItem value="transfer">Transfert</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {transactionType === "transfer" && (
                <>
                  <FormField
                    control={form.control}
                    name="fromAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compte source</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Sélectionner le compte source"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="toAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compte destination</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Sélectionner le compte destination"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Description de la transaction"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Créer la transaction
              </Button>
            </form>
          </Form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
