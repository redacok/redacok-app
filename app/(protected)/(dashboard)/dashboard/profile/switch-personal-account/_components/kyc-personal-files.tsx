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
import { personnalVerificationFileSchema } from "@/lib/definitions";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { LoaderCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { getKycAction, personnalVerificationFileAction } from "../actions";

export const KycPersonalFiles = () => {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof personnalVerificationFileSchema>>({
    resolver: zodResolver(personnalVerificationFileSchema),
    defaultValues: {
      idPicture: undefined,
      NIU: undefined,
      idOnHand: undefined,
      locationPlan: undefined,
    },
  });

  const onSubmit = async (
    formData: z.infer<typeof personnalVerificationFileSchema>
  ) => {
    const kycExist = await getKycAction();
    if (!kycExist) {
      toast.error(
        "Vous devez d'abord renseigner vos informations personnelles"
      );
      return;
    }

    const { NIU, idPicture, idOnHand, locationPlan } = formData;
    const files = [NIU, idPicture, idOnHand, locationPlan];
    startTransition(async () => {
      await Promise.all(
        files.map(async (file: File, index) => {
          const fileData = new FormData();
          fileData.append("file", file);

          await axios
            .post(`https://redacok.laclass.dev/api/upload`, fileData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })
            .then(async (response) => {
              const data = response.data;
              fileData.append("kycId", kycExist.id);
              fileData.append("fileType", file.type);
              fileData.append("fileName", file.name);
              fileData.append("imgUrl", data.imgUrl);
              fileData.append(
                "field",
                index === 1
                  ? "niu"
                  : index === 2
                  ? "idPicture"
                  : index === 3
                  ? "idOnHand"
                  : "locationPlan"
              );
              console.log(fileData.get("kycId"));
              console.log(fileData.get("fileType"));
              console.log(fileData.get("fileName"));
              console.log(fileData.get("imgUrl"));
              console.log(fileData.get("field"));

              personnalVerificationFileAction(fileData).then((data) => {
                if (data.success) toast.success(data.success);
                if (data.error) toast.error(data.error);
              });
            })
            .catch((err) => {
              console.log("errue cloudinary", err);
            });
        })
      );
      redirect("/dashboard/profile/switch-personal-account");
    });
  };

  return (
    <Form {...form}>
      <h1 className="font-semibold text-xl my-4">
        Fichiers d&apos;identification
      </h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    field.onChange(e.target.files ? e.target.files[0] : null)
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
                    field.onChange(e.target.files ? e.target.files[0] : null)
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
                Photo de vous, tenant votre pièce d&apos;identité face caméra
              </FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) =>
                    field.onChange(e.target.files ? e.target.files[0] : null)
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
                    field.onChange(e.target.files ? e.target.files[0] : null)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full gap-x-2" disabled={isPending}>
          {isPending && <LoaderCircle className="size-5 animate-spin" />}
          Mettre à jour mes documents
        </Button>
      </form>
    </Form>
  );
};
