"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import * as z from "zod";

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
import { switchToPersonalAccountSchema } from "@/lib/definitions";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, LoaderCircle } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { SwitchToPersonalAccountAction } from "../actions";

export const SwitchAccountForm = () => {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof switchToPersonalAccountSchema>>({
    resolver: zodResolver(switchToPersonalAccountSchema),
    defaultValues: {
      name: "",
      surname: "",
      idType: "",
      idNumber: "",
      NIU: undefined,
      idPicture: undefined,
      idOnHand: undefined,
      locationPlan: undefined,
    },
  });

  const onSubmit = (
    formData: z.infer<typeof switchToPersonalAccountSchema>
  ) => {
    console.log(formData);

    const simpleData = new FormData();
    simpleData.append("name", formData.name as string);
    simpleData.append("surname", formData.surname as string);
    simpleData.append("idType", formData.idType as string);
    simpleData.append("idNumber", formData.idNumber as string);
    simpleData.append("idExpires", formData.idExpires as string);
    simpleData.append("NIU", formData.NIU as File);
    simpleData.append("idPicture", formData.idPicture as File);
    simpleData.append("idOnHand", formData.idOnHand as File);
    simpleData.append("locationPlan", formData.locationPlan as File);

    startTransition(() => {
      SwitchToPersonalAccountAction(simpleData).then((data) => {
        if (data.success) toast.success(data.success);
        if (data.error) toast.error(data.error);
      });
    });
  };

  return (
    <div className="max-w-[800px] w-full mx-auto mb-6 pb-6">
      <div className="flex justify-center pt-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full"
          >
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
                  <FormLabel>
                    Sélectionnez votre pièce d&apos;identité
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
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
            <FormField
              control={form.control}
              name="idPicture"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Photo Recto/Verso de votre pièce d&apos;identité
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      capture="environment"
                      onChange={(e) =>
                        field.onChange(
                          e.target.files ? e.target.files[0] : null
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="NIU"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Photo de votre Numéro d&apos;identification unique
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      capture="environment"
                      onChange={(e) =>
                        field.onChange(
                          e.target.files ? e.target.files[0] : null
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="idOnHand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Photo de vous, tenant votre pièce d&apos;identité face
                    caméra
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) =>
                        field.onChange(
                          e.target.files ? e.target.files[0] : null
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="locationPlan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo entière de vous</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      capture="environment"
                      onChange={(e) =>
                        field.onChange(
                          e.target.files ? e.target.files[0] : null
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full gap-x-2"
              disabled={isPending}
            >
              {isPending && <LoaderCircle className="size-5 animate-spin" />}
              Modifier mes infos
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};
