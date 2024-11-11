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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { businessType } from "@/constants";
import { businessVerificationSchema } from "@/lib/definitions";
import { cn } from "@/lib/utils";
import addDocumentStore from "@/store/add-document-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Kyc, Organisation } from "@prisma/client";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { FcDocument } from "react-icons/fc";
import { toast } from "sonner";
import * as z from "zod";
import { BusinessVerificationAction } from "../actions";

export const KycBusinessInfo = ({
  kyc,
  organisation,
}: {
  kyc: Kyc;
  organisation: Organisation;
}) => {
  const [isPending, startTransition] = useTransition();
  const { addDocument, toggle } = addDocumentStore();
  const [next, setNext] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof businessVerificationSchema>>({
    resolver: zodResolver(businessVerificationSchema),
    defaultValues: {
      kycId: kyc?.id ?? undefined,
      orgId: organisation?.id ?? undefined,
      orgName: organisation?.name ?? undefined,
      type: organisation?.type ?? undefined,
      name: kyc?.name ?? "",
      surname: kyc?.surname ?? "",
    },
  });

  console.log("le kyc ici des données: ", kyc);

  const onSubmit = async (
    formData: z.infer<typeof businessVerificationSchema>
  ) => {
    startTransition(async () => {
      BusinessVerificationAction(formData).then((data) => {
        if (data.success) {
          toast.success(data.success);
          setNext(true);
          router.refresh();
        }
        if (data.error) toast.error(data.error);
      });
    });
  };

  return (
    <div className="w-full space-y-4">
      <Form {...form}>
        <h1 className="font-semibold text-xl my-4">
          Informations personnelles
        </h1>
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sélectionnez le type de votre entreprise</FormLabel>
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
                    {businessType.map((business, index) => (
                      <SelectItem key={index} value={business.type}>
                        {business.label}
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
            name="orgName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de la structure</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    placeholder="Ex: Democam SARL"
                  />
                </FormControl>
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
      {next && (
        <Button
          className={cn(
            "w-full transition-all md:hidden",
            !addDocument && "bg-white text-slate-900 hover:text-white"
          )}
          onClick={() => !addDocument && toggle()}
        >
          <FcDocument />
          Passer aux fichiers d&apos;identification
        </Button>
      )}
    </div>
  );
};
