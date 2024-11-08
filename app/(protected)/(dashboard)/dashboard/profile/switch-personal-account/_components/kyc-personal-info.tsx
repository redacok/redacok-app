"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { idTypes } from "@/constants";
import { personnalVerificationSchema } from "@/lib/definitions";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Kyc } from "@prisma/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, LoaderCircle } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { personnalVerificationAction } from "../actions";

export const KycPersonalInfo = ({ kyc }: { kyc: Kyc }) => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof personnalVerificationSchema>>({
    resolver: zodResolver(personnalVerificationSchema),
    defaultValues: {
      id: kyc?.id ?? undefined,
      name: kyc?.name ?? "",
      surname: kyc?.surname ?? "",
      idType: kyc?.idType ?? "",
      idNumber: kyc?.idNumber ?? "",
      idExpires: kyc?.idExpires ? kyc.idExpires.toISOString() : "",
    },
  });

  console.log("le kyc ici des données: ", kyc);

  const onSubmit = async (
    formData: z.infer<typeof personnalVerificationSchema>
  ) => {
    startTransition(async () => {
      personnalVerificationAction(formData).then((data) => {
        if (data.success) toast.success(data.success);
        if (data.error) toast.error(data.error);
      });
    });
  };

  return (
    <Form {...form}>
      <h1 className="font-semibold text-xl my-4">Informations personnelles</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom(s) de famille</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="Ex: Dongmo"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="surname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prénom(s)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="Ex: Landry"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="idType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sélectionnez votre pièce d&apos;identité</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez votre pièce d'identité" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {idTypes.map((idType, index) => (
                    <SelectItem key={index} value={idType.type}>
                      {idType.label}
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
          name="idNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numéro de la pièce d&apos;identité</FormLabel>
              <FormControl>
                <Input {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="idExpires"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel>
                Date d&apos;expiration de la pièce d&apos;identité
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: fr })
                      ) : (
                        <span>Sélectionnez une date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) =>
                      date && field.onChange(date.toISOString())
                    }
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full gap-x-2" disabled={isPending}>
          {isPending && <LoaderCircle className="size-5 animate-spin" />}
          Mettre à jour mes infos
        </Button>
      </form>
    </Form>
  );
};
