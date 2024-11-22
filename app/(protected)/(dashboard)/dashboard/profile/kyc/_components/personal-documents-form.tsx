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
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { getKycAction } from "../../switch-personal-account/actions";
import { submitDocuments } from "../actions";

const formSchema = z.object({
  niu: z.string().min(1, "Le NIU est requis"),
  idPicture: z.string().min(1, "La photo d'identité est requise"),
  idOnHand: z.string().min(1, "La photo avec le document en main est requise"),
  entirePhoto: z.string().min(1, "La photo entière est requise"),
  locationPlan: z.string().min(1, "Le plan de localisation est requis"),
});

interface DocumentsFormProps {
  kycId: string;
  onSuccess: (kycId: string) => void;
}

export function PersonalDocumentsForm({
  kycId,
  onSuccess,
}: DocumentsFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      niu: "",
      idPicture: "",
      idOnHand: "",
      entirePhoto: "",
      locationPlan: "",
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
        const result = await submitDocuments(kycExist.id, values);
        if (result.error) {
          toast.error(result.error);
        } else if (result.success) {
          toast.success("Documents soumis avec succès");
          onSuccess(kycId);
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
            name="niu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIU (Numéro d&apos;Identification Unique)</FormLabel>
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
            name="idPicture"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Photo du document d&apos;identité</FormLabel>
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

          <FormField
            control={form.control}
            name="idOnHand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Photo avec le document en main</FormLabel>
                <FormControl>
                  <FileUpload
                    endpoint="documentUpload"
                    value={field.value}
                    onChange={field.onChange}
                    name="Pièce avec le document en main"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="entirePhoto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Photo entière</FormLabel>
                <FormControl>
                  <FileUpload
                    endpoint="documentUpload"
                    value={field.value}
                    onChange={field.onChange}
                    name="Photo entière"
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
                <FormLabel>Plan de localisation</FormLabel>
                <FormControl>
                  <FileUpload
                    endpoint="documentUpload"
                    value={field.value}
                    onChange={field.onChange}
                    name="Plan de localisation"
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
