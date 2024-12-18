"use client";

import * as z from "zod";

import { signInAction } from "@/app/(auth)/sign-in/actions";
import { SignInSchema } from "@/lib/definitions";
import useNumberSignin from "@/store/sign-in-form-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
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

import PinInput from "../pin-input";
import { BackButton } from "./back-button";
import { CardWrapper } from "./card-wrapper";

const SignIn = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();

  const { setIsNumberSignin } = useNumberSignin();

  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Cet email est deja utilisé avec un autre service"
      : "";

  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (formData: z.infer<typeof SignInSchema>) => {
    startTransition(() => {
      signInAction(formData).then((data) => {
        setError(data?.error);
        setSuccess(data?.success);
        // TODO: Add when we add 2FA
      });
    });
  };

  return (
    <CardWrapper
      headerLabel="Ravi de vous revoir 😉"
      BackButtonLabel="Vous n'avez pas de compte ?"
      backButtonHref="/sign-up"
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
            <PinInput form={form} label="Code PIN" name="password" />
            <div className="items-start">
              <BackButton
                href="/forgot-password"
                label="Mot de passe oublié ?"
              />
            </div>
          </div>
          <FormError message={error || urlError} />
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

export const SignInForm = () => {
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  );
};
