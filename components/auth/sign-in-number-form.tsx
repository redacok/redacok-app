"use client";

import * as z from "zod";

import { signInWithNumber } from "@/app/(auth)/sign-in/actions";
import { SignInWithNumberSchema } from "@/lib/definitions";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import useNumberSignin from "@/store/sign-in-form-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
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
import { BackButton } from "./back-button";
import { CardWrapper } from "./card-wrapper";

export const SignInNumberForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const { setIsNumberSignin } = useNumberSignin();
  const ref = searchParams.get("callback") || DEFAULT_LOGIN_REDIRECT;

  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Cet email est deja utilisé avec un autre service"
      : "";

  const form = useForm<z.infer<typeof SignInWithNumberSchema>>({
    resolver: zodResolver(SignInWithNumberSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  const onSubmit = (formData: z.infer<typeof SignInWithNumberSchema>) => {
    startTransition(() => {
      signInWithNumber(formData, ref).then((data) => {
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
            <div className="flex w-full items-end">
              <Button
                size={"sm"}
                variant="link"
                onClick={() => setIsNumberSignin()}
                className="ml-auto"
              >
                Utiliser mon email
              </Button>
            </div>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de téléphone</FormLabel>
                  <FormControl>
                    <PhoneInput
                      {...field}
                      inputClassName="flex h-9 w-full border border-input bg-transparent py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      defaultCountry={"cm"}
                      placeholder="Ex: 6 56 01 24 71"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      type="password"
                      placeholder="******"
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="items-start">
                    <BackButton
                      href="/forgot-password"
                      label="Mot de passe oublié ?"
                    />
                  </div>
                </FormItem>
              )}
            />
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
