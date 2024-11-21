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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { submitDocuments } from "../actions";
import { useTransition } from "react";
import { toast } from "sonner";
import { FileUpload } from "@/components/file-upload";

const formSchema = z.object({
  niu: z.string().min(1, "Le NIU est requis"),
  idPicture: z.string().min(1, "La photo d'identité est requise"),
  idOnHand: z.string().min(1, "La photo avec le document en main est requise"),
  entirePhoto: z.string().min(1, "La photo entière est requise"),
  locationPlan: z.string().min(1, "Le plan de localisation est requis"),
});

interface DocumentsFormProps {
  kycId: string;
  onSuccess: () => void;
}

export function DocumentsForm({ kycId, onSuccess }: DocumentsFormProps) {
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
      try {
        const result = await submitDocuments(kycId, values);
        if (result.error) {
          toast.error(result.error);
        } else if (result.success) {
          toast.success("Documents soumis avec succès");
          onSuccess();
        }
      } catch (error) {
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
