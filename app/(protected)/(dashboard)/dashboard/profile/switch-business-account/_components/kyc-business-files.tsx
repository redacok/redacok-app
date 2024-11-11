"use client";

import BusinessFileInput from "@/components/business-file-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { businessVerificationFileSchema } from "@/lib/definitions";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { LoaderCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { getKycAction } from "../../switch-personal-account/actions";
import { businessVerificationFileAction } from "../actions";

export const KycBusinessFiles = () => {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof businessVerificationFileSchema>>({
    resolver: zodResolver(businessVerificationFileSchema),
    defaultValues: {
      organisationDocument: undefined,
      investorDocument: undefined,
      founderDocument: undefined,
    },
  });

  const onSubmit = async (
    formData: z.infer<typeof businessVerificationFileSchema>
  ) => {
    const kycExist = await getKycAction("business");
    if (!kycExist) {
      toast.error(
        "Vous devez d'abord renseigner vos informations personnelles"
      );
      return;
    }

    const { organisationDocument, investorDocument, founderDocument } =
      formData;
    const files = [
      organisationDocument,
      investorDocument,
      founderDocument,
    ].filter((file): file is File => file !== undefined);
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
              fileData.append("fileUrl", data.imgUrl);
              fileData.append(
                "field",
                index === 1
                  ? "organisationDocument"
                  : index === 2
                  ? "investorDocument"
                  : "founderDocument"
              );
              console.log(fileData.get("kycId"));
              console.log(fileData.get("fileType"));
              console.log(fileData.get("fileName"));
              console.log(fileData.get("imgUrl"));
              console.log(fileData.get("field"));

              businessVerificationFileAction(fileData).then((data) => {
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
        <BusinessFileInput
          form={form}
          name="organisationDocument"
          label="Documents de l'entreprise (en 1 PDF)"
        />
        <BusinessFileInput
          form={form}
          name="founderDocument"
          label="Documents du fondateur de la structure (en 1 PDF)"
        />
        <BusinessFileInput
          form={form}
          name="investorDocument"
          label="Documents d'un investisseur de la structure (en 1 PDF)"
        />

        <Button type="submit" className="w-full gap-x-2" disabled={isPending}>
          {isPending && <LoaderCircle className="size-5 animate-spin" />}
          Mettre à jour mes documents
        </Button>
      </form>
    </Form>
  );
};
