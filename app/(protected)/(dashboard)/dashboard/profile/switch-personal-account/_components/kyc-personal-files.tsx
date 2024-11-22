"use client";

import PersonalFileInput from "@/components/personal-file-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
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
      niu: undefined,
      idPicture: undefined,
      idOnHand: undefined,
      entirePhoto: undefined,
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

    const { niu, idPicture, idOnHand, locationPlan, entirePhoto } = formData;
    const files = [
      { file: niu, field: "niu" },
      { file: idPicture, field: "idPicture" },
      { file: idOnHand, field: "idOnHand" },
      { file: locationPlan, field: "locationPlan" },
      { file: entirePhoto, field: "entirePhoto" },
    ];
    startTransition(async () => {
      await Promise.all(
        files.map(async (file) => {
          const fileData = new FormData();
          fileData.append("file", file.file as File);

          await axios
            .post(`https://redacok.laclass.dev/api/upload`, fileData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })
            .then(async (response) => {
              const data = response.data;
              fileData.append("kycId", kycExist.id);
              fileData.append("fileType", file.file.type);
              fileData.append("fileName", file.file.name);
              fileData.append("fileUrl", data.fileUrl);
              fileData.append("field", file.field);

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
        <PersonalFileInput
          label="Photo Recto/Verso de votre pièce d'identité"
          name="idPicture"
          form={form}
        />
        <PersonalFileInput
          label="Photo de votre Numéro d'identification unique"
          name="niu"
          form={form}
        />
        <PersonalFileInput
          label="Photo de vous, tenant votre pièce d'identité face caméra"
          name="idOnHand"
          form={form}
        />
        <PersonalFileInput
          label="Photo Entière de vous"
          name="locationPlan"
          form={form}
        />
        <PersonalFileInput
          label="Plan de localisation"
          name="locationPlan"
          form={form}
        />
        <Button type="submit" className="w-full gap-x-2" disabled={isPending}>
          {isPending && <LoaderCircle className="size-5 animate-spin" />}
          Mettre à jour mes documents
        </Button>
      </form>
    </Form>
  );
};
