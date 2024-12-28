"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { TransactionType } from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  minAmount: z.coerce.number().min(0),
  maxAmount: z.coerce.number().min(0),
  feePercentage: z.coerce.number().min(0).max(100),
  fixedFee: z.coerce.number().min(0),
  minFee: z.coerce.number().min(0),
  maxFee: z.coerce.number().min(0),
  transactionType: z.enum(["DEPOSIT", "TRANSFER", "WITHDRAWAL"]),
});

type FormData = z.infer<typeof formSchema>;

interface FeeRange {
  id: string;
  minAmount: number;
  maxAmount: number;
  feePercentage: number;
  fixedFee: number;
  minFee: number;
  maxFee: number;
  transactionType: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  feeRange?: FeeRange | null;
}

export function FeeRangeDialog({
  open,
  onOpenChange,
  onSuccess,
  feeRange,
}: Props) {
  const isEditing = !!feeRange;
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      minAmount: 0,
      maxAmount: 0,
      feePercentage: 0,
      fixedFee: 0,
      minFee: 0,
      maxFee: 0,
      transactionType: "DEPOSIT",
    },
  });

  useEffect(() => {
    if (feeRange) {
      form.reset({
        minAmount: feeRange.minAmount,
        maxAmount: feeRange.maxAmount,
        feePercentage: feeRange.feePercentage,
        fixedFee: feeRange.fixedFee,
        minFee: feeRange.minFee,
        maxFee: feeRange.maxFee,
        transactionType: feeRange.transactionType as TransactionType,
      });
    } else {
      form.reset({
        minAmount: 0,
        maxAmount: 0,
        feePercentage: 0,
        fixedFee: 0,
        minFee: 0,
        maxFee: 0,
        transactionType: "DEPOSIT",
      });
    }
  }, [feeRange, form]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      const url = "/api/admin/fee-ranges";
      const method = isEditing ? "PUT" : "POST";
      const body = isEditing ? { ...data, id: feeRange.id } : data;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to save fee range");

      toast.success(isEditing ? "Fee range updated" : "Fee range created");
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Fee Range" : "Create Fee Range"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="minAmount">Min Amount</Label>
                <Input
                  id="minAmount"
                  type="number"
                  {...form.register("minAmount")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxAmount">Max Amount</Label>
                <Input
                  id="maxAmount"
                  type="number"
                  {...form.register("maxAmount")}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="feePercentage">Fee Percentage</Label>
              <Input
                id="feePercentage"
                type="number"
                step="0.01"
                {...form.register("feePercentage")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fixedFee">Fixed Fee</Label>
              <Input
                id="fixedFee"
                type="number"
                {...form.register("fixedFee")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="minFee">Min Fee</Label>
                <Input id="minFee" type="number" {...form.register("minFee")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxFee">Max Fee</Label>
                <Input id="maxFee" type="number" {...form.register("maxFee")} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="transactionType">Type de transaction</Label>
                <Select
                  value={form.watch("transactionType")}
                  onValueChange={(value) =>
                    form.setValue("transactionType", value as TransactionType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type de transaction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEPOSIT">Dépots</SelectItem>
                    <SelectItem value="TRANSFER">Transferts</SelectItem>
                    <SelectItem value="WITHDRAWAL">Retraits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
