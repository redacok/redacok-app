import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/file-upload";
import { useKYCStore } from "@/store/kyc-steps-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { getKycAction } from "../../switch-personal-account/actions";
import { submitBusinessDocuments } from "../actions";

const formSchema = z.object({
  founderDocument: z
    .string()
    .min(1, "Les documents du fondateur ou d'un investisseur sont requis"),
  organisationDocument: z
    .string()
    .min(1, "Les documents de l'entreprise sont requis"),
});
interface DocumentsFormProps {
  kycId: string;
  onSuccess: (id: string) => void;
}

export function BusinessDocumentsForm({ onSuccess }: DocumentsFormProps) {
  const [isPending, startTransition] = useTransition();
  const { setStep } = useKYCStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      founderDocument: "",
      organisationDocument: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const kycExist = await getKycAction();
      if (!kycExist) {
        toast.error(
          "Vous devez d'abord renseigner vos informations personnelles"
        );
        return;
      }
      try {
        const result = await submitBusinessDocuments(kycExist.id, values);
        if (result.error) {
          toast.error(result.error);
        } else if (result.success) {
          toast.success("Documents soumis avec succès");
          onSuccess(kycExist.id);
          setStep("finish");
        }
      } catch (error) {
        console.error("something whent wrong", error);
        toast.error("Une erreur est survenue");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="founderDocument"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Pièces d&apos;identité du fondateur (En 1 PDF))
                </FormLabel>
                <FormControl>
                  <FileUpload
                    endpoint="documentUpload"
                    value={field.value}
                    onChange={field.onChange}
                    name="Pièce NIU"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="organisationDocument"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Documents de l&apos;entreprise</FormLabel>
                <FormControl>
                  <FileUpload
                    endpoint="documentUpload"
                    value={field.value}
                    onChange={field.onChange}
                    name="Pièce d'identité"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Envoi en cours..." : "Soumettre les documents"}
        </Button>
      </form>
    </Form>
  );
}
