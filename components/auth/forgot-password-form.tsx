"use client";

import * as z from "zod";

import { ForgotPasswordAction } from "@/app/(auth)/forgot-password/actions";
import { ForgotPasswordSchema } from "@/lib/definitions";
import useNumberSignin from "@/store/sign-in-form-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { Suspense, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { CardWrapper } from "./card-wrapper";

export const ForgotPassword = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const { setIsNumberSignin } = useNumberSignin();

  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (formData: z.infer<typeof ForgotPasswordSchema>) => {
    startTransition(() => {
      ForgotPasswordAction(formData).then((data) => {
        setError(data?.error);
        setSuccess(data?.success);
        // TODO: Add when we add 2FA
      });
    });
  };

  return (
    <CardWrapper
      headerLabel="Mot de passe oublié"
      BackButtonLabel="Retour a la page de connexion"
      backButtonHref="/sign-in"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="flex w-full">
              <Button
                size={"sm"}
                variant="link"
                onClick={() => setIsNumberSignin()}
                className="ml-auto"
              >
                Utiliser mon Numéro
              </Button>
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="Ex: john@example.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button type="submit" className="w-full gap-x-2" disabled={isPending}>
            {isPending && <LoaderCircle className="size-5 animate-spin" />}
            Connexion
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export const ForgotPasswordForm = () => {
  return (
    <Suspense>
      <ForgotPassword />
    </Suspense>
  );
};
