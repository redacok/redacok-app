"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { toast } from "sonner";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

const feeRangeSchema = z.object({
  minAmount: z.number().min(0),
  maxAmount: z.number().min(0),
  feePercentage: z.number().min(0).max(100),
  fixedFee: z.number().min(0),
  minFee: z.number().min(0),
  maxFee: z.number().min(0),
});

type FeeRangeFormValues = z.infer<typeof feeRangeSchema>;

export function FeeRangeForm() {
  const [loading, setLoading] = useState(false);

  const form = useForm<FeeRangeFormValues>({
    resolver: zodResolver(feeRangeSchema),
    defaultValues: {
      minAmount: 0,
      maxAmount: 0,
      feePercentage: 0,
      fixedFee: 0,
      minFee: 0,
      maxFee: 0,
    },
  });

  async function onSubmit(data: FeeRangeFormValues) {
    try {
      setLoading(true);
      
      // Create new fee range
      await fetch("/api/admin/fee-ranges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      toast.success("Fee range added successfully");
      form.reset();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="feePercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fee Percentage (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fixedFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fixed Fee</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Fee</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Fee</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={loading}>
              Add Fee Range
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
