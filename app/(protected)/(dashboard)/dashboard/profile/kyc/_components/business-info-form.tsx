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
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { submitBusinessInfo } from "../actions";

const formSchema = z.object({
  orgName: z
    .string()
    .min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
});

interface BusinessInfoFormProps {
  kycId: string;
  onSuccess: (kycId: string) => void;
}

export function BusinessInfoForm({ kycId, onSuccess }: BusinessInfoFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orgName: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const result = await submitBusinessInfo(kycId, values);
        if (result.error) {
          toast.error(result.error);
        } else if (result.success) {
          toast.success("Informations de l'entreprise soumises avec succès");
          onSuccess(kycId);
        }
      } catch (error) {
        toast.error("Une erreur est survenue");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="orgName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de l&apos;entreprise</FormLabel>
              <FormControl>
                <Input {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Envoi en cours..." : "Finaliser la soumission"}
        </Button>
      </form>
    </Form>
  );
}
