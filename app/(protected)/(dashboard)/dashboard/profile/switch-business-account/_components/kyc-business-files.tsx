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
import {
  getKycAction,
  getKycOrganisationAction,
} from "../../switch-personal-account/actions";
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

    const existOrg = await getKycOrganisationAction(kycExist);
    if (!existOrg) {
      toast.error("Une erreur inatendue s'est prosuite");
      return;
    }

    const { organisationDocument, investorDocument, founderDocument } =
      formData;
    const files = [
      { file: organisationDocument, field: "organisationDocument" },
      { file: investorDocument, field: "investorDocument" },
      { file: founderDocument, field: "founderDocument" },
    ].filter(
      (doc): doc is { file: File; field: string } => doc.file !== undefined
    );

    startTransition(async () => {
      await Promise.all(
        files.map(async (file) => {
          const fileData = new FormData();
          fileData.append("file", file.file);

          await axios
            .post(`https://redacok.laclass.dev/api/upload`, fileData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })
            .then(async (response) => {
              const data = response.data;
              fileData.append("kycId", kycExist.id);
              fileData.append("organisationId", existOrg.id);
              fileData.append("fileType", file.file.type);
              fileData.append("fileName", file.file.name);
              fileData.append("fileUrl", data.fileUrl);
              fileData.append("field", file.field);

              businessVerificationFileAction(fileData).then((data) => {
                if (data.success) toast.success(data.success);
                if (data.error) toast.error(data.error);
              });
            })
            .catch((err) => {
              console.log("erreur cloudinary ", err);
            });
        })
      );
      redirect("/dashboard/profile/switch-business-account");
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
