"use client";

import * as z from "zod";

import { ResetPasswordAction } from "@/app/(auth)/forgot-password/verification/actions";
import { ResetPasswordSchema } from "@/lib/definitions";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormError } from "../form-error";
import PinInput from "../pin-input";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { CardWrapper } from "./card-wrapper";

export const PasswordVerification = () => {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const token = searchParams.get("token");
  if (!token) {
    setError("Token de vérification manquant");
  }

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      token: token ?? undefined,
      password: "",
    },
  });

  const onSubmit = (formData: z.infer<typeof ResetPasswordSchema>) => {
    startTransition(() => {
      ResetPasswordAction(formData).then((data) => {
        if (data.error) {
          setError(data?.error);
          toast.error(data?.error);
        }
        if (data.success) {
          toast.success(data?.success);
          router.push("/sign-in");
        }
      });
    });
  };

  return (
    <CardWrapper
      headerLabel="Réinitialiser le mot de passe"
      backButtonHref="/sign-in"
      BackButtonLabel="Revenir a la page de connexion"
    >
      <div className="flex items-center w-full justify-center">
        {!error && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <PinInput form={form} label="Code PIN" name="password" />
              </div>
              <Button
                type="submit"
                className="w-full gap-x-2"
                disabled={isPending}
              >
                {isPending && <LoaderCircle className="size-5 animate-spin" />}
                Réinitialiser mon mot de passe
              </Button>
            </form>
          </Form>
        )}
        <FormError message={error} />
      </div>
    </CardWrapper>
  );
};

export const PasswordVErificationForm = () => {
  return (
    <Suspense>
      <PasswordVerification />
    </Suspense>
  );
};
